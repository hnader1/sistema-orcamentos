-- ============================================
-- SISTEMA DE ACEITE DE PROPOSTAS - CONSTRUCOM
-- VERSÃO 3 - SQL CORRIGIDO (usa 'tipo' em vez de 'role')
-- ============================================

-- TABELA: propostas
CREATE TABLE IF NOT EXISTS propostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    vendedor_id UUID NOT NULL REFERENCES usuarios(id),
    token_aceite VARCHAR(64) UNIQUE NOT NULL,
    numero_proposta VARCHAR(20) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    total_produtos DECIMAL(12,2),
    total_frete DECIMAL(12,2),
    tipo_frete VARCHAR(10) DEFAULT 'CIF',
    tipo_descarga VARCHAR(50),
    status VARCHAR(20) DEFAULT 'enviada' CHECK (status IN ('rascunho','enviada','visualizada','aceita','recusada','expirada','cancelada')),
    data_envio TIMESTAMP WITH TIME ZONE,
    data_visualizacao TIMESTAMP WITH TIME ZONE,
    data_aceite TIMESTAMP WITH TIME ZONE,
    data_expiracao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: aceites
CREATE TABLE IF NOT EXISTS aceites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('simples','assinatura_digital')),
    ip_cliente VARCHAR(45),
    user_agent TEXT,
    data_hora_aceite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provider_assinatura VARCHAR(50),
    documento_assinado_url TEXT,
    assinatura_id_externo VARCHAR(100),
    dados_confirmados JSONB,
    observacao_cliente TEXT,
    lgpd_aceito BOOLEAN DEFAULT FALSE,
    lgpd_aceito_em TIMESTAMP WITH TIME ZONE,
    lgpd_versao VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: dados_cliente_proposta
CREATE TABLE IF NOT EXISTS dados_cliente_proposta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    cpf_cnpj VARCHAR(18) NOT NULL,
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    inscricao_estadual VARCHAR(20),
    cep VARCHAR(10),
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    contribuinte_icms BOOLEAN DEFAULT FALSE,
    tipo_cliente VARCHAR(20) CHECK (tipo_cliente IN ('consumidor_final','revenda','construtor')),
    email VARCHAR(200),
    telefone VARCHAR(20),
    origem VARCHAR(20) DEFAULT 'orcamento' CHECK (origem IN ('orcamento','cliente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: documentos_proposta
CREATE TABLE IF NOT EXISTS documentos_proposta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN ('contrato_social','comprovante_endereco','documento_identidade','cartao_cnpj','outro')),
    descricao VARCHAR(200),
    nome_arquivo VARCHAR(200) NOT NULL,
    tamanho_bytes INTEGER,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    url_publica TEXT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','validado','rejeitado')),
    validado_por UUID REFERENCES usuarios(id),
    data_validacao TIMESTAMP WITH TIME ZONE,
    motivo_rejeicao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: log_emails_proposta
CREATE TABLE IF NOT EXISTS log_emails_proposta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('envio_proposta','lembrete','aceite_confirmacao','aceite_notificacao','questionamento','resposta')),
    de_email VARCHAR(200) NOT NULL,
    para_email VARCHAR(200) NOT NULL,
    cc_emails TEXT[],
    assunto VARCHAR(300) NOT NULL,
    corpo_html TEXT,
    anexos JSONB,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','enviado','erro','devolvido')),
    erro_mensagem TEXT,
    data_envio TIMESTAMP WITH TIME ZONE,
    data_abertura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: termos_lgpd
CREATE TABLE IF NOT EXISTS termos_lgpd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    versao VARCHAR(20) NOT NULL UNIQUE,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir termo LGPD padrão
INSERT INTO termos_lgpd (versao, titulo, conteudo, vigencia_inicio) VALUES (
    '1.0',
    'Termo de Consentimento para Tratamento de Dados Pessoais',
    'Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), ao aceitar esta proposta comercial, você consente com o tratamento dos seus dados pessoais pela Construcom Materiais de Construção LTDA para as seguintes finalidades:

1. FINALIDADE DO TRATAMENTO
• Processamento e execução do pedido de compra
• Emissão de documentos fiscais
• Entrega dos produtos no endereço informado
• Comunicação sobre status do pedido
• Análise de crédito (quando aplicável)
• Cumprimento de obrigações legais e regulatórias

2. DADOS COLETADOS
• Dados de identificação (CPF/CNPJ, nome/razão social)
• Dados de contato (telefone, email)
• Dados de endereço para entrega
• Dados fiscais (inscrição estadual, regime tributário)
• Documentos anexados (contrato social, comprovantes)

3. COMPARTILHAMENTO
Seus dados poderão ser compartilhados com:
• Transportadoras para realização da entrega
• Órgãos governamentais para cumprimento de obrigações fiscais
• Instituições financeiras para análise de crédito

4. PRAZO DE RETENÇÃO
Seus dados serão mantidos pelo prazo necessário para cumprimento das finalidades acima e das obrigações legais aplicáveis (mínimo de 5 anos para documentos fiscais).

5. SEUS DIREITOS
Você pode exercer seus direitos de acesso, correção, exclusão e portabilidade dos dados através do email: lgpd@construcom.com.br

6. CONSENTIMENTO
Ao marcar a caixa de aceite, você declara ter lido e compreendido este termo, consentindo com o tratamento dos seus dados pessoais nas condições aqui descritas.',
    CURRENT_DATE
) ON CONFLICT (versao) DO NOTHING;

-- Colunas extras no orçamentos
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS proposta_enviada_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS proposta_aceita_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS observacao_cliente_aceite TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_propostas_orcamento ON propostas(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_propostas_token ON propostas(token_aceite);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_vendedor ON propostas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_propostas_data_expiracao ON propostas(data_expiracao);
CREATE INDEX IF NOT EXISTS idx_aceites_proposta ON aceites(proposta_id);
CREATE INDEX IF NOT EXISTS idx_dados_cliente_proposta ON dados_cliente_proposta(proposta_id);
CREATE INDEX IF NOT EXISTS idx_documentos_proposta ON documentos_proposta(proposta_id);
CREATE INDEX IF NOT EXISTS idx_log_emails_proposta ON log_emails_proposta(proposta_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_propostas_updated_at ON propostas;
CREATE TRIGGER update_propostas_updated_at BEFORE UPDATE ON propostas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dados_cliente_proposta_updated_at ON dados_cliente_proposta;
CREATE TRIGGER update_dados_cliente_proposta_updated_at BEFORE UPDATE ON dados_cliente_proposta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Quando proposta aceita, atualiza orçamento
CREATE OR REPLACE FUNCTION bloquear_orcamento_aceito() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'aceita' AND OLD.status != 'aceita' THEN
        UPDATE orcamentos SET status = 'proposta_aceita', proposta_aceita_em = NOW(), observacao_cliente_aceite = (SELECT observacao_cliente FROM aceites WHERE proposta_id = NEW.id ORDER BY created_at DESC LIMIT 1) WHERE id = NEW.orcamento_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_bloquear_orcamento_aceito ON propostas;
CREATE TRIGGER trigger_bloquear_orcamento_aceito AFTER UPDATE ON propostas FOR EACH ROW EXECUTE FUNCTION bloquear_orcamento_aceito();

-- RLS POLICIES (CORRIGIDO - usando 'tipo' em vez de 'role')
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aceites ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_cliente_proposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_proposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_emails_proposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE termos_lgpd ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendedor ve proprias propostas" ON propostas;
CREATE POLICY "Vendedor ve proprias propostas" ON propostas FOR SELECT USING (vendedor_id = auth.uid() OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo IN ('admin', 'comercial', 'comercial_interno')));

DROP POLICY IF EXISTS "Vendedor cria proprias propostas" ON propostas;
CREATE POLICY "Vendedor cria proprias propostas" ON propostas FOR INSERT WITH CHECK (vendedor_id = auth.uid());

DROP POLICY IF EXISTS "Vendedor atualiza proprias propostas" ON propostas;
CREATE POLICY "Vendedor atualiza proprias propostas" ON propostas FOR UPDATE USING (vendedor_id = auth.uid() OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo IN ('admin', 'comercial', 'comercial_interno')));

DROP POLICY IF EXISTS "Acesso publico via token" ON propostas;
CREATE POLICY "Acesso publico via token" ON propostas FOR SELECT USING (token_aceite IS NOT NULL);

DROP POLICY IF EXISTS "Cliente pode criar aceite" ON aceites;
CREATE POLICY "Cliente pode criar aceite" ON aceites FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Equipe pode ver aceites" ON aceites;
CREATE POLICY "Equipe pode ver aceites" ON aceites FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND ativo = true));

DROP POLICY IF EXISTS "Cliente pode criar dados" ON dados_cliente_proposta;
CREATE POLICY "Cliente pode criar dados" ON dados_cliente_proposta FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Cliente pode atualizar dados" ON dados_cliente_proposta;
CREATE POLICY "Cliente pode atualizar dados" ON dados_cliente_proposta FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Equipe pode ver dados cliente" ON dados_cliente_proposta;
CREATE POLICY "Equipe pode ver dados cliente" ON dados_cliente_proposta FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND ativo = true));

DROP POLICY IF EXISTS "Cliente pode enviar documentos" ON documentos_proposta;
CREATE POLICY "Cliente pode enviar documentos" ON documentos_proposta FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Equipe pode ver documentos" ON documentos_proposta;
CREATE POLICY "Equipe pode ver documentos" ON documentos_proposta FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND ativo = true));

DROP POLICY IF EXISTS "Equipe pode atualizar documentos" ON documentos_proposta;
CREATE POLICY "Equipe pode atualizar documentos" ON documentos_proposta FOR UPDATE USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND ativo = true));

DROP POLICY IF EXISTS "Equipe pode ver logs email" ON log_emails_proposta;
CREATE POLICY "Equipe pode ver logs email" ON log_emails_proposta FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND ativo = true));

DROP POLICY IF EXISTS "Sistema pode criar logs email" ON log_emails_proposta;
CREATE POLICY "Sistema pode criar logs email" ON log_emails_proposta FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Publico pode ler termos lgpd" ON termos_lgpd;
CREATE POLICY "Publico pode ler termos lgpd" ON termos_lgpd FOR SELECT USING (ativo = true);