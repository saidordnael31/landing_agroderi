-- Adicionar campos para planos e compromissos na tabela affiliates
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    affiliate_code TEXT UNIQUE NOT NULL,
    phone TEXT,
    cpf TEXT,
    experience TEXT,
    channels JSONB,
    motivation TEXT,
    tier TEXT,
    status TEXT,
    total_sales NUMERIC DEFAULT 0,
    total_commission NUMERIC DEFAULT 0,
    commission_rate NUMERIC DEFAULT 0,
    selected_plan TEXT,
    monthly_commitment NUMERIC,
    commitment_months INTEGER,
    monthly_tokens NUMERIC,
    traffic_budget NUMERIC,
    target_url TEXT,
    registration_type TEXT,
    marketing_experience TEXT,
    commitment_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários para documentar os novos campos
COMMENT ON COLUMN affiliates.selected_plan IS 'Plano escolhido: starter, professional, enterprise, elite';
COMMENT ON COLUMN affiliates.monthly_commitment IS 'Valor do compromisso mensal em reais';
COMMENT ON COLUMN affiliates.commitment_months IS 'Número de meses do compromisso (padrão 4)';
COMMENT ON COLUMN affiliates.monthly_tokens IS 'Tokens recebidos por mês';
COMMENT ON COLUMN affiliates.traffic_budget IS 'Orçamento mensal para tráfego pago';
COMMENT ON COLUMN affiliates.target_url IS 'URL de destino para o tráfego (link de afiliado)';
COMMENT ON COLUMN affiliates.registration_type IS 'Tipo: standard (só afiliado) ou commitment (afiliado + compromisso)';
COMMENT ON COLUMN affiliates.marketing_experience IS 'Experiência em marketing descrita pelo usuário';
COMMENT ON COLUMN affiliates.commitment_status IS 'Status do compromisso: pending, active, paused, cancelled, completed';

-- Atualizar constraint do tier para incluir novos valores baseados nos planos
ALTER TABLE affiliates DROP CONSTRAINT IF EXISTS affiliates_tier_check;
ALTER TABLE affiliates ADD CONSTRAINT affiliates_tier_check
CHECK (tier IN ('standard', 'premium', 'starter', 'professional', 'enterprise', 'elite'));

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_selected_plan ON affiliates(selected_plan);
CREATE INDEX IF NOT EXISTS idx_affiliates_registration_type ON affiliates(registration_type);
CREATE INDEX IF NOT EXISTS idx_affiliates_commitment_status ON affiliates(commitment_status);

-- Adicionar função para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para a tabela affiliates
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_affiliates_updated_at') THEN
        CREATE TRIGGER set_affiliates_updated_at
        BEFORE UPDATE ON affiliates
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
