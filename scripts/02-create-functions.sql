-- Funções auxiliares para o sistema Agroderi

-- Função para gerar código único de afiliado
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Gera código no formato AGD + 6 dígitos aleatórios
        new_code := 'AGD' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Verifica se o código já existe
        SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = new_code) INTO code_exists;
        
        -- Se não existe, sair do loop
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
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
            RETURN QUERY SELECT 
                (amount * 0.05)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.03)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
        WHEN 'premium' THEN
            RETURN QUERY SELECT 
                (amount * 0.10)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.05)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
        WHEN 'vip' THEN
            RETURN QUERY SELECT 
                (amount * 0.15)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.08)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
        ELSE
            RETURN QUERY SELECT 
                (amount * 0.03)::DECIMAL as bonus,
                CASE WHEN has_affiliate THEN (amount * 0.02)::DECIMAL ELSE 0::DECIMAL END as affiliate_bonus;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar totais do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar totais quando um investimento é confirmado
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.affiliate_id IS NOT NULL THEN
        UPDATE public.affiliates 
        SET 
            total_sales = total_sales + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar totais do afiliado
CREATE TRIGGER trigger_update_affiliate_totals
    AFTER UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_totals();

-- Função para atualizar comissão total do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_commission_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando uma comissão é paga
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        UPDATE public.affiliates 
        SET 
            total_commission = total_commission + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar comissão total
CREATE TRIGGER trigger_update_affiliate_commission_total
    AFTER UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_commission_total();

-- Função para buscar estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
    total_users BIGINT,
    total_affiliates BIGINT,
    total_investments BIGINT,
    total_revenue DECIMAL,
    pending_commissions DECIMAL,
    completed_missions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
        (SELECT COUNT(*) FROM public.affiliates WHERE status = 'active') as total_affiliates,
        (SELECT COUNT(*) FROM investments WHERE status IN ('confirmed', 'completed')) as total_investments,
        (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE status IN ('confirmed', 'completed')) as total_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM commissions WHERE status = 'pending') as pending_commissions,
        (SELECT COUNT(*) FROM missions WHERE status = 'completed') as completed_missions;
END;
$$ LANGUAGE plpgsql;

-- Função para validar email
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Função para validar CPF (formato básico)
CREATE OR REPLACE FUNCTION is_valid_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove caracteres não numéricos
    cpf := REGEXP_REPLACE(cpf, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    RETURN LENGTH(cpf) = 11 AND cpf !~ '^(.)\1{10}$';
END;
$$ LANGUAGE plpgsql;

-- Função para formatar valores monetários
CREATE OR REPLACE FUNCTION format_currency(amount DECIMAL)
RETURNS TEXT AS $$
BEGIN
    RETURN 'R$ ' || TO_CHAR(amount, 'FM999G999G999D00');
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular comissão automaticamente
CREATE OR REPLACE FUNCTION calculate_commission(
    affiliate_tier TEXT,
    investment_amount DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    commission_rate DECIMAL;
    commission_amount DECIMAL;
BEGIN
    -- Definir taxa de comissão baseada no tier
    CASE affiliate_tier
        WHEN 'premium' THEN commission_rate := 0.15; -- 15%
        ELSE commission_rate := 0.10; -- 10% para standard
    END CASE;
    
    -- Calcular valor da comissão
    commission_amount := investment_amount * commission_rate;
    
    RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar total de vendas e comissões do afiliado
    UPDATE affiliates 
    SET 
        total_sales = (
            SELECT COALESCE(COUNT(*), 0) 
            FROM investments 
            WHERE affiliate_id = NEW.affiliate_id 
            AND status = 'confirmed'
        ),
        total_commission = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM commissions 
            WHERE affiliate_id = NEW.affiliate_id 
            AND status = 'paid'
        ),
        updated_at = NOW()
    WHERE id = NEW.affiliate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas quando uma comissão é paga
CREATE TRIGGER update_affiliate_stats_trigger
    AFTER INSERT OR UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats();

-- Função para gerar relatório de afiliado
CREATE OR REPLACE FUNCTION get_affiliate_report(affiliate_user_id UUID)
RETURNS TABLE (
    affiliate_code TEXT,
    total_sales BIGINT,
    total_commission DECIMAL,
    pending_commission DECIMAL,
    conversion_rate DECIMAL,
    recent_sales BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.affiliate_code,
        COUNT(i.id) as total_sales,
        COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'paid'), 0) as total_commission,
        COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'pending'), 0) as pending_commission,
        CASE 
            WHEN COUNT(i.id) > 0 THEN 
                (COUNT(i.id) FILTER (WHERE i.status = 'confirmed')::DECIMAL / COUNT(i.id)::DECIMAL) * 100
            ELSE 0
        END as conversion_rate,
        COUNT(i.id) FILTER (WHERE i.created_at >= NOW() - INTERVAL '30 days') as recent_sales
    FROM affiliates a
    LEFT JOIN investments i ON a.id = i.affiliate_id
    LEFT JOIN commissions c ON a.id = c.affiliate_id
    WHERE a.user_id = affiliate_user_id
    GROUP BY a.id, a.affiliate_code;
END;
$$ LANGUAGE plpgsql;
