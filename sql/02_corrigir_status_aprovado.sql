-- ============================================
-- CORREÇÃO: STATUS APROVADO + DADOS ACEITAÇÃO
-- Versão: Janeiro 2026
-- ============================================

-- 1. ATUALIZAR TRIGGER PARA USAR 'aprovado' EM VEZ DE 'proposta_aceita'
-- =======================================================================
CREATE OR REPLACE FUNCTION bloquear_orcamento_aceito() RETURNS TRIGGER AS $$
DECLARE
    v_aceite RECORD;
BEGIN
    IF NEW.status = 'aceita' AND OLD.status != 'aceita' THEN
        -- Buscar dados do aceite
        SELECT * INTO v_aceite 
        FROM aceites 
        WHERE proposta_id = NEW.id 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Atualizar orçamento para APROVADO (não proposta_aceita)
        UPDATE orcamentos 
        SET 
            status = 'aprovado',  -- ✅ CORRIGIDO: era 'proposta_aceita'
            proposta_aceita_em = NOW(),
            observacao_cliente_aceite = v_aceite.observacao_cliente
        WHERE id = NEW.orcamento_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar o trigger
DROP TRIGGER IF EXISTS trigger_bloquear_orcamento_aceito ON propostas;
CREATE TRIGGER trigger_bloquear_orcamento_aceito 
    AFTER UPDATE ON propostas 
    FOR EACH ROW 
    EXECUTE FUNCTION bloquear_orcamento_aceito();


-- 2. ADICIONAR COLUNAS NO ACEITES PARA ARMAZENAR MAIS DADOS
-- ==========================================================
-- Email de quem aprovou (do formulário de aceite)
ALTER TABLE aceites ADD COLUMN IF NOT EXISTS email_aprovador VARCHAR(255);

-- Nome de quem aprovou
ALTER TABLE aceites ADD COLUMN IF NOT EXISTS nome_aprovador VARCHAR(255);

-- Contribuinte ICMS (copiado do formulário)
ALTER TABLE aceites ADD COLUMN IF NOT EXISTS contribuinte_icms BOOLEAN;

-- Inscrição Estadual
ALTER TABLE aceites ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(20);

-- Tipo de cliente
ALTER TABLE aceites ADD COLUMN IF NOT EXISTS tipo_cliente VARCHAR(30);


-- 3. CORRIGIR ORÇAMENTOS COM STATUS ANTIGO
-- =========================================
-- Atualizar orçamentos que estão com 'proposta_aceita' para 'aprovado'
UPDATE orcamentos 
SET status = 'aprovado' 
WHERE status = 'proposta_aceita';


-- 4. VIEW PARA FACILITAR CONSULTA DOS DADOS DE ACEITAÇÃO
-- =======================================================
CREATE OR REPLACE VIEW vw_dados_aceitacao AS
SELECT 
    o.id AS orcamento_id,
    o.numero AS orcamento_numero,
    o.numero_proposta,
    o.cliente_nome,
    o.status AS orcamento_status,
    p.id AS proposta_id,
    p.status AS proposta_status,
    p.data_aceite,
    a.id AS aceite_id,
    a.data_hora_aceite,
    a.ip_cliente,
    a.observacao_cliente,
    a.lgpd_aceito,
    a.lgpd_aceito_em,
    a.lgpd_versao,
    a.email_aprovador,
    a.nome_aprovador,
    -- Dados do cliente (pode vir do aceite ou dos dados_cliente_proposta)
    COALESCE(a.contribuinte_icms, dcp.contribuinte_icms) AS contribuinte_icms,
    COALESCE(a.inscricao_estadual, dcp.inscricao_estadual) AS inscricao_estadual,
    COALESCE(a.tipo_cliente, dcp.tipo_cliente) AS tipo_cliente,
    dcp.razao_social,
    dcp.nome_fantasia,
    dcp.cpf_cnpj,
    dcp.email,
    dcp.telefone,
    dcp.origem AS dados_origem
FROM orcamentos o
LEFT JOIN propostas p ON p.orcamento_id = o.id
LEFT JOIN aceites a ON a.proposta_id = p.id
LEFT JOIN dados_cliente_proposta dcp ON dcp.proposta_id = p.id
WHERE o.status = 'aprovado'
ORDER BY a.data_hora_aceite DESC NULLS LAST;


-- 5. FUNÇÃO PARA BUSCAR DADOS DA ACEITAÇÃO POR ORÇAMENTO
-- ========================================================
CREATE OR REPLACE FUNCTION get_dados_aceitacao(p_orcamento_id UUID)
RETURNS TABLE (
    proposta_id UUID,
    data_aceite TIMESTAMPTZ,
    ip_cliente VARCHAR,
    observacao_cliente TEXT,
    lgpd_aceito BOOLEAN,
    lgpd_aceito_em TIMESTAMPTZ,
    contribuinte_icms BOOLEAN,
    inscricao_estadual VARCHAR,
    tipo_cliente VARCHAR,
    razao_social VARCHAR,
    nome_fantasia VARCHAR,
    cpf_cnpj VARCHAR,
    email VARCHAR,
    telefone VARCHAR,
    documentos JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS proposta_id,
        COALESCE(a.data_hora_aceite, p.data_aceite) AS data_aceite,
        a.ip_cliente,
        a.observacao_cliente,
        a.lgpd_aceito,
        a.lgpd_aceito_em,
        COALESCE(a.contribuinte_icms, dcp.contribuinte_icms) AS contribuinte_icms,
        COALESCE(a.inscricao_estadual, dcp.inscricao_estadual)::VARCHAR AS inscricao_estadual,
        COALESCE(a.tipo_cliente, dcp.tipo_cliente)::VARCHAR AS tipo_cliente,
        dcp.razao_social::VARCHAR,
        dcp.nome_fantasia::VARCHAR,
        dcp.cpf_cnpj::VARCHAR,
        dcp.email::VARCHAR,
        dcp.telefone::VARCHAR,
        (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'id', dp.id,
                'tipo', dp.tipo_documento,
                'nome', dp.nome_arquivo,
                'tamanho', dp.tamanho_bytes,
                'path', dp.storage_path,
                'status', dp.status
            )), '[]'::jsonb)
            FROM documentos_proposta dp
            WHERE dp.proposta_id = p.id
        ) AS documentos
    FROM propostas p
    LEFT JOIN aceites a ON a.proposta_id = p.id
    LEFT JOIN dados_cliente_proposta dcp ON dcp.proposta_id = p.id AND dcp.origem = 'cliente'
    WHERE p.orcamento_id = p_orcamento_id
    AND p.status = 'aceita'
    ORDER BY a.data_hora_aceite DESC NULLS LAST
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- 6. RLS PARA A VIEW (Admin e Comercial Interno apenas)
-- ======================================================
-- Nota: Views não suportam RLS diretamente, então controlamos no frontend
-- Mas podemos criar uma função segura:

CREATE OR REPLACE FUNCTION get_dados_aceitacao_seguro(p_orcamento_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_tipo VARCHAR;
    v_result JSONB;
BEGIN
    -- Verificar se o usuário é admin ou comercial_interno
    SELECT tipo INTO v_user_tipo
    FROM usuarios
    WHERE id = auth.uid();
    
    IF v_user_tipo NOT IN ('admin', 'comercial_interno') THEN
        RETURN NULL;  -- Não autorizado
    END IF;
    
    -- Buscar dados
    SELECT jsonb_build_object(
        'proposta_id', proposta_id,
        'data_aceite', data_aceite,
        'ip_cliente', ip_cliente,
        'observacao_cliente', observacao_cliente,
        'lgpd_aceito', lgpd_aceito,
        'lgpd_aceito_em', lgpd_aceito_em,
        'contribuinte_icms', contribuinte_icms,
        'inscricao_estadual', inscricao_estadual,
        'tipo_cliente', tipo_cliente,
        'razao_social', razao_social,
        'nome_fantasia', nome_fantasia,
        'cpf_cnpj', cpf_cnpj,
        'email', email,
        'telefone', telefone,
        'documentos', documentos
    ) INTO v_result
    FROM get_dados_aceitacao(p_orcamento_id);
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Fim do script
SELECT 'Script executado com sucesso!' AS resultado;
