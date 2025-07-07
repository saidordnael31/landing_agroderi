-- Inserir usuários de teste
INSERT INTO users (id, email, name, phone, cpf, role, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@agroderi.com', 'Administrador AGD', '11999999999', '12345678901', 'admin', 'active'),
    ('550e8400-e29b-41d4-a716-446655440002', 'viewer@agroderi.com', 'Visualizador AGD', '11888888888', '12345678902', 'viewer', 'active'),
    ('550e8400-e29b-41d4-a716-446655440003', 'afiliado1@gmail.com', 'João Silva', '11777777777', '12345678903', 'affiliate', 'active'),
    ('550e8400-e29b-41d4-a716-446655440004', 'afiliado2@gmail.com', 'Maria Santos', '11666666666', '12345678904', 'affiliate', 'active'),
    ('550e8400-e29b-41d4-a716-446655440005', 'cliente1@gmail.com', 'Pedro Oliveira', '11555555555', '12345678905', 'buyer', 'active'),
    ('550e8400-e29b-41d4-a716-446655440006', 'cliente2@gmail.com', 'Ana Costa', '11444444444', '12345678906', 'buyer', 'active')
ON CONFLICT (email) DO NOTHING;

-- Inserir afiliados de teste
INSERT INTO affiliates (id, user_id, affiliate_code, tier, total_sales, total_commission, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'AGD12345', 'premium', 15000.00, 750.00, 'active'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'AGD67890', 'standard', 8500.00, 255.00, 'active')
ON CONFLICT (affiliate_code) DO NOTHING;

-- Inserir investimentos de teste
INSERT INTO investments (id, user_id, plan_id, amount, bonus, affiliate_bonus, affiliate_id, status, purchase_date, unlock_date, payment_method, utm_source) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'premium', 2500.00, 250.00, 125.00, '660e8400-e29b-41d4-a716-446655440001', 'confirmed', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'pix', 'landing_page'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'starter', 500.00, 25.00, 15.00, '660e8400-e29b-41d4-a716-446655440001', 'confirmed', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', 'pix', 'affiliate_link'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'vip', 10000.00, 1500.00, 800.00, '660e8400-e29b-41d4-a716-446655440002', 'pending', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days', 'bank_transfer', 'google_ads')
ON CONFLICT (id) DO NOTHING;

-- Inserir comissões de teste
INSERT INTO commissions (id, affiliate_id, investment_id, amount, percentage, status, generated_at, paid_at) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 125.00, 5.0, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
    ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 15.00, 3.0, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
    ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 800.00, 8.0, 'pending', NOW() - INTERVAL '1 day', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir missões de teste
INSERT INTO missions (id, user_email, wallet_address, steps_completed, status, reward_amount, instagram_verified, youtube_verified, telegram_verified) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', 'usuario1@gmail.com', '0x1234567890abcdef1234567890abcdef12345678', '[{"step": "instagram", "completed": true}, {"step": "youtube", "completed": true}]', 'completed', 50.00, true, true, false),
    ('990e8400-e29b-41d4-a716-446655440002', 'usuario2@gmail.com', '0xabcdef1234567890abcdef1234567890abcdef12', '[{"step": "instagram", "completed": true}]', 'pending', 50.00, true, false, false),
    ('990e8400-e29b-41d4-a716-446655440003', 'usuario3@gmail.com', '0x567890abcdef1234567890abcdef1234567890ab', '[{"step": "instagram", "completed": true}, {"step": "youtube", "completed": true}, {"step": "telegram", "completed": true}]', 'paid', 50.00, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Inserir alguns logs de eventos de teste
INSERT INTO event_logs (user_id, event_name, event_data, ip_address) VALUES
    ('550e8400-e29b-41d4-a716-446655440005', 'investment_created', '{"plan": "premium", "amount": 2500, "utm_source": "landing_page"}', '192.168.1.100'),
    ('550e8400-e29b-41d4-a716-446655440006', 'affiliate_signup', '{"affiliate_code": "AGD12345", "referrer": "google"}', '192.168.1.101'),
    ('550e8400-e29b-41d4-a716-446655440003', 'commission_earned', '{"amount": 125, "investment_id": "770e8400-e29b-41d4-a716-446655440001"}', '192.168.1.102');

-- Atualizar sequências (se necessário)
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
