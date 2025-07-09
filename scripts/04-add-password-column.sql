-- Adicionar coluna password_hash na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Atualizar a constraint para tornar password_hash obrigatório apenas para novos registros
-- (deixamos NULL temporariamente para usuários existentes)
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';

-- Criar índice para performance em consultas de login
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password_hash);

-- Comentário para documentação
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha do usuário para autenticação';
