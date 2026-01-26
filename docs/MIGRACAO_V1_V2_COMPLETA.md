# Migração de Dados V1 → V2 - Sistema Orçamentos

**Data:** 26/01/2026  
**Status:** ✅ COMPLETA

---

## Resumo Executivo

Migração bem-sucedida de dados do banco de produção V1 para o banco de desenvolvimento V2.

| Tabela | V1 | V2 | Status |
|--------|-----|-----|--------|
| Produtos | 195 | 195 | ✅ Completo |
| Fretes | 570 | 570 | ✅ Completo |
| Formas de Pagamento | 32 | 32 | ✅ Completo |

---

## Ambientes

### V1 - Produção (Sistema Atual)
- **Project ID:** `qjoopvydmqkyrormqocq`
- **URL:** `https://qjoopvydmqkyrormqocq.supabase.co`

### V2 - Desenvolvimento (Novo Sistema)
- **Project ID:** `rxkxuadsdpatzmkhgqgq`
- **URL:** `https://rxkxuadsdpatzmkhgqgq.supabase.co`
- **Tenant ID:** `e9c647db-ef72-4d71-a86c-289763a5ffba` (Construcom)

---

## Detalhes da Migração

### 1. Produtos (195 registros)

**Mapeamento de campos:**
| V1 | V2 | Observação |
|----|-----|------------|
| codigo_sistema | codigo | Renomeado |
| produto | nome | Renomeado |
| qtd_por_pallet | qtd_pallet | Renomeado |
| unidade | unidade | Normalizado (un→UNIDADE, m²→M2, m→METRO) |
| tipo | tipo | Normalizado para ENUM |

**Tipos de produtos migrados:**
- BLOCO, CANALETA, MEIO_BLOCO, LAJE, PISO, GRELHA, ELEMENTO_VAZADO, PAVER, ACESSORIO

### 2. Fretes (570 registros)

**Estrutura:**
- 114 cidades atendidas em Minas Gerais
- 5 combinações por cidade (modalidade × tipo_veículo)

**Modalidades:**
- `CIF_COM_DESCARGA`
- `CIF_SEM_DESCARGA`

**Tipos de Veículos:**
| Tipo | Capacidade KG | Capacidade Pallets |
|------|---------------|-------------------|
| Toco 8t - COM DESCARGA | 8.000 | 5 |
| Truck 14t - COM DESCARGA | 14.000 | 9 |
| Toco 8t - SEM DESCARGA | 8.000 | 6 |
| Truck 14t - SEM DESCARGA | 14.000 | 10 |
| Carreta 32t - SEM DESCARGA | 32.000 | 18 |

**Cobertura geográfica:** De ABAETE a VESPASIANO (114 localidades)

### 3. Formas de Pagamento (32 registros)

**Alteração no schema V2:**
```sql
ALTER TABLE formas_pagamento 
ADD COLUMN categoria VARCHAR(50),
ADD COLUMN parcelas INTEGER DEFAULT 1,
ADD COLUMN ordem INTEGER;
```

**Categorias:**
- À Vista (4 opções)
- Cartão de Crédito (12 opções: 1x a 12x)
- Boleto (14 opções: 7 a 168 dias)
- Outros (2 opções: Permuta, Depósito)

---

## Queries de Validação

```sql
-- Validar produtos
SELECT COUNT(*) FROM produtos WHERE tenant_id = 'e9c647db-ef72-4d71-a86c-289763a5ffba';
-- Esperado: 195

-- Validar fretes
SELECT COUNT(*) FROM fretes WHERE tenant_id = 'e9c647db-ef72-4d71-a86c-289763a5ffba';
-- Esperado: 570

-- Validar fretes por cidade
SELECT COUNT(DISTINCT cidade) FROM fretes WHERE tenant_id = 'e9c647db-ef72-4d71-a86c-289763a5ffba';
-- Esperado: 114

-- Validar formas de pagamento
SELECT COUNT(*) FROM formas_pagamento WHERE ativo = true;
-- Esperado: 32
```

---

## Tabelas Não Migradas (Análise Pendente)

As seguintes tabelas podem precisar de migração futura:
- `clientes` - Cadastro de clientes
- `vendedores` - Equipe comercial
- `orcamentos` - Histórico de orçamentos (avaliar necessidade)
- `configuracoes` - Configurações do sistema

---

## Próximos Passos

1. [ ] Testar aplicação V2 com dados migrados
2. [ ] Validar cálculos de frete no frontend
3. [ ] Validar seletor de produtos (3 níveis)
4. [ ] Migrar clientes e vendedores se necessário
5. [ ] Executar migrations pendentes no V2

---

## ⚠️ DIRETRIZES DO PROJETO

### Princípios de Desenvolvimento

Este projeto está em evolução para se tornar um **ERP completo**. Todo desenvolvimento deve seguir:

1. **SEGURANÇA PRIMEIRO**
   - Nunca executar ações destrutivas sem confirmação explícita
   - Sempre fazer backup antes de alterações em produção
   - Validar dados antes de qualquer migração
   - Usar transações quando possível

2. **ROBUSTEZ**
   - Código deve ser resiliente a falhas
   - Tratamento de erros em todas as operações
   - Logs detalhados para debugging
   - Validações em múltiplas camadas (frontend + backend + banco)

3. **ESCALABILIDADE**
   - Arquitetura multi-tenant desde o início
   - Índices otimizados para consultas frequentes
   - Paginação em listagens grandes
   - Cache quando apropriado

4. **USER FRIENDLY**
   - Interface intuitiva
   - Mensagens de erro claras
   - Feedback visual para ações do usuário
   - Fluxos de trabalho simplificados

5. **PROCESSO DE DESENVOLVIMENTO**
   - ❌ Não inventar funcionalidades sem consultar
   - ✅ Sempre sugerir e aguardar aprovação
   - ✅ Pensar nas futuras aplicações e integrações
   - ✅ Documentar todas as alterações
   - ✅ Manter compatibilidade com dados existentes

### Visão de Longo Prazo

O sistema evoluirá para incluir:
- Gestão completa de vendas
- Controle de estoque
- Financeiro (contas a pagar/receber)
- Logística e entregas
- Relatórios gerenciais
- Integrações (NF-e, bancos, transportadoras)

**Toda decisão técnica deve considerar essa evolução.**

---

## Arquivos Relacionados

- `/docs/MIGRACAO_V1_V2_COMPLETA.md` - Este documento
- `/transcripts/` - Logs detalhados das conversas de migração

---

*Documento gerado em 26/01/2026 durante sessão de migração.*
