-- Adicionar coluna total_clicks na tabela affiliates
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;

-- Atualizar valores existentes com dados de exemplo
UPDATE affiliates 
SET total_clicks = FLOOR(RANDOM() * 100 + 10)
WHERE total_clicks = 0;

-- Criar tabela de cliques para tracking detalhado
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  affiliate_code VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  page_destination VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);

-- Função para incrementar cliques
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(affiliate_code_param VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliates 
  SET total_clicks = total_clicks + 1,
      updated_at = NOW()
  WHERE affiliate_code = affiliate_code_param;
END;
$$ LANGUAGE plpgsql;

-- Inserir alguns cliques de exemplo
INSERT INTO affiliate_clicks (affiliate_id, affiliate_code, utm_source, utm_medium, page_destination)
SELECT 
  a.id,
  a.affiliate_code,
  'affiliate',
  'referral',
  CASE WHEN random() > 0.5 THEN 'ofertas' ELSE 'missao' END
FROM affiliates a
CROSS JOIN generate_series(1, 5);

COMMIT;
