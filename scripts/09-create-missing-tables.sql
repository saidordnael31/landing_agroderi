-- Criar tabelas que faltam para o sistema de afiliados funcionar completamente

-- Tabela de vendas/comissões se não existir
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  sale_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  commission DECIMAL(10,2) NOT NULL DEFAULT 0,
  product_name VARCHAR(255) DEFAULT 'AGD Token',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamentos de afiliados se não existir
CREATE TABLE IF NOT EXISTS affiliate_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'PIX',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  reference VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna total_clicks se não existir
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar total de vendas e comissões
  UPDATE affiliates 
  SET 
    total_sales = (
      SELECT COALESCE(COUNT(*), 0) 
      FROM investments 
      WHERE affiliate_id = NEW.affiliate_id AND status = 'confirmed'
    ),
    total_commission = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM commissions 
      WHERE affiliate_id = NEW.affiliate_id AND status = 'paid'
    ),
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar estatísticas automaticamente
DROP TRIGGER IF EXISTS update_affiliate_stats_on_investment ON investments;
CREATE TRIGGER update_affiliate_stats_on_investment
  AFTER INSERT OR UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

DROP TRIGGER IF EXISTS update_affiliate_stats_on_commission ON commissions;
CREATE TRIGGER update_affiliate_stats_on_commission
  AFTER INSERT OR UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Inserir dados de exemplo para teste
INSERT INTO sales (affiliate_id, customer_name, customer_email, sale_value, commission, status)
SELECT 
  a.id,
  'Cliente Teste ' || (random() * 100)::int,
  'cliente' || (random() * 1000)::int || '@email.com',
  (random() * 5000 + 500)::decimal(10,2),
  (random() * 250 + 25)::decimal(10,2),
  CASE WHEN random() > 0.3 THEN 'paid' ELSE 'pending' END
FROM affiliates a
LIMIT 5;

-- Inserir pagamentos de exemplo
INSERT INTO affiliate_payments (affiliate_id, amount, status, reference, paid_at)
SELECT 
  a.id,
  (random() * 1000 + 100)::decimal(10,2),
  'paid',
  'PAY-' || substr(gen_random_uuid()::text, 1, 8),
  NOW() - (random() * 30 || ' days')::interval
FROM affiliates a
LIMIT 3;

COMMIT;
