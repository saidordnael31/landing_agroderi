-- Funções e triggers para o banco de dados

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at 
    BEFORE UPDATE ON affiliates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at 
    BEFORE UPDATE ON investments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commissions_updated_at ON commissions;
CREATE TRIGGER update_commissions_updated_at 
    BEFORE UPDATE ON commissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
CREATE TRIGGER update_missions_updated_at 
    BEFORE UPDATE ON missions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Gerar código: AGD + 6 dígitos aleatórios
        new_code := 'AGD' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = new_code) INTO code_exists;
        
        -- Se não existe, retornar o código
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular comissões automaticamente
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
DECLARE
    commission_amount DECIMAL(12,2);
    commission_percentage DECIMAL(5,2) := 7.00; -- 7% de comissão
BEGIN
    -- Se há afiliado e o investimento foi confirmado
    IF NEW.affiliate_id IS NOT NULL AND NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        commission_amount := NEW.amount * (commission_percentage / 100);
        
        -- Inserir comissão
        INSERT INTO commissions (
            affiliate_id,
            investment_id,
            amount,
            percentage,
            status,
            generated_at
        ) VALUES (
            NEW.affiliate_id,
            NEW.id,
            commission_amount,
            commission_percentage,
            'pending',
            NOW()
        );
        
        -- Atualizar totais do afiliado
        UPDATE affiliates 
        SET 
            total_sales = total_sales + NEW.amount,
            total_commission = total_commission + commission_amount
        WHERE id = NEW.affiliate_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular comissões automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_commission ON investments;
CREATE TRIGGER trigger_calculate_commission
    AFTER UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION calculate_commission();
