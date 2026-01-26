# 🧠 CONTEXTO MASTER - SISTEMA ORÇAMENTOS V2

> **DOCUMENTO CENTRAL** - Sempre consulte este arquivo primeiro em novos chats.
> **Última atualização**: 26/01/2026

---

## 🎯 Resumo do Projeto

Sistema de gestão empresarial **multi-tenant** para grupo de empresas de construção civil. Substituindo sistema V1 (JavaScript) por V2 (TypeScript com Clean Architecture).

---

## 👤 Sobre o Cliente

| Campo | Informação |
|-------|------------|
| **Nome** | Nader |
| **Localização** | Pedro Leopoldo, MG, Brasil |
| **Perfil** | Administrador (não programador) |
| **Email** | hnader@gmail.com |

### Empresas do Grupo

| Empresa | Status |
|---------|--------|
| **Construcom Artefatos de Cimento** | ✅ Principal (tenant ativo) |
| Unistein do Brasil | ⏳ Futura |
| Minerações Gerais | ⏳ Futura |
| RHF-T Transportadora | ⏳ Futura |

---

## 🔗 Ambientes e Credenciais

### Supabase

| Ambiente | Project ID | URL | Status |
|----------|------------|-----|--------|
| **V1 Produção** | `qjoopvydmqkyrormqocq` | qjoopvydmqkyrormqocq.supabase.co | ⚠️ **NÃO MEXER** |
| **V2 Desenvolvimento** | `rxkxuadsdpatzmkhgqgq` | rxkxuadsdpatzmkhgqgq.supabase.co | ✅ Ativo |

### Tenant Ativo

| Campo | Valor |
|-------|-------|
| **Tenant ID** | `e9c647db-ef72-4d71-a86c-289763a5ffba` |
| **Nome** | Construcom Artefatos de Cimento |

### GitHub

| Repo | URL | Conteúdo |
|------|-----|----------|
| **Principal** | github.com/hnader1/sistema-orcamentos | Código V1 + Docs V2 |

---

## 📊 STATUS ATUAL DO PROJETO

### Fase 1: Core + Auth - 🔄 EM ANDAMENTO (~40%)

```
Setup Inicial:    ▓▓▓▓▓▓░░░░ 60%  (monorepo parcial)
Banco de Dados:   ▓▓▓▓▓▓▓▓░░ 80%  (tabelas + dados migrados)
Autenticação:     ▓▓▓▓░░░░░░ 40%  (estrutura criada)
Central Comando:  ▓░░░░░░░░░ 10%  (planejado)
Frontend:         ░░░░░░░░░░  0%  (não iniciado)
```

---

## ✅ O QUE JÁ FOI FEITO

### Migração de Dados V1 → V2 (26/01/2026)

| Tabela | Quantidade | Status |
|--------|------------|--------|
| **Produtos** | 195 | ✅ Completo |
| **Fretes** | 570 (114 cidades MG) | ✅ Completo |
| **Formas Pagamento** | 32 | ✅ Completo |

### Alterações no Schema V2

```sql
-- 26/01/2026 - Formas de pagamento (campos adicionados)
ALTER TABLE formas_pagamento 
ADD COLUMN categoria VARCHAR(50),
ADD COLUMN parcelas INTEGER DEFAULT 1,
ADD COLUMN ordem INTEGER;
```

### Estrutura de Fretes

- 114 cidades em Minas Gerais
- 5 combinações por cidade (modalidade × tipo_veiculo)
- Modalidades: CIF_COM_DESCARGA, CIF_SEM_DESCARGA
- Tipos: Toco 8t, Truck 14t, Carreta 32t

### Tabelas Criadas no V2

| Tabela | RLS | Dados |
|--------|-----|-------|
| `tenants` | ✅ | 1 (Construcom) |
| `profiles` | ✅ | Configurado |
| `roles` | ✅ | 6 padrão |
| `permissions` | ✅ | 31 |
| `role_permissions` | ✅ | Configurado |
| `user_roles` | ✅ | Configurado |
| `audit_logs` | ✅ | Configurado |
| `produtos` | ✅ | 195 |
| `fretes` | ✅ | 570 |
| `formas_pagamento` | ✅ | 32 |

---

## ❌ O QUE FALTA FAZER

### Fase 1 (Pendente)

- [ ] **Frontend funcionando** - Tela de login e dashboard
- [ ] **Página de Orçamentos** - Formulário principal
- [ ] **Deploy Vercel** - Publicar V2 online
- [ ] **Central de Comando** - Interface admin
- [ ] **Testes** - Validar fluxos

### Migração Pendente (Avaliar necessidade)

- [ ] Clientes
- [ ] Vendedores
- [ ] Orçamentos existentes
- [ ] Configurações

---

## 🗺️ ROADMAP

| Fase | Nome | Status | Progresso |
|------|------|--------|----------|
| **0** | Planejamento | ✅ Concluído | 100% |
| **1** | Core + Auth + Migração | 🔄 Em andamento | 40% |
| **2** | Módulos Base | ⏳ Próxima | 0% |
| **3** | Mobile | ⏳ Aguardando | 0% |
| **4** | ERP + BI | ⏳ Aguardando | 0% |
| **5** | Logística | ⏳ Aguardando | 0% |
| **6** | PCP/Produção | ⏳ Aguardando | 0% |

---

## ⚠️ REGRAS OBRIGATÓRIAS

### Para o Claude (Assistente)

1. **NÃO INVENTAR** - Nunca implementar sem perguntar
2. **SEMPRE SUGERIR** - Aguardar aprovação explícita
3. **SEGURANÇA PRIMEIRO** - Validar antes de executar
4. **NUNCA MEXER NO V1** - Supabase qjoopvydmqkyrormqocq é PRODUÇÃO
5. **DOCUMENTAR** - Atualizar este documento após cada sessão

### Princípios do Projeto

- **Robusto**: Código resiliente a falhas
- **Seguro**: Validações em múltiplas camadas
- **User Friendly**: Interface intuitiva
- **Escalável**: Arquitetura multi-tenant
- **Futuro**: Evoluirá para ERP completo

---

## 📁 Documentos Relacionados

| Documento | Localização | Conteúdo |
|-----------|-------------|----------|
| CONTEXTO-MASTER.md | `/docs/` | Este arquivo |
| MIGRACAO_V1_V2_COMPLETA.md | `/docs/` | Detalhes da migração |
| PROGRESSO.md | `/docs/` | Status visual |
| CHECKLIST-FASE-1.md | `/docs/` | Checklist detalhado |
| SCHEMA.md | `/docs/` | Estrutura do banco |
| ARQUITETURA.md | `/docs/` | Arquitetura técnica |
| FASES.md | `/docs/` | Roadmap detalhado |
| DECISOES.md | `/docs/` | Decisões técnicas (ADR) |

---

## 📋 PRÓXIMOS PASSOS IMEDIATOS

1. **Fazer página de orçamentos funcionar** no V2
2. **Verificar incompatibilidades** entre código e schema V2
3. **Testar localmente** antes de deploy
4. **Deploy na Vercel** com variáveis do V2

---

## 🕐 Histórico de Sessões

| Data | Duração | O que foi feito |
|------|---------|----------------|
| 23/01/2025 | ~3h | Planejamento completo |
| 23/01/2025 | ~1h | Setup inicial V2 |
| 26/01/2026 | ~4h | Migração completa: produtos, fretes, formas pagamento |

---

## 📝 Para Iniciar Novo Chat

Cole isto:

```
Leia o documento /docs/CONTEXTO-MASTER.md no repositório 
github.com/hnader1/sistema-orcamentos para contexto completo.

Sessão de hoje:
- Objetivo: [o que quer fazer]
- Tempo: [quanto tempo tem]
```

---

*Mantenha este documento sempre atualizado!*