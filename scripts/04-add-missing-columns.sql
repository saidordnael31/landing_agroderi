-- Script para adicionar colunas faltantes nas tabelas
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna password_hash na tabela users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password_hash);
        COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha do usuário';
    END IF;
END $$;

-- 2. Adicionar colunas faltantes na tabela affiliates
DO $$ 
BEGIN
    -- Coluna channels (array de strings)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'affiliates' AND column_name = 'channels'
    ) THEN
        ALTER TABLE affiliates ADD COLUMN channels TEXT[];
        COMMENT ON COLUMN affiliates.channels IS 'Canais de divulgação do afiliado';
    END IF;

    -- Coluna experience
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'affiliates' AND column_name = 'experience'
    ) THEN
        ALTER TABLE affiliates ADD COLUMN experience TEXT;
        COMMENT ON COLUMN affiliates.experience IS 'Experiência do afiliado';
    END IF;

    -- Coluna motivation
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'affiliates' AND column_name = 'motivation'
    ) THEN
        ALTER TABLE affiliates ADD COLUMN motivation TEXT;
        COMMENT ON COLUMN affiliates.motivation IS 'Motivação do afiliado';
    END IF;

    -- Coluna commission_rate
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'affiliates' AND column_name = 'commission_rate'
    ) THEN
        ALTER TABLE affiliates ADD COLUMN commission_rate DECIMAL(5,4) DEFAULT 0.10;
        COMMENT ON COLUMN affiliates.commission_rate IS 'Taxa de comissão do afiliado (ex: 0.10 = 10%)';
    END IF;
END $$;

-- 3. Atualizar dados existentes com valores padrão
UPDATE affiliates 
SET 
    channels = ARRAY['Instagram', 'WhatsApp'],
    experience = 'intermediario',
    commission_rate = 0.10
WHERE channels IS NULL OR experience IS NULL OR commission_rate IS NULL;

-- 4. Verificar se tudo foi criado corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'affiliates') 
    AND column_name IN ('password_hash', 'channels', 'experience', 'motivation', 'commission_rate')
ORDER BY table_name, column_name;

-- 5. Mostrar estrutura das tabelas
\d users;
\d affiliates;
