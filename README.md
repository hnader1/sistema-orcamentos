# 🚀 Sistema de Orçamentos

Sistema completo de gestão de orçamentos com React + Supabase + Vercel

## 📋 Características

- ✅ **Gestão de Produtos**: Cadastro completo com 188 produtos
- ✅ **Sistema de Orçamentos**: Criação, edição e gerenciamento
- ✅ **Cálculo de Frete**: Automático por cidade e veículo
- ✅ **Responsivo**: Funciona perfeitamente em mobile e desktop
- ✅ **Banco de Dados**: PostgreSQL (Supabase)
- ✅ **Deploy Automático**: Vercel

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Hospedagem**: Vercel
- **Ícones**: Lucide React

## 📦 Instalação Local

### 1. Clone o repositório
\`\`\`bash
git clone <seu-repositorio>
cd sistema-orcamentos-web
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configure o Supabase



#### 3.1 Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Crie um novo projeto
5. Escolha uma senha forte para o banco de dados
6. Escolha a região mais próxima (ex: South America - São Paulo)
7. Aguarde alguns minutos até o projeto ser criado

#### 3.2 Configurar o banco de dados
1. No painel do Supabase, vá em "SQL Editor"
2. Clique em "New Query"
3. Copie e cole o conteúdo de `supabase/schema.sql`
4. Clique em "Run" para criar todas as tabelas
5. Crie uma nova query e execute `supabase/seed-produtos.sql` para carregar os 188 produtos

#### 3.3 Obter as credenciais
1. No painel do Supabase, vá em "Settings" → "API"
2. Copie a "URL" e a "anon public" key
3. Crie um arquivo `.env` na raiz do projeto:

\`\`\`bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
\`\`\`

### 4. Execute o projeto
\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

## 🌐 Deploy na Vercel

### 1. Prepare o repositório
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
\`\`\`

### 2. Crie um repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Dê um nome ao repositório
4. Clique em "Create repository"

### 3. Push para o GitHub
\`\`\`bash
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git branch -M main
git push -u origin main
\`\`\`

### 4. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório que você acabou de criar
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: Sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: Sua chave anon do Supabase
6. Clique em "Deploy"
7. Aguarde alguns minutos

✅ Pronto! Seu sistema estará online em: `https://seu-projeto.vercel.app`

## 📱 Uso no Celular

O sistema é totalmente responsivo e funciona perfeitamente em celulares:
- Navegação otimizada para touch
- Layout adaptativo
- Botões e inputs com tamanho adequado
- Tabelas com scroll horizontal quando necessário

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais:
- **produtos**: Catálogo de produtos (188 itens)
- **clientes**: Cadastro de clientes
- **orcamentos**: Orçamentos criados
- **orcamentos_itens**: Itens de cada orçamento
- **orcamentos_historico**: Histórico de alterações
- **fretes**: Tabela de fretes por cidade

## 🔧 Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm run preview`: Preview do build de produção

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

## 📄 Licença

MIT License - use como quiser!
