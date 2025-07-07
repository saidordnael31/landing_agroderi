-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_code BOOLEAN;
BEGIN
    LOOP
        -- Gerar código de 8 caracteres (letras maiúsculas e números)
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO exists_code;
        
        -- Se não existe, retornar o código
        IF NOT exists_code THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular bônus de investimento
CREATE OR REPLACE FUNCTION calculate_investment_bonus(
    plan_id TEXT,
    amount DECIMAL,
    has_affiliate BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(bonus DECIMAL, affiliate_bonus DECIMAL) AS $$
BEGIN
    CASE plan_id
        WHEN 'starter' THEN
            -- Plano Starter: 5% de bônus
            RETURN QUERY SELECT 
                (amount * 0.05)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.03)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
        
        WHEN 'premium' THEN
            -- Plano Premium: 10% de bônus
            RETURN QUERY SELECT 
                (amount * 0.10)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.05)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
        
        WHEN 'vip' THEN
            -- Plano VIP: 15% de bônus
            RETURN QUERY SELECT 
                (amount * 0.15)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.08)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
        
        ELSE
            -- Plano padrão: 3% de bônus
            RETURN QUERY SELECT 
                (amount * 0.03)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.02)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar totais do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_totals(affiliate_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE affiliates SET
        total_sales = (
            SELECT COALESCE(SUM(amount), 0)
            FROM investments 
            WHERE affiliate_id = affiliate_uuid AND status IN ('confirmed', 'completed')
        ),
        total_commission = (
            SELECT COALESCE(SUM(amount), 0)
            FROM commissions 
            WHERE affiliate_id = affiliate_uuid AND status = 'paid'
        ),
        updated_at = NOW()
    WHERE id = affiliate_uuid;
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

-- Aplicar trigger em todas as tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commissions_updated_at ON commissions;
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar comissão automaticamente
CREATE OR REPLACE FUNCTION create_commission_on_investment()
RETURNS TRIGGER AS $$
DECLARE
    commission_amount DECIMAL;
    commission_percentage DECIMAL;
BEGIN
    -- Só criar comissão se tem afiliado e investimento foi confirmado
    IF NEW.affiliate_id IS NOT NULL AND NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        
        -- Calcular percentual baseado no valor
        IF NEW.amount >= 5000 THEN
            commission_percentage := 8.0; -- 8% para investimentos acima de R$5000
        ELSIF NEW.amount >= 1000 THEN
            commission_percentage := 5.0; -- 5% para investimentos acima de R$1000
        ELSE
            commission_percentage := 3.0; -- 3% para investimentos menores
        END IF;
        
        commission_amount := NEW.amount * (commission_percentage / 100);
        
        -- Inserir comissão
        INSERT INTO commissions (affiliate_id, investment_id, amount, percentage, status)
        VALUES (NEW.affiliate_id, NEW.id, commission_amount, commission_percentage, 'pending');
        
        -- Atualizar totais do afiliado
        PERFORM update_affiliate_totals(NEW.affiliate_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar comissão automaticamente
DROP TRIGGER IF EXISTS create_commission_trigger ON investments;
CREATE TRIGGER create_commission_trigger 
    AFTER INSERT OR UPDATE ON investments 
    FOR EACH ROW EXECUTE FUNCTION create_commission_on_investment();
