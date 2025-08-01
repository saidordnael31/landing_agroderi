-- Sistema completo de afiliados AGD
-- Baseado na documentação fornecida

-- 1. Criar tabela de vendas (sales) para rastrear todas as vendas
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    affiliate_id UUID REFERENCES affiliates(id),
    investment_id UUID REFERENCES investments(id),
    sale_amount DECIMAL(15,2) NOT NULL,
    commission_direct DECIMAL(15,2) DEFAULT 0, -- 7% comissão direta
    commission_leader DECIMAL(15,2) DEFAULT 0, -- 3% comissão líder
    leader_affiliate_id UUID REFERENCES affiliates(id), -- Afiliado que indicou o vendedor
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de pagamentos em USDT
CREATE TABLE IF NOT EXISTS affiliate_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
    amount_usdt DECIMAL(15,2) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255), -- Hash da transação USDT
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
    payment_method VARCHAR(50) DEFAULT 'USDT',
    reference_code VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de bônus por performance
CREATE TABLE IF NOT EXISTS affiliate_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
    tier_achieved VARCHAR(20) NOT NULL CHECK (tier_achieved IN ('iniciante', 'avancado', 'expert', 'embaixador')),
    volume_threshold DECIMAL(15,2) NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    bonus_type VARCHAR(50) NOT NULL, -- 'percentage', 'nft', 'whitelist', 'upgrade'
    bonus_description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired'))
);

-- 4. Adicionar colunas necessárias na tabela affiliates
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES affiliates(id), -- Para sistema de 2 níveis
ADD COLUMN IF NOT EXISTS total_volume DECIMAL(15,2) DEFAULT 0, -- Volume total de vendas
ADD COLUMN IF NOT EXISTS direct_sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS leader_sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255), -- Para pagamentos USDT
ADD COLUMN IF NOT EXISTS current_tier VARCHAR(20) DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS commission_rate_direct DECIMAL(5,4) DEFAULT 0.07, -- 7%
ADD COLUMN IF NOT EXISTS commission_rate_leader DECIMAL(5,4) DEFAULT 0.03; -- 3%

-- 5. Atualizar tabela de cliques para melhor tracking
ALTER TABLE affiliate_clicks 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT,
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conversion_value DECIMAL(15,2) DEFAULT 0;

-- 6. Função para calcular comissões automaticamente
CREATE OR REPLACE FUNCTION calculate_affiliate_commissions(
    p_sale_amount DECIMAL,
    p_affiliate_id UUID,
    p_investment_id UUID,
    p_customer_id UUID
) RETURNS JSON AS $$
DECLARE
    v_affiliate RECORD;
    v_leader RECORD;
    v_commission_direct DECIMAL(15,2);
    v_commission_leader DECIMAL(15,2);
    v_sale_id UUID;
    v_result JSON;
BEGIN
    -- Buscar dados do afiliado direto
    SELECT * INTO v_affiliate 
    FROM affiliates 
    WHERE id = p_affiliate_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Afiliado não encontrado');
    END IF;
    
    -- Calcular comissão direta (7%)
    v_commission_direct := p_sale_amount * v_affiliate.commission_rate_direct;
    
    -- Buscar líder (se houver) para comissão de 2º nível (3%)
    v_commission_leader := 0;
    IF v_affiliate.leader_id IS NOT NULL THEN
        SELECT * INTO v_leader 
        FROM affiliates 
        WHERE id = v_affiliate.leader_id AND status = 'active';
        
        IF FOUND THEN
            v_commission_leader := p_sale_amount * v_leader.commission_rate_leader;
        END IF;
    END IF;
    
    -- Criar registro de venda
    INSERT INTO sales (
        customer_id,
        affiliate_id,
        investment_id,
        sale_amount,
        commission_direct,
        commission_leader,
        leader_affiliate_id,
        status
    ) VALUES (
        p_customer_id,
        p_affiliate_id,
        p_investment_id,
        p_sale_amount,
        v_commission_direct,
        v_commission_leader,
        v_affiliate.leader_id,
        'confirmed'
    ) RETURNING id INTO v_sale_id;
    
    -- Atualizar estatísticas do afiliado direto
    UPDATE affiliates SET
        total_sales = total_sales + 1,
        total_commission = total_commission + v_commission_direct,
        total_volume = total_volume + p_sale_amount,
        direct_sales_count = direct_sales_count + 1,
        updated_at = NOW()
    WHERE id = p_affiliate_id;
    
    -- Atualizar estatísticas do líder (se houver)
    IF v_affiliate.leader_id IS NOT NULL AND v_commission_leader > 0 THEN
        UPDATE affiliates SET
            total_commission = total_commission + v_commission_leader,
            leader_sales_count = leader_sales_count + 1,
            updated_at = NOW()
        WHERE id = v_affiliate.leader_id;
    END IF;
    
    -- Marcar clique como convertido
    UPDATE affiliate_clicks SET
        converted = TRUE,
        conversion_value = p_sale_amount,
        updated_at = NOW()
    WHERE affiliate_id = p_affiliate_id 
    AND created_at >= NOW() - INTERVAL '48 hours'
    AND converted = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Verificar bônus por performance
    PERFORM check_affiliate_tier_bonus(p_affiliate_id);
    
    v_result := json_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'commission_direct', v_commission_direct,
        'commission_leader', v_commission_leader,
        'affiliate_id', p_affiliate_id,
        'leader_id', v_affiliate.leader_id
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para verificar e aplicar bônus por tier
CREATE OR REPLACE FUNCTION check_affiliate_tier_bonus(p_affiliate_id UUID) RETURNS VOID AS $$
DECLARE
    v_affiliate RECORD;
    v_volume DECIMAL(15,2);
    v_new_tier VARCHAR(20);
    v_bonus_amount DECIMAL(15,2);
    v_bonus_type VARCHAR(50);
    v_bonus_desc TEXT;
BEGIN
    -- Buscar dados atuais do afiliado
    SELECT * INTO v_affiliate FROM affiliates WHERE id = p_affiliate_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    v_volume := v_affiliate.total_volume;
    
    -- Determinar novo tier baseado no volume
    IF v_volume >= 50000 THEN -- $50,000 - Embaixador
        v_new_tier := 'embaixador';
        v_bonus_amount := 0; -- Bônus é upgrade de comissão para 10%
        v_bonus_type := 'commission_upgrade';
        v_bonus_desc := 'Comissão direta elevada para 10% + acesso VIP';
        
        -- Atualizar taxa de comissão
        UPDATE affiliates SET 
            commission_rate_direct = 0.10,
            current_tier = v_new_tier
        WHERE id = p_affiliate_id;
        
    ELSIF v_volume >= 25000 THEN -- $25,000 - Expert
        v_new_tier := 'expert';
        v_bonus_amount := v_volume * 0.05; -- +5% bônus único
        v_bonus_type := 'percentage_bonus';
        v_bonus_desc := 'Bônus único de 5% + whitelist vendas privadas';
        
    ELSIF v_volume >= 10000 THEN -- $10,000 - Avançado
        v_new_tier := 'avancado';
        v_bonus_amount := 0; -- Bônus é NFT
        v_bonus_type := 'nft_reward';
        v_bonus_desc := 'NFT Founder AGD + benefícios exclusivos';
        
    ELSIF v_volume >= 5000 THEN -- $5,000 - Iniciante
        v_new_tier := 'iniciante';
        v_bonus_amount := v_volume * 0.02; -- +2% bônus único
        v_bonus_type := 'percentage_bonus';
        v_bonus_desc := 'Bônus único de 2% sobre volume total';
    ELSE
        RETURN; -- Não atingiu nenhum tier
    END IF;
    
    -- Verificar se já recebeu este bônus
    IF NOT EXISTS (
        SELECT 1 FROM affiliate_bonuses 
        WHERE affiliate_id = p_affiliate_id 
        AND tier_achieved = v_new_tier
    ) THEN
        -- Inserir novo bônus
        INSERT INTO affiliate_bonuses (
            affiliate_id,
            tier_achieved,
            volume_threshold,
            bonus_amount,
            bonus_type,
            bonus_description
        ) VALUES (
            p_affiliate_id,
            v_new_tier,
            v_volume,
            v_bonus_amount,
            v_bonus_type,
            v_bonus_desc
        );
        
        -- Atualizar tier do afiliado
        UPDATE affiliates SET 
            current_tier = v_new_tier,
            updated_at = NOW()
        WHERE id = p_affiliate_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para processar pagamentos semanais
CREATE OR REPLACE FUNCTION process_weekly_payments() RETURNS JSON AS $$
DECLARE
    v_affiliate RECORD;
    v_total_pending DECIMAL(15,2);
    v_payment_id UUID;
    v_processed_count INTEGER := 0;
    v_total_amount DECIMAL(15,2) := 0;
BEGIN
    -- Processar pagamentos para afiliados com saldo >= $50
    FOR v_affiliate IN 
        SELECT 
            a.id,
            a.affiliate_code,
            a.wallet_address,
            a.total_commission,
            COALESCE(SUM(ap.amount_usdt), 0) as paid_amount
        FROM affiliates a
        LEFT JOIN affiliate_payments ap ON ap.affiliate_id = a.id AND ap.status = 'paid'
        WHERE a.status = 'active' 
        AND a.wallet_address IS NOT NULL
        GROUP BY a.id, a.affiliate_code, a.wallet_address, a.total_commission
        HAVING (a.total_commission - COALESCE(SUM(ap.amount_usdt), 0)) >= 50
    LOOP
        v_total_pending := v_affiliate.total_commission - v_affiliate.paid_amount;
        
        -- Criar registro de pagamento
        INSERT INTO affiliate_payments (
            affiliate_id,
            amount_usdt,
            wallet_address,
            reference_code,
            status
        ) VALUES (
            v_affiliate.id,
            v_total_pending,
            v_affiliate.wallet_address,
            'PAY-' || v_affiliate.affiliate_code || '-' || TO_CHAR(NOW(), 'YYYYMMDD'),
            'pending'
        ) RETURNING id INTO v_payment_id;
        
        v_processed_count := v_processed_count + 1;
        v_total_amount := v_total_amount + v_total_pending;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'processed_count', v_processed_count,
        'total_amount', v_total_amount
    );
END;
$$ LANGUAGE plpgsql;

-- 9. Índices para performance
CREATE INDEX IF NOT EXISTS idx_sales_affiliate_id ON sales(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate_id ON affiliate_payments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payments_status ON affiliate_payments(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_bonuses_affiliate_id ON affiliate_bonuses(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);

-- 10. Triggers para atualização automática
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_payments_updated_at BEFORE UPDATE ON affiliate_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Inserir dados de exemplo para teste
INSERT INTO affiliates (user_id, affiliate_code, status, wallet_address, current_tier) 
SELECT 
    u.id,
    'AGD' || LPAD((ROW_NUMBER() OVER())::TEXT, 5, '0'),
    'active',
    '0x' || MD5(u.email || 'wallet'),
    'bronze'
FROM users u 
WHERE u.role = 'affiliate'
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
