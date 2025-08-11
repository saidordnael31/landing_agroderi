-- Criar tabelas para sistema de compromisso mensal duplo (tokens + tráfego)

-- Tabela de compromissos mensais
CREATE TABLE IF NOT EXISTS monthly_commitments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    monthly_amount DECIMAL(10,2) NOT NULL,
    total_months INTEGER NOT NULL DEFAULT 4,
    remaining_months INTEGER NOT NULL DEFAULT 4,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    next_payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
    traffic_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
    tokens_generated DECIMAL(15,2) NOT NULL DEFAULT 0, -- Total de tokens gerados até agora
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
    utm_source VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas de tráfego
CREATE TABLE IF NOT EXISTS traffic_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commitment_id UUID NOT NULL REFERENCES monthly_commitments(id) ON DELETE CASCADE,
    monthly_budget DECIMAL(10,2) NOT NULL,
    target_url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas diárias de tráfego
CREATE TABLE IF NOT EXISTS traffic_daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES traffic_campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL, -- google_ads, facebook_ads, instagram_ads, etc.
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    ctr DECIMAL(5,4) NOT NULL DEFAULT 0, -- Click Through Rate
    cpc DECIMAL(10,2) NOT NULL DEFAULT 0, -- Cost Per Click
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, date, platform)
);

-- Tabela de saldo de tokens dos usuários
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_tokens DECIMAL(15,2) NOT NULL DEFAULT 0,
    available_tokens DECIMAL(15,2) NOT NULL DEFAULT 0, -- Tokens disponíveis para saque
    locked_tokens DECIMAL(15,2) NOT NULL DEFAULT 0, -- Tokens em período de lock
    withdrawn_tokens DECIMAL(15,2) NOT NULL DEFAULT 0, -- Tokens já sacados
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Adicionar colunas na tabela investments se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'commitment_id') THEN
        ALTER TABLE investments ADD COLUMN commitment_id UUID REFERENCES monthly_commitments(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'is_monthly_payment') THEN
        ALTER TABLE investments ADD COLUMN is_monthly_payment BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'month_number') THEN
        ALTER TABLE investments ADD COLUMN month_number INTEGER;
    END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_monthly_commitments_user_id ON monthly_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_commitments_status ON monthly_commitments(status);
CREATE INDEX IF NOT EXISTS idx_monthly_commitments_next_payment ON monthly_commitments(next_payment_date);

CREATE INDEX IF NOT EXISTS idx_traffic_campaigns_user_id ON traffic_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_campaigns_commitment_id ON traffic_campaigns(commitment_id);
CREATE INDEX IF NOT EXISTS idx_traffic_campaigns_status ON traffic_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_traffic_daily_metrics_campaign_id ON traffic_daily_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_traffic_daily_metrics_date ON traffic_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_traffic_daily_metrics_platform ON traffic_daily_metrics(platform);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);

-- Função para processar pagamentos mensais automáticos (tokens + tráfego)
CREATE OR REPLACE FUNCTION process_monthly_payments()
RETURNS INTEGER AS $$
DECLARE
    commitment_record RECORD;
    processed_count INTEGER := 0;
    monthly_tokens DECIMAL(15,2);
    bonus_tokens DECIMAL(15,2);
BEGIN
    -- Buscar compromissos que precisam de pagamento hoje
    FOR commitment_record IN 
        SELECT mc.*, 
               CASE mc.plan_id
                   WHEN 'starter' THEN 0.10
                   WHEN 'professional' THEN 0.15
                   WHEN 'enterprise' THEN 0.20
                   WHEN 'elite' THEN 0.25
                   ELSE 0.10
               END as bonus_percent
        FROM monthly_commitments mc
        WHERE mc.status = 'active' 
        AND mc.next_payment_date::date <= CURRENT_DATE
        AND mc.remaining_months > 0
    LOOP
        -- Calcular tokens mensais com bônus
        monthly_tokens := commitment_record.monthly_amount; -- 1 token por real
        bonus_tokens := monthly_tokens * commitment_record.bonus_percent;
        
        -- Criar novo investimento para o mês
        INSERT INTO investments (
            user_id,
            plan_id,
            commitment_id,
            amount,
            bonus,
            affiliate_bonus,
            affiliate_id,
            status,
            payment_method,
            is_monthly_payment,
            month_number,
            unlock_date
        ) VALUES (
            commitment_record.user_id,
            commitment_record.plan_id,
            commitment_record.id,
            commitment_record.monthly_amount,
            bonus_tokens,
            0, -- Será calculado separadamente se houver afiliado
            commitment_record.affiliate_id,
            'confirmed', -- Auto-confirmar pagamentos automáticos
            'auto',
            TRUE,
            (commitment_record.total_months - commitment_record.remaining_months + 1),
            NOW() + INTERVAL '30 days' -- 30 dias de lock
        );

        -- Atualizar saldo de tokens do usuário
        INSERT INTO user_token_balances (user_id, total_tokens, locked_tokens)
        VALUES (
            commitment_record.user_id,
            monthly_tokens + bonus_tokens,
            monthly_tokens + bonus_tokens
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
            total_tokens = user_token_balances.total_tokens + monthly_tokens + bonus_tokens,
            locked_tokens = user_token_balances.locked_tokens + monthly_tokens + bonus_tokens,
            last_updated = NOW();

        -- Atualizar compromisso
        UPDATE monthly_commitments 
        SET 
            remaining_months = remaining_months - 1,
            next_payment_date = CASE 
                WHEN remaining_months - 1 > 0 THEN next_payment_date + INTERVAL '30 days'
                ELSE NULL
            END,
            status = CASE 
                WHEN remaining_months - 1 <= 0 THEN 'completed'
                ELSE 'active'
            END,
            tokens_generated = tokens_generated + monthly_tokens + bonus_tokens,
            updated_at = NOW()
        WHERE id = commitment_record.id;

        processed_count := processed_count + 1;
    END LOOP;

    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Função para liberar tokens após período de lock
CREATE OR REPLACE FUNCTION unlock_tokens()
RETURNS INTEGER AS $$
DECLARE
    investment_record RECORD;
    unlocked_count INTEGER := 0;
    tokens_to_unlock DECIMAL(15,2);
BEGIN
    -- Buscar investimentos que devem ter tokens liberados
    FOR investment_record IN 
        SELECT i.*, (i.amount + i.bonus) as total_tokens
        FROM investments i
        WHERE i.status = 'confirmed'
        AND i.unlock_date::date <= CURRENT_DATE
        AND i.is_monthly_payment = TRUE
    LOOP
        tokens_to_unlock := investment_record.total_tokens;
        
        -- Atualizar saldo de tokens do usuário
        UPDATE user_token_balances 
        SET 
            available_tokens = available_tokens + tokens_to_unlock,
            locked_tokens = locked_tokens - tokens_to_unlock,
            last_updated = NOW()
        WHERE user_id = investment_record.user_id;

        -- Marcar investimento como completed
        UPDATE investments 
        SET status = 'completed'
        WHERE id = investment_record.id;

        unlocked_count := unlocked_count + 1;
    END LOOP;

    RETURN unlocked_count;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar métricas de tráfego
CREATE OR REPLACE FUNCTION update_traffic_metrics(
    p_campaign_id UUID,
    p_platform VARCHAR(50),
    p_impressions INTEGER,
    p_clicks INTEGER,
    p_conversions INTEGER,
    p_spent DECIMAL(10,2)
)
RETURNS VOID AS $$
BEGIN
    -- Inserir ou atualizar métricas diárias
    INSERT INTO traffic_daily_metrics (
        campaign_id,
        date,
        platform,
        impressions,
        clicks,
        conversions,
        spent,
        ctr,
        cpc
    ) VALUES (
        p_campaign_id,
        CURRENT_DATE,
        p_platform,
        p_impressions,
        p_clicks,
        p_conversions,
        p_spent,
        CASE WHEN p_impressions > 0 THEN (p_clicks::DECIMAL / p_impressions::DECIMAL) * 100 ELSE 0 END,
        CASE WHEN p_clicks > 0 THEN p_spent / p_clicks ELSE 0 END
    )
    ON CONFLICT (campaign_id, date, platform)
    DO UPDATE SET
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        spent = EXCLUDED.spent,
        ctr = EXCLUDED.ctr,
        cpc = EXCLUDED.cpc;

    -- Atualizar totais na campanha
    UPDATE traffic_campaigns 
    SET 
        impressions = (
            SELECT COALESCE(SUM(impressions), 0) 
            FROM traffic_daily_metrics 
            WHERE campaign_id = p_campaign_id
        ),
        clicks = (
            SELECT COALESCE(SUM(clicks), 0) 
            FROM traffic_daily_metrics 
            WHERE campaign_id = p_campaign_id
        ),
        conversions = (
            SELECT COALESCE(SUM(conversions), 0) 
            FROM traffic_daily_metrics 
            WHERE campaign_id = p_campaign_id
        ),
        spent = (
            SELECT COALESCE(SUM(spent), 0) 
            FROM traffic_daily_metrics 
            WHERE campaign_id = p_campaign_id
        ),
        updated_at = NOW()
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular ROI combinado (tokens + tráfego)
CREATE OR REPLACE FUNCTION calculate_dual_roi(p_commitment_id UUID)
RETURNS TABLE(
    total_invested DECIMAL(10,2),
    total_tokens DECIMAL(15,2),
    token_current_value DECIMAL(10,2),
    token_projected_value DECIMAL(10,2),
    traffic_spent DECIMAL(10,2),
    traffic_conversions INTEGER,
    estimated_commissions DECIMAL(10,2),
    total_roi_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.monthly_amount * (mc.total_months - mc.remaining_months) as total_invested,
        mc.tokens_generated as total_tokens,
        mc.tokens_generated * 1.0 as token_current_value, -- Assumindo R$ 1 por token
        mc.tokens_generated * 2.2 as token_projected_value, -- Projeção 12 meses
        tc.spent as traffic_spent,
        tc.conversions as traffic_conversions,
        (tc.conversions * 150.00) as estimated_commissions, -- R$ 150 por conversão
        CASE 
            WHEN (mc.monthly_amount * (mc.total_months - mc.remaining_months)) > 0 THEN
                (((mc.tokens_generated * 2.2) + (tc.conversions * 150.00) - (mc.monthly_amount * (mc.total_months - mc.remaining_months))) 
                / (mc.monthly_amount * (mc.total_months - mc.remaining_months))) * 100
            ELSE 0 
        END as total_roi_percentage
    FROM monthly_commitments mc
    LEFT JOIN traffic_campaigns tc ON tc.commitment_id = mc.id
    WHERE mc.id = p_commitment_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers nas tabelas
DROP TRIGGER IF EXISTS update_monthly_commitments_updated_at ON monthly_commitments;
CREATE TRIGGER update_monthly_commitments_updated_at
    BEFORE UPDATE ON monthly_commitments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_traffic_campaigns_updated_at ON traffic_campaigns;
CREATE TRIGGER update_traffic_campaigns_updated_at
    BEFORE UPDATE ON traffic_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_token_balances_updated_at ON user_token_balances;
CREATE TRIGGER update_user_token_balances_updated_at
    BEFORE UPDATE ON user_token_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir saldos iniciais de tokens para usuários existentes
INSERT INTO user_token_balances (user_id, total_tokens, available_tokens, locked_tokens)
SELECT 
    u.id,
    0,
    0,
    0
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_token_balances utb WHERE utb.user_id = u.id
);

-- Comentários para documentação
COMMENT ON TABLE monthly_commitments IS 'Compromissos mensais duplos: tokens AGD + tráfego pago';
COMMENT ON TABLE traffic_campaigns IS 'Campanhas de tráfego pago vinculadas aos compromissos';
COMMENT ON TABLE traffic_daily_metrics IS 'Métricas diárias detalhadas por plataforma de tráfego';
COMMENT ON TABLE user_token_balances IS 'Saldos de tokens AGD dos usuários';

COMMENT ON FUNCTION process_monthly_payments() IS 'Processa pagamentos mensais automáticos gerando tokens e mantendo tráfego';
COMMENT ON FUNCTION unlock_tokens() IS 'Libera tokens após período de lock de 30 dias';
COMMENT ON FUNCTION update_traffic_metrics(UUID, VARCHAR, INTEGER, INTEGER, INTEGER, DECIMAL) IS 'Atualiza métricas de tráfego para uma campanha específica';
COMMENT ON FUNCTION calculate_dual_roi(UUID) IS 'Calcula ROI combinado de tokens + tráfego para um compromisso';

-- Verificar se as tabelas foram criadas corretamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'monthly_commitments') THEN
        RAISE NOTICE 'Tabela monthly_commitments criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'traffic_campaigns') THEN
        RAISE NOTICE 'Tabela traffic_campaigns criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'traffic_daily_metrics') THEN
        RAISE NOTICE 'Tabela traffic_daily_metrics criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_token_balances') THEN
        RAISE NOTICE 'Tabela user_token_balances criada com sucesso';
    END IF;
END $$;
