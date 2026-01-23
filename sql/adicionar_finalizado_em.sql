-- Adicionar coluna finalizado_em na tabela orcamentos
-- Executa este SQL no Supabase SQL Editor

ALTER TABLE orcamentos 
ADD COLUMN IF NOT EXISTS finalizado_em TIMESTAMP WITH TIME ZONE;

-- Comentário para documentação
COMMENT ON COLUMN orcamentos.finalizado_em IS 'Data e hora em que o orçamento foi finalizado';
