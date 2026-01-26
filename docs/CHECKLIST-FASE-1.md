# ✅ CHECKLIST FASE 1 - CORE + AUTH

**Status**: 🔄 Em Andamento
**Progresso**: ~40%
**Última atualização**: 26/01/2026

---

## Progresso Geral

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░ 40%

Setup Inicial:    ▓▓▓▓▓▓░░░░ 60%  ✅ Supabase, 🔄 Monorepo
Banco de Dados:   ▓▓▓▓▓▓▓▓░░ 80%  ✅ Tabelas + Dados
Migração Dados:   ▓▓▓▓▓▓▓▓▓▓ 100% ✅ COMPLETO
Autenticação:     ▓▓▓▓░░░░░░ 40%  🔄 Estrutura pronta
Central Comando:  ▓░░░░░░░░░ 10%  ⏳ Planejado
Frontend:         ░░░░░░░░░░ 0%   ⏳ Não iniciado
```

---

## 1. Setup Inicial

### 1.1 Supabase V2

- [x] Criar projeto Supabase V2 (rxkxuadsdpatzmkhgqgq)
- [x] Configurar URL e chaves
- [x] Habilitar Auth
- [ ] Configurar Edge Functions

### 1.2 Repositório

- [x] Repositório existe (sistema-orcamentos)
- [ ] Separar código V1 do V2
- [ ] Configurar variáveis de ambiente para V2
- [ ] Testar build com banco V2

---

## 2. Banco de Dados ✅ QUASE COMPLETO

### 2.1 Tabelas de Sistema

- [x] `tenants` - Empresas
- [x] `profiles` - Usuários (vinculado auth.users)
- [x] `roles` - Papéis (6 criados)
- [x] `permissions` - Permissões (31 criadas)
- [x] `role_permissions` - Relação roles↔permissions
- [x] `user_roles` - Relação usuários↔roles
- [x] `audit_logs` - Logs de auditoria

### 2.2 Tabelas de Negócio (Migradas)

- [x] `produtos` - 195 registros ✅
- [x] `fretes` - 570 registros (114 cidades × 5 tipos) ✅
- [x] `formas_pagamento` - 32 registros ✅

### 2.3 Tabelas de Negócio (Pendentes)

- [ ] `clientes` - Avaliar necessidade de migrar
- [ ] `vendedores` - Avaliar necessidade de migrar
- [ ] `orcamentos` - Avaliar necessidade de migrar
- [ ] `orcamentos_itens` - Avaliar necessidade de migrar
- [ ] `propostas` - Avaliar necessidade de migrar
- [ ] `configuracoes` - Avaliar necessidade de migrar

### 2.4 RLS (Row Level Security)

- [x] RLS habilitado nas tabelas
- [x] Policies de isolamento por tenant
- [ ] Testar isolamento entre tenants

### 2.5 Funções Helper

- [ ] `current_tenant_id()` - Retorna tenant do usuário
- [ ] `check_permission()` - Verifica permissão
- [ ] `get_business_rule()` - Retorna regra de negócio

---

## 3. Migração de Dados ✅ COMPLETO

### 3.1 Produtos (195)

- [x] Exportar do V1
- [x] Mapear campos (codigo_sistema→codigo, produto→nome)
- [x] Ajustar tipos e unidades
- [x] Inserir no V2
- [x] Validar contagem

### 3.2 Fretes (570)

- [x] Exportar do V1 (114 cidades)
- [x] Mapear estrutura (modalidade, tipo_veiculo)
- [x] Inserir no V2 (5 combinações por cidade)
- [x] Validar contagem

### 3.3 Formas de Pagamento (32)

- [x] Exportar do V1
- [x] **Alterar schema V2** (+categoria, +parcelas, +ordem)
- [x] Inserir no V2
- [x] Validar contagem

---

## 4. Autenticação 🔄 EM ANDAMENTO

### 4.1 Supabase Auth

- [x] Auth habilitado
- [x] Provider email/senha configurado
- [ ] Testar login real
- [ ] Configurar templates de email

### 4.2 Contextos React

- [ ] AuthProvider funcionando
- [ ] TenantProvider funcionando
- [ ] PermissionProvider funcionando

### 4.3 Hooks

- [ ] `useAuth()` - Testado e funcionando
- [ ] `useTenant()` - Testado e funcionando
- [ ] `usePermission()` - Testado e funcionando

### 4.4 Componentes de Proteção

- [ ] ProtectedRoute - Redireciona se não autenticado
- [ ] RequirePermission - Esconde se não tem permissão

---

## 5. Frontend 🔴 NÃO INICIADO

### 5.1 Página de Login

- [ ] Componente LoginForm
- [ ] Validação de campos
- [ ] Feedback de erro
- [ ] Redirect após login

### 5.2 Dashboard

- [ ] Página inicial após login
- [ ] Mostrar dados do usuário
- [ ] Menu de navegação

### 5.3 Página de Orçamentos ⭐ PRIORIDADE

- [ ] Listar orçamentos
- [ ] Criar novo orçamento
- [ ] **Formulário funcionando com dados V2**
- [ ] Seletor de produtos (3 níveis)
- [ ] Cálculo de frete
- [ ] Formas de pagamento

---

## 6. Central de Comando ⏳ PLANEJADO

- [ ] Listagem de usuários
- [ ] CRUD de usuários
- [ ] Gestão de roles
- [ ] Matriz de permissões
- [ ] Regras de negócio

---

## 7. Deploy ⏳ AGUARDANDO

- [ ] Variáveis de ambiente na Vercel
- [ ] Build passando
- [ ] Deploy em staging
- [ ] Testes em staging

---

## Critérios de Conclusão da Fase 1

- [ ] ✅ Login funcionando com Supabase Auth
- [ ] ✅ Usuário é associado a um tenant no login
- [ ] ✅ Todas as queries filtradas por tenant (RLS)
- [ ] ✅ Sistema de roles/permissões funcionando
- [ ] ✅ Página de orçamentos funcionando com dados V2
- [ ] ✅ Deploy na Vercel funcionando

---

## Notas e Observações

```
26/01/2026:
- Migração de dados COMPLETA (produtos, fretes, formas pgto)
- Schema formas_pagamento alterado (+3 campos)
- Próximo passo: fazer frontend funcionar com V2

23/01/2025:
- Planejamento inicial completo
- Projeto Supabase V2 criado
- Estrutura de tabelas criada
```

---

*Última atualização: 26/01/2026*