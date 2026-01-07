-- =============================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA DE ORÇAMENTOS
-- =============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA DE PRODUTOS
-- =============================================
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_sistema VARCHAR(50) UNIQUE NOT NULL,
  produto VARCHAR(100) NOT NULL,
  classe VARCHAR(50) NOT NULL,
  mpa VARCHAR(50) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  peso_unitario DECIMAL(10, 3) NOT NULL,
  qtd_por_pallet INTEGER NOT NULL,
  peso_pallet DECIMAL(10, 2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para produtos
CREATE INDEX idx_produtos_codigo ON produtos(codigo_sistema);
CREATE INDEX idx_produtos_produto ON produtos(produto);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- =============================================
-- TABELA DE CLIENTES
-- =============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  empresa VARCHAR(200),
  cpf_cnpj VARCHAR(20),
  email VARCHAR(200),
  telefone VARCHAR(20),
  endereco TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- =============================================
-- TABELA DE ORÇAMENTOS
-- =============================================
CREATE TABLE orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  cliente_nome VARCHAR(200), -- Denormalizado para histórico
  cliente_empresa VARCHAR(200),
  cliente_email VARCHAR(200),
  cliente_telefone VARCHAR(20),
  cliente_cpf_cnpj VARCHAR(20),
  vendedor VARCHAR(200) NOT NULL,
  data_orcamento DATE NOT NULL,
  validade_dias INTEGER DEFAULT 15,
  data_validade DATE NOT NULL,
  condicoes_pagamento TEXT,
  prazo_entrega VARCHAR(200),
  desconto_geral DECIMAL(5, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL,
  frete DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  frete_localidade VARCHAR(200),
  frete_cidade VARCHAR(200),
  frete_tipo_veiculo VARCHAR(50),
  frete_modalidade VARCHAR(50),
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'rascunho',
  versao INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para orçamentos
CREATE INDEX idx_orcamentos_numero ON orcamentos(numero);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_data ON orcamentos(data_orcamento);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_vendedor ON orcamentos(vendedor);

-- =============================================
-- TABELA DE ITENS DO ORÇAMENTO
-- =============================================
CREATE TABLE orcamentos_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  produto_codigo VARCHAR(50), -- Denormalizado
  produto VARCHAR(100), -- Denormalizado
  classe VARCHAR(50),
  mpa VARCHAR(50),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  peso_unitario DECIMAL(10, 3),
  qtd_por_pallet INTEGER,
  subtotal DECIMAL(12, 2) NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para itens
CREATE INDEX idx_orcamentos_itens_orcamento ON orcamentos_itens(orcamento_id);
CREATE INDEX idx_orcamentos_itens_produto ON orcamentos_itens(produto_id);

-- =============================================
-- TABELA DE HISTÓRICO DE ORÇAMENTOS
-- =============================================
CREATE TABLE orcamentos_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL,
  usuario VARCHAR(200) NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para histórico
CREATE INDEX idx_orcamentos_historico_orcamento ON orcamentos_historico(orcamento_id);

-- =============================================
-- TABELA DE FRETES
-- =============================================
CREATE TABLE fretes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cidade VARCHAR(200) NOT NULL,
  modalidade VARCHAR(50) NOT NULL,
  tipo_veiculo VARCHAR(50) NOT NULL,
  preco_por_kg DECIMAL(10, 2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cidade, modalidade, tipo_veiculo)
);

-- Índices para fretes
CREATE INDEX idx_fretes_cidade ON fretes(cidade);
CREATE INDEX idx_fretes_ativo ON fretes(ativo);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fretes_updated_at BEFORE UPDATE ON fretes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE fretes ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura (você pode ajustar depois)
CREATE POLICY "Permitir leitura pública de produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de orcamentos" ON orcamentos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de itens" ON orcamentos_itens FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de histórico" ON orcamentos_historico FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de fretes" ON fretes FOR SELECT USING (true);

-- Políticas para escrita (ajuste conforme necessário)
CREATE POLICY "Permitir inserção de produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de produtos" ON produtos FOR UPDATE USING (true);
CREATE POLICY "Permitir inserção de clientes" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de clientes" ON clientes FOR UPDATE USING (true);
CREATE POLICY "Permitir inserção de orcamentos" ON orcamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de orcamentos" ON orcamentos FOR UPDATE USING (true);
CREATE POLICY "Permitir inserção de itens" ON orcamentos_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de histórico" ON orcamentos_historico FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de fretes" ON fretes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de fretes" ON fretes FOR UPDATE USING (true);
