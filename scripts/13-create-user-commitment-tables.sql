-- Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    cpf VARCHAR(14),
    password_hash VARCHAR(255) NOT NULL,
    marketing_experience TEXT,
    marketing_channels TEXT[],
    motivation TEXT,
    affiliate_link TEXT,
    user_type VARCHAR(20) DEFAULT 'investor',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de compromissos mensais
CREATE TABLE IF NOT EXISTS monthly_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL,
    monthly_amount DECIMAL(10,2) NOT NULL,
    monthly_tokens INTEGER NOT NULL,
    traffic_budget DECIMAL(10,2) NOT NULL,
    commitment_months INTEGER DEFAULT 4,
    current_month INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending_payment',
    affiliate_code VARCHAR(50),
    next_payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS commitment_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID REFERENCES monthly_commitments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tokens_amount INTEGER NOT NULL,
    traffic_budget DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de saldos de tokens
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_tokens INTEGER DEFAULT 0,
    locked_tokens INTEGER DEFAULT 0,
    available_tokens INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de tokens
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES monthly_commitments(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'received', 'unlocked', 'withdrawn'
    amount INTEGER NOT NULL,
    lock_until DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de campanhas de tráfego
CREATE TABLE IF NOT EXISTS traffic_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES monthly_commitments(id),
    month_number INTEGER NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    target_url TEXT,
    campaign_status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_monthly_commitments_user_id ON monthly_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitment_payments_commitment_id ON commitment_payments(commitment_id);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON user_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_campaigns_user_id ON traffic_campaigns(user_id);

-- Função para processar pagamento mensal
CREATE OR REPLACE FUNCTION process_monthly_payment(
    p_commitment_id UUID,
    p_payment_id VARCHAR(255),
    p_payment_method VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    v_commitment monthly_commitments%ROWTYPE;
    v_user_id UUID;
    v_month_number INTEGER;
    v_lock_date DATE;
BEGIN
    -- Buscar compromisso
    SELECT * INTO v_commitment FROM monthly_commitments WHERE id = p_commitment_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    v_user_id := v_commitment.user_id;
    v_month_number := v_commitment.current_month + 1;
    v_lock_date := CURRENT_DATE + INTERVAL '30 days';
    
    -- Registrar pagamento
    INSERT INTO commitment_payments (
        commitment_id,
        user_id,
        month_number,
        amount,
        tokens_amount,
        traffic_budget,
        payment_status,
        payment_method,
        payment_id,
        paid_at
    ) VALUES (
        p_commitment_id,
        v_user_id,
        v_month_number,
        v_commitment.monthly_amount,
        v_commitment.monthly_tokens,
        v_commitment.traffic_budget,
        'completed',
        p_payment_method,
        p_payment_id,
        NOW()
    );
    
    -- Adicionar tokens (com lock de 30 dias)
    INSERT INTO token_transactions (
        user_id,
        commitment_id,
        transaction_type,
        amount,
        lock_until,
        description
    ) VALUES (
        v_user_id,
        p_commitment_id,
        'received',
        v_commitment.monthly_tokens,
        v_lock_date,
        'Tokens recebidos - Mês ' || v_month_number
    );
    
    -- Atualizar saldo de tokens
    INSERT INTO user_token_balances (user_id, total_tokens, locked_tokens, available_tokens)
    VALUES (v_user_id, v_commitment.monthly_tokens, v_commitment.monthly_tokens, 0)
    ON CONFLICT (user_id) DO UPDATE SET
        total_tokens = user_token_balances.total_tokens + v_commitment.monthly_tokens,
        locked_tokens = user_token_balances.locked_tokens + v_commitment.monthly_tokens,
        last_updated = NOW();
    
    -- Criar campanha de tráfego
    INSERT INTO traffic_campaigns (
        user_id,
        commitment_id,
        month_number,
        budget,
        target_url,
        campaign_status
    ) VALUES (
        v_user_id,
        p_commitment_id,
        v_month_number,
        v_commitment.traffic_budget,
        (SELECT affiliate_link FROM users WHERE id = v_user_id),
        'pending'
    );
    
    -- Atualizar compromisso
    UPDATE monthly_commitments SET
        current_month = v_month_number,
        next_payment_date = CASE 
            WHEN v_month_number < commitment_months THEN CURRENT_DATE + INTERVAL '1 month'
            ELSE NULL
        END,
        status = CASE 
            WHEN v_month_number >= commitment_months THEN 'completed'
            ELSE 'active'
        END,
        updated_at = NOW()
    WHERE id = p_commitment_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para liberar tokens após período de lock
CREATE OR REPLACE FUNCTION unlock_tokens() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_transaction RECORD;
BEGIN
    -- Buscar tokens que podem ser liberados
    FOR v_transaction IN 
        SELECT user_id, SUM(amount) as unlock_amount
        FROM token_transactions 
        WHERE transaction_type = 'received' 
        AND lock_until <= CURRENT_DATE
        AND id NOT IN (
            SELECT DISTINCT commitment_id 
            FROM token_transactions 
            WHERE transaction_type = 'unlocked'
        )
        GROUP BY user_id
    LOOP
        -- Registrar desbloqueio
        INSERT INTO token_transactions (
            user_id,
            transaction_type,
            amount,
            description
        ) VALUES (
            v_transaction.user_id,
            'unlocked',
            v_transaction.unlock_amount,
            'Tokens desbloqueados após período de lock'
        );
        
        -- Atualizar saldo
        UPDATE user_token_balances SET
            locked_tokens = locked_tokens - v_transaction.unlock_amount,
            available_tokens = available_tokens + v_transaction.unlock_amount,
            last_updated = NOW()
        WHERE user_id = v_transaction.user_id;
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_commitments_updated_at BEFORE UPDATE ON monthly_commitments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (opcional)
INSERT INTO users (name, email, phone, user_type, status) VALUES
('João Silva', 'joao@exemplo.com', '(11) 99999-9999', 'investor', 'active'),
('Maria Santos', 'maria@exemplo.com', '(11) 88888-8888', 'investor', 'active')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE monthly_commitments IS 'Compromissos mensais de investimento';
COMMENT ON TABLE commitment_payments IS 'Histórico de pagamentos dos compromissos';
COMMENT ON TABLE user_token_balances IS 'Saldos de tokens dos usuários';
COMMENT ON TABLE token_transactions IS 'Histórico de transações de tokens';
COMMENT ON TABLE traffic_campaigns IS 'Campanhas de tráfego pago';
