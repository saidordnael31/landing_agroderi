-- Script para adicionar coluna phone na tabela affiliates
-- Versão: 06
-- Data: 2024

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna phone se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'affiliates' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE affiliates ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Coluna phone adicionada com sucesso na tabela affiliates';
    ELSE
        RAISE NOTICE 'Coluna phone já existe na tabela affiliates';
    END IF;
END $$;

-- Adicionar comentário na coluna
COMMENT ON COLUMN affiliates.phone IS 'Telefone do afiliado para contato';

-- Criar índice para otimizar buscas por telefone (opcional)
CREATE INDEX IF NOT EXISTS idx_affiliates_phone ON affiliates(phone);

-- Verificar a estrutura da tabela após a alteração
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
ORDER BY ordinal_position;

-- Log da execução
INSERT INTO event_logs (event_name, event_data, created_at) 
VALUES (
    'database_migration', 
    '{"script": "06-add-phone-column.sql", "action": "add_phone_column", "table": "affiliates"}',
    NOW()
);
