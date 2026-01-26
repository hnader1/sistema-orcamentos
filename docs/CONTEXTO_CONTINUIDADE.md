# Contexto de Continuidade - Sistema Orçamentos V2

**Última atualização:** 26/01/2026

---

## 🚀 Status Atual

### Migração V1 → V2: ✅ COMPLETA

| Tabela | Qtd | Status |
|--------|-----|--------|
| Produtos | 195 | ✅ |
| Fretes | 570 (114 cidades) | ✅ |
| Formas de Pagamento | 32 | ✅ |

---

## 🔗 Ambientes

### V1 - Produção (Sistema Atual)
- **Project ID:** `qjoopvydmqkyrormqocq`
- **URL:** `https://qjoopvydmqkyrormqocq.supabase.co`

### V2 - Desenvolvimento (Novo Sistema)
- **Project ID:** `rxkxuadsdpatzmkhgqgq`
- **URL:** `https://rxkxuadsdpatzmkhgqgq.supabase.co`

### Tenant
- **Construcom:** `e9c647db-ef72-4d71-a86c-289763a5ffba`

---

## 📝 Alterações Recentes no Schema V2

```sql
-- 26/01/2026 - Formas de pagamento
ALTER TABLE formas_pagamento 
ADD COLUMN categoria VARCHAR(50),
ADD COLUMN parcelas INTEGER DEFAULT 1,
ADD COLUMN ordem INTEGER;
```

---

## 📋 Pendências

- [ ] Testar aplicação V2 com dados migrados
- [ ] Validar cálculos de frete no frontend
- [ ] Validar seletor de produtos (3 níveis)
- [ ] Migrar clientes e vendedores (se necessário)
- [ ] Executar migrations pendentes no V2

---

## ⚠️ DIRETRIZES OBRIGATÓRIAS

### Para o Assistente (Claude)

1. **NÃO INVENTAR NADA**
   - Nunca implementar funcionalidades sem perguntar primeiro
   - Sempre sugerir e aguardar aprovação explícita

2. **SEGURANÇA E ROBUSTEZ**
   - Priorizar segurança em todas as decisões
   - Nunca executar ações destrutivas sem confirmação
   - Sempre validar dados antes de operações

3. **VISÃO DE FUTURO**
   - Pensar nas futuras aplicações e integrações
   - Este projeto evoluirá para um ERP completo
   - Toda decisão técnica deve considerar escalabilidade

4. **QUALIDADE DO PRODUTO**
   - Robusto: código resiliente a falhas
   - Seguro: validações em múltiplas camadas
   - User Friendly: interface intuitiva
   - Escalável: arquitetura multi-tenant

---

## 🏗️ Visão do Produto

O Sistema Orçamentos evoluirá para incluir:

- Gestão completa de vendas
- Controle de estoque
- Financeiro (contas a pagar/receber)
- Logística e entregas
- Relatórios gerenciais
- Integrações (NF-e, bancos, transportadoras)

---

## 📚 Documentos Relacionados

- [Relatório de Migração Completo](./MIGRACAO_V1_V2_COMPLETA.md)
- [Credenciais e Config](../references/credentials.json) - NÃO COMMITAR

---

## 🔧 Como Usar Este Documento

Cole no início de novos chats:

```
Leia o documento /docs/CONTEXTO_CONTINUIDADE.md no repositório 
github.com/hnader1/sistema-orcamentos para contexto do projeto.
```

---

*Mantenha este documento atualizado a cada sessão de trabalho.*
