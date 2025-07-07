-- Dados de exemplo para desenvolvimento e testes

-- Inserir usuários de exemplo
INSERT INTO users (email, name, phone, cpf, role, status) VALUES
('admin@agroderi.com', 'Administrador', '11999999999', '12345678901', 'admin', 'active'),
('viewer@agroderi.com', 'Visualizador', '11888888888', '12345678902', 'viewer', 'active'),
('afiliado1@gmail.com', 'João Silva', '11777777777', '12345678903', 'affiliate', 'active'),
('afiliado2@gmail.com', 'Maria Santos', '11666666666', '12345678904', 'affiliate', 'pending'),
('cliente1@gmail.com', 'Pedro Costa', '11555555555', '12345678905', 'buyer', 'active'),
('cliente2@gmail.com', 'Ana Oliveira', '11444444444', '12345678906', 'buyer', 'active')
ON CONFLICT (email) DO NOTHING;

-- Inserir afiliados de exemplo
INSERT INTO affiliates (user_id, affiliate_code, tier, total_sales, total_commission, status)
SELECT 
    u.id,
    generate_affiliate_code(),
    'standard',
    0,
    0,
    'active'
FROM users u 
WHERE u.role = 'affiliate' AND u.status = 'active'
ON CONFLICT (affiliate_code) DO NOTHING;

-- Inserir alguns investimentos de exemplo
INSERT INTO investments (
    user_id, 
    plan_id, 
    amount, 
    bonus, 
    affiliate_bonus,
    affiliate_id,
    status,
    unlock_date,
    payment_method,
    transaction_id
)
SELECT 
    (SELECT id FROM users WHERE email = 'cliente1@gmail.com'),
    'plano-bronze',
    1000.00,
    150.00,
    70.00,
    (SELECT id FROM affiliates LIMIT 1),
    'confirmed',
    NOW() + INTERVAL '30 days',
    'pix',
    'TXN_' || EXTRACT(EPOCH FROM NOW())::BIGINT
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'cliente1@gmail.com');

INSERT INTO investments (
    user_id, 
    plan_id, 
    amount, 
    bonus, 
    affiliate_bonus,
    status,
    unlock_date,
    payment_method,
    transaction_id
)
SELECT 
    (SELECT id FROM users WHERE email = 'cliente2@gmail.com'),
    'plano-prata',
    5000.00,
    1000.00,
    0,
    'pending',
    NOW() + INTERVAL '60 days',
    'cartao',
    'TXN_' || EXTRACT(EPOCH FROM NOW())::BIGINT
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'cliente2@gmail.com');

-- Inserir algumas missões de exemplo
INSERT INTO missions (user_email, wallet_address, steps_completed, status, reward_amount) VALUES
('usuario1@gmail.com', '0x1234567890abcdef1234567890abcdef12345678', '["follow_instagram", "share_story"]', 'completed', 50.00),
('usuario2@gmail.com', '0xabcdef1234567890abcdef1234567890abcdef12', '["follow_instagram"]', 'pending', 50.00),
('usuario3@gmail.com', '0x567890abcdef1234567890abcdef1234567890ab', '["follow_instagram", "share_story", "invite_friend"]', 'paid', 50.00);
