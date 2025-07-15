-- Script para corrigir a constraint de tier na tabela affiliates
-- Adiciona todos os valores possíveis de tier

BEGIN;

-- 1. Remover constraint antiga se existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'affiliates_tier_check' 
        AND table_name = 'affiliates'
    ) THEN
        ALTER TABLE affiliates DROP CONSTRAINT affiliates_tier_check;
        RAISE NOTICE 'Constraint affiliates_tier_check removida';
    END IF;
END $$;

-- 2. Adicionar nova constraint com todos os valores possíveis
ALTER TABLE affiliates 
ADD CONSTRAINT affiliates_tier_check 
CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'standard', 'premium'));

-- 3. Verificar se a constraint foi criada corretamente
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'affiliates_tier_check' 
        AND table_name = 'affiliates'
    ) THEN
        RAISE NOTICE 'Nova constraint affiliates_tier_check criada com sucesso';
    ELSE
        RAISE EXCEPTION 'Falha ao criar constraint affiliates_tier_check';
    END IF;
END $$;

-- 4. Testar inserção com valor bronze (deve funcionar)
DO $$
BEGIN
    -- Teste apenas se não existir um registro de teste
    IF NOT EXISTS (SELECT 1 FROM affiliates WHERE affiliate_code = 'TEST001') THEN
        INSERT INTO affiliates (
            user_id, 
            affiliate_code, 
            tier, 
            status, 
            total_sales, 
            total_commission,
            created_at
        ) VALUES (
            NULL, -- user_id pode ser null para teste
            'TEST001',
            'bronze', -- Testando o valor que estava causando erro
            'active',
            0,
            0,
            NOW()
        );
        
        -- Remover registro de teste
        DELETE FROM affiliates WHERE affiliate_code = 'TEST001';
        
        RAISE NOTICE 'Teste de inserção com tier=bronze: SUCESSO';
    END IF;
END $$;

-- 5. Registrar migração
INSERT INTO migration_log (script_name, executed_at, description) 
VALUES (
    '07-fix-tier-constraint.sql',
    NOW(),
    'Corrigida constraint de tier para incluir todos os valores: bronze, silver, gold, platinum, standard, premium'
) ON CONFLICT (script_name) DO UPDATE SET 
    executed_at = NOW(),
    description = EXCLUDED.description;

COMMIT;

-- 6. Mostrar estrutura atual da tabela affiliates
\d affiliates;

RAISE NOTICE 'Script 07-fix-tier-constraint.sql executado com sucesso!';
