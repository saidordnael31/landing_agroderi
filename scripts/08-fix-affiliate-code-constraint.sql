-- Remover códigos vazios ou duplicados
DELETE FROM affiliates WHERE affiliate_code = '' OR affiliate_code IS NULL;

-- Atualizar códigos duplicados com timestamp
UPDATE affiliates 
SET affiliate_code = 'AGD' || EXTRACT(EPOCH FROM NOW())::bigint || id
WHERE affiliate_code IN (
  SELECT affiliate_code 
  FROM affiliates 
  GROUP BY affiliate_code 
  HAVING COUNT(*) > 1
);

-- Garantir que não há códigos vazios
UPDATE affiliates 
SET affiliate_code = 'AGD' || EXTRACT(EPOCH FROM NOW())::bigint || id
WHERE affiliate_code = '' OR affiliate_code IS NULL;
