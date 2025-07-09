-- Dados de exemplo para testes (OPCIONAL - não execute se não quiser dados de teste)

-- Inserir usuários de teste
INSERT INTO users (name, email, phone, role, status) VALUES
('Admin Agroderi', 'admin@agroderi.com', '+5511999999999', 'admin', 'active'),
('Viewer Agroderi', 'viewer@agroderi.com', '+5511888888888', 'viewer', 'active'),
('Afiliado Teste', 'afiliado1@gmail.com', '+5511777777777', 'affiliate', 'active')
ON CONFLICT (email) DO NOTHING;

-- Inserir afiliados de teste
INSERT INTO affiliates (user_id, affiliate_code, tier, experience, channels, motivation, status)
SELECT 
    u.id,
    'AGD12345',
    'standard',
    'intermediario',
    ARRAY['instagram', 'whatsapp'],
    'Quero ganhar dinheiro extra',
    'active'
FROM users u 
WHERE u.email = 'afiliado1@gmail.com'
ON CONFLICT (affiliate_code) DO NOTHING;

-- Inserir alguns investimentos de exemplo
INSERT INTO investments (user_id, plan_id, amount, bonus, status, payment_method)
SELECT 
    u.id,
    'plano-basico',
    1000.00,
    100.00,
    'confirmed',
    'pix'
FROM users u 
WHERE u.email = 'admin@agroderi.com';

INSERT INTO investments (user_id, plan_id, amount, bonus, affiliate_id, status, payment_method)
SELECT 
    u.id,
    'plano-premium',
    5000.00,
    1000.00,
    a.id,
    'confirmed',
    'pix'
FROM users u, affiliates a
WHERE u.email = 'viewer@agroderi.com' 
AND a.affiliate_code = 'AGD12345';

-- Inserir uma missão de exemplo
INSERT INTO missions (user_email, wallet_address, steps_completed, status, reward_amount)
VALUES 
('teste@gmail.com', '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87', 
 '[{"step": "instagram", "completed": true, "completed_at": "2024-01-15T10:00:00Z"}]',
 'pending', 50.00);
