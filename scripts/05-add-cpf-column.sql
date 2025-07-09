-- Adicionar coluna CPF na tabela affiliates
-- Este script adiciona a coluna CPF que estava faltando na estrutura

-- 1. Adicionar coluna CPF na tabela affiliates
ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN affiliates.cpf IS 'CPF do afiliado (opcional)';

-- 3. Criar índice para busca por CPF (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_affiliates_cpf ON affiliates(cpf) WHERE cpf IS NOT NULL;

-- 4. Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'affiliates' 
AND column_name = 'cpf';

-- 5. Mostrar estrutura atual da tabela affiliates
\d affiliates;
