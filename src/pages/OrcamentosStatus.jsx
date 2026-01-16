// PÁGINA DE ORÇAMENTOS FILTRADOS POR STATUS - CONSTRUCOM
// ====================================================================================
// Descrição: Exibe orçamentos filtrados por um status específico
// Autor: Nader
// Última atualização: Janeiro 2026

//
// FUNCIONALIDADES:
// - Filtragem automática por status (vem da URL: /orcamentos/status/:status)
// - Busca por número, cliente ou empresa
// - Ações: Editar e Duplicar
// - Header personalizado com ícone e cor do status
// - Permissões: Vendedor vê apenas seus orçamentos, outros veem todos
//
// STATUS SUPORTADOS:
// - rascunho, enviado, aprovado, lancado, cancelado
//
// MELHORIAS RECENTES:
// - Layout compacto (2 linhas por orçamento)
// - Nome do cliente ao lado do número (#ORC-0010 • Nome Cliente)
// - Badge de status posicionado ao lado dos botões de ação
// - Cidade do cadastro incluída nas informações
// ====================================================================================
=======
-- ====================================================================================
-- ADICIONAR STATUS "FINALIZADO" AO SISTEMA - CONSTRUCOM
-- ====================================================================================
-- Descrição: Adiciona novo status para orçamentos totalmente entregues
-- Autor: Nader
-- Data: Janeiro 2026
--
-- IMPORTANTE: 
-- - Apenas Comercial e Administrador podem mudar para "Finalizado"
-- - Similar à restrição do status "Lançado"
-- ====================================================================================


-- ====================================================================================
-- 1. VERIFICAR SE O TIPO ENUM JÁ EXISTE
-- ====================================================================================
-- Primeiro, vamos ver os valores atuais do enum
SELECT 
  e.enumtypid::regtype AS enum_type,
  e.enumlabel AS enum_value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'status_orcamento'
ORDER BY e.enumsortorder;

-- ====================================================================================
-- 2. ADICIONAR O NOVO VALOR "finalizado" AO ENUM
-- ====================================================================================
-- Se o enum ainda não tem "finalizado", adicione:
ALTER TYPE status_orcamento ADD VALUE IF NOT EXISTS 'finalizado';

-- ====================================================================================
-- 3. VERIFICAR RESULTADO
-- ====================================================================================
-- Confirme que "finalizado" foi adicionado:
SELECT 
  e.enumlabel AS status_disponivel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'status_orcamento'
ORDER BY e.enumsortorder;

-- ====================================================================================
-- OBSERVAÇÕES IMPORTANTES:
-- ====================================================================================
/*
1. A ordem dos status ficará:
   - rascunho
   - enviado
   - aprovado
   - lancado
   - finalizado
   - rejeitado (se existir)
   - cancelado

2. PERMISSÕES:
   - Vendedor: pode usar rascunho, enviado
   - Comercial: pode usar todos (inclusive finalizado e lancado)
   - Administrador: pode usar todos (inclusive finalizado e lancado)

3. REGRAS DE NEGÓCIO:
   - Finalizado = Pedido totalmente entregue
   - Apenas muda de "lancado" para "finalizado"
   - Não pode voltar de "finalizado" para outro status

4. DIFERENÇA ENTRE STATUS:
   - Lançado: Pedido foi para o ERP, pode estar em separação/entrega
   - Finalizado: Tudo foi entregue, pedido completo
*/

-- ====================================================================================
-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE
-- ====================================================================================