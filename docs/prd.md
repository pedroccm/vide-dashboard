# PRD - Vibe Dashboard (Shadcn Admin)

## 📋 Visão Geral do Produto

**Nome do Projeto:** Vibe Dashboard (baseado em Shadcn Admin)
**Versão:** 2.1.0
**Tipo:** Dashboard Administrativo Web
**Stack Principal:** React + TypeScript + Vite + TanStack Router + Supabase

### Descrição
Sistema de dashboard administrativo moderno construído com ShadcnUI, oferecendo uma interface responsiva e acessível para gerenciamento de usuários, tarefas, repositórios GitHub e integração OAuth. O projeto utiliza Supabase como backend (PostgreSQL) com autenticação e Row Level Security (RLS).

---

## 🎯 Objetivos do Produto

### Objetivos Primários
1. **Dashboard Administrativo Completo**: Fornecer uma interface unificada para gerenciamento de múltiplas entidades
2. **Integração GitHub**: Conectar contas GitHub via OAuth e gerenciar repositórios
3. **Autenticação Segura**: Sistema robusto de autenticação com Supabase e RLS
4. **Experiência de Usuário Superior**: Interface moderna, responsiva e acessível
5. **RTL Support**: Suporte completo para idiomas com escrita da direita para esquerda

### Objetivos Secundários
- Sistema de temas (light/dark mode)
- Busca global via command palette
- Gerenciamento de perfis e preferências de usuários
- Chat/mensagens entre usuários
- Sistema de notificações

---

## 👥 Personas e Stakeholders

### Persona 1: Administrador do Sistema
- **Necessidades**: Gerenciar usuários, visualizar métricas, controlar acessos
- **Objetivos**: Ter visão completa do sistema, tomar decisões baseadas em dados
- **Dores**: Múltiplas ferramentas desconectadas, falta de visibilidade

### Persona 2: Desenvolvedor/Gerente de Projetos
- **Necessidades**: Gerenciar repositórios GitHub, acompanhar tarefas
- **Objetivos**: Centralizar gestão de projetos, integrar com GitHub
- **Dores**: Alternar entre múltiplas plataformas, falta de integração

### Persona 3: Usuário Regular
- **Necessidades**: Acesso às próprias tarefas, perfil personalizável
- **Objetivos**: Produtividade, organização pessoal
- **Dores**: Interfaces complexas, falta de personalização

---

## 🎨 Funcionalidades

### Core Features (Implementadas)

#### 1. Autenticação e Autorização
- **Sign Up/Sign In**: Registro e login com email/senha
- **OAuth GitHub**: Login social via GitHub
- **Recuperação de Senha**: Flow completo de forgot password
- **OTP/2FA**: Autenticação de dois fatores
- **Roles**: Sistema de permissões (user, admin, moderator)
- **RLS**: Row Level Security no Supabase para isolamento de dados

#### 2. Gerenciamento de Usuários
- **CRUD Completo**: Criar, ler, atualizar e deletar usuários
- **Perfis Estendidos**: Informações adicionais (bio, website, location, timezone)
- **Avatar**: Upload e gerenciamento de foto de perfil
- **Bulk Actions**: Ações em lote (delete múltiplos usuários)
- **Filtros e Busca**: Data table com filtros avançados
- **Paginação**: Navegação eficiente em grandes listas

#### 3. Sistema de Tarefas
- **Task Management**: Criação e gerenciamento de tarefas
- **Status Tracking**: Acompanhamento de status (todo, in progress, done)
- **Data Table**: Tabela interativa com sorting e filtering
- **Bulk Operations**: Operações em múltiplas tarefas

#### 4. Integração GitHub
- **OAuth Connection**: Conectar conta GitHub
- **Token Storage**: Armazenamento seguro de tokens OAuth no Supabase
- **Repository Listing**: Listar repositórios do usuário
- **Repository Details**: Visualizar detalhes de repositórios (stars, forks, language)
- **Repository Management**: CRUD de repositórios (tabela `sa_repositories`)
- **Commits History**: Histórico de commits dos repositórios

#### 5. Configurações/Settings
- **Account Settings**: Gerenciar dados da conta
- **Appearance**: Preferências de tema (light/dark/system)
- **Display**: Configurações de exibição e idioma
- **Notifications**: Preferências de notificações
- **Timezone/Language**: Configurações de localização

#### 6. Dashboard e Analytics
- **Dashboard Principal**: Visão geral do sistema
- **Métricas**: Cards com KPIs e estatísticas
- **Charts**: Gráficos com Recharts
- **Recent Activity**: Atividades recentes

#### 7. Sistema de Navegação
- **Sidebar**: Menu lateral colapsável e responsivo
- **Breadcrumbs**: Navegação contextual
- **Global Search**: Command palette (Cmd/Ctrl+K)
- **Top Loading Bar**: Indicador de carregamento de páginas

#### 8. UI/UX Features
- **Responsive Design**: Mobile-first, adaptável a todos os dispositivos
- **Accessibility**: Componentes acessíveis (ARIA, keyboard navigation)
- **RTL Support**: Suporte para idiomas RTL (árabe, hebraico, etc.)
- **Dark Mode**: Sistema completo de temas
- **Toast Notifications**: Feedback visual com Sonner
- **Loading States**: Estados de carregamento em todas as operações
- **Error Handling**: Páginas customizadas (401, 403, 404, 500, 503)

### Features Parciais ou Planejadas

#### 9. Chat/Mensagens
- **Status**: UI implementada, backend pendente
- **Objetivo**: Sistema de mensagens entre usuários

#### 10. Apps Marketplace
- **Status**: Estrutura básica criada
- **Objetivo**: Marketplace de apps/extensões

#### 11. Help Center
- **Status**: Rota criada
- **Objetivo**: Central de ajuda e documentação

---

## 🏗️ Arquitetura Técnica

### Tech Stack

#### Frontend
- **Framework**: React 19.1.1 + TypeScript 5.9
- **Build Tool**: Vite 7.1.2
- **Routing**: TanStack Router 1.131.16
- **State Management**: Zustand 5.0.7 + TanStack Query 5.85.3
- **UI Library**: ShadcnUI (Radix UI + TailwindCSS 4.1.12)
- **Forms**: React Hook Form 7.62.0 + Zod 4.0.17
- **Icons**: Lucide React 0.542.0
- **Charts**: Recharts 3.1.2

#### Backend/Database
- **BaaS**: Supabase 2.57.2 (PostgreSQL)
- **Authentication**: Supabase Auth (email/password + OAuth GitHub)
- **Storage**: Supabase Storage (para avatares)
- **Real-time**: Supabase Realtime (planejado)

#### Developer Tools
- **Linting**: ESLint 9.33.0
- **Formatting**: Prettier 3.6.2
- **Type Safety**: TypeScript strict mode
- **Dead Code Detection**: Knip 5.62.0

### Estrutura de Pastas

```
src/
├── routes/                    # TanStack Router routes
│   ├── (auth)/               # Rotas públicas de autenticação
│   ├── (errors)/             # Páginas de erro
│   ├── _authenticated/       # Rotas protegidas
│   └── __root.tsx           # Layout raiz
├── features/                 # Feature-based modules
│   ├── auth/                # Autenticação
│   ├── users/               # Gerenciamento de usuários
│   ├── tasks/               # Sistema de tarefas
│   ├── github/              # Integração GitHub
│   ├── repositories/        # Gerenciamento de repos
│   ├── settings/            # Configurações
│   ├── dashboard/           # Dashboard principal
│   ├── chats/               # Sistema de chat
│   └── apps/                # Apps marketplace
├── components/              # Componentes compartilhados
│   ├── ui/                  # ShadcnUI components
│   ├── data-table/          # Data table components
│   ├── layout/              # Layout components
│   └── ...
├── lib/                     # Utilitários e configs
│   ├── supabase.ts         # Cliente Supabase
│   └── utils.ts            # Funções auxiliares
└── hooks/                   # Custom React hooks
```

### Database Schema

**Prefixo**: `sa_` (shadcn-admin)

#### Tabelas Principais

1. **sa_users**
   - Tabela principal de usuários (linked to auth.users)
   - Colunas: id, email, created_at, updated_at

2. **sa_user_profiles**
   - Perfis estendidos com preferências
   - Colunas: id, user_id, name, avatar_url, role, bio, website, location, timezone, language, theme, email_notifications

3. **sa_github_profiles**
   - Conexões OAuth GitHub e tokens
   - Colunas: id, user_id, github_user_id, github_username, access_token, scope, avatar_url, name, email

4. **sa_repositories** (opcional)
   - Repositórios GitHub salvos
   - Colunas: id, name, full_name, description, url, language, stars, forks, status, category, priority

#### Security (RLS)

- Usuários veem apenas seus próprios dados
- Admins têm acesso a todos os dados
- Função `is_admin()` com SECURITY DEFINER
- Políticas separadas por operação (SELECT, INSERT, UPDATE, DELETE)

#### Triggers

- `sa_handle_new_user()`: Cria perfil automaticamente no signup
- `sa_update_updated_at()`: Atualiza timestamps automaticamente

---

## 🔐 Segurança

### Implementações de Segurança

1. **Row Level Security (RLS)**: Isolamento de dados no PostgreSQL
2. **OAuth 2.0**: Integração segura com GitHub
3. **Token Storage**: Tokens salvos no Supabase (não localStorage)
4. **Password Hashing**: Gerenciado pelo Supabase Auth
5. **HTTPS Only**: Todas as requisições via HTTPS
6. **CORS**: Configurado no Supabase
7. **Input Validation**: Zod schemas em todos os forms
8. **XSS Protection**: React escaping automático

### Variáveis de Ambiente

```bash
VITE_SUPABASE_URL=https://yyfealwxpebzezfximhg.supabase.co
VITE_SUPABASE_ANON_KEY=<key>
VITE_GITHUB_CLIENT_ID=Ov23li7HPBStIZDvFWOi
VITE_GITHUB_CLIENT_SECRET=<secret>
```

---

## 📊 Métricas e KPIs

### Métricas de Produto
- **Total de Usuários Cadastrados**
- **Taxa de Conversão (Sign Up → Login)**
- **Usuários Ativos Mensais (MAU)**
- **Taxa de Retenção**
- **Tempo Médio na Plataforma**

### Métricas Técnicas
- **Performance (Lighthouse Score)**: Target > 90
- **Bundle Size**: Atual ~800KB (gzip)
- **First Contentful Paint (FCP)**: Target < 1.5s
- **Time to Interactive (TTI)**: Target < 3.5s
- **Uptime**: Target > 99.5%

### Métricas de Negócio
- **Custo por Usuário (Supabase)**
- **Taxa de Conversão GitHub OAuth**
- **Repositórios Conectados**
- **Tarefas Criadas/Completadas**

---

## 🗓️ Roadmap

### Q1 2025 (Completed)
- ✅ Setup inicial do projeto
- ✅ Autenticação com Supabase
- ✅ CRUD de usuários
- ✅ Sistema de tarefas
- ✅ Integração GitHub OAuth
- ✅ Dashboard principal
- ✅ Settings/preferências
- ✅ Dark mode
- ✅ RTL support
- ✅ Migração localStorage → Supabase

### Q2 2025 (Planejado)
- 🔄 Sistema de chat/mensagens completo
- 🔄 Apps marketplace funcional
- 🔄 Help center com documentação
- 🔄 Sistema de notificações real-time
- 🔄 Webhooks GitHub
- 🔄 Analytics avançado

### Q3 2025 (Backlog)
- 📋 API pública para integrações
- 📋 Mobile app (React Native)
- 📋 Exportação de dados (CSV, JSON)
- 📋 Auditoria e logs
- 📋 Billing/subscriptions

## 🚀 Deploy e Infraestrutura

### Ambientes

- **Development**: Local (Vite dev server)
- **Staging**: Netlify (auto-deploy de branches)
- **Production**: Netlify (deploy do main)

### CI/CD

- **Build**: TypeScript compilation + Vite build
- **Lint**: ESLint + Prettier check
- **Type Check**: tsc --noEmit
- **Deploy**: Automático via Netlify (push to main)

### Monitoramento

- **Database**: Supabase Dashboard (logs, metrics)
- **Frontend**: Netlify Analytics
- **Errors**: (A implementar: Sentry)

---

## 📝 Considerações Finais

### Pontos Fortes
- Interface moderna e acessível
- Stack tecnológico atual e bem suportado
- Segurança robusta com RLS
- Componentização e reutilização de código
- Documentação técnica completa

### Pontos de Melhoria
- Cobertura de testes automatizados
- Sistema de cache otimizado
- Performance em listas grandes (virtualização)
- Internacionalização (i18n) completa
- Error tracking e monitoring

### Dependências Críticas
- Supabase (BaaS): Database, Auth, Storage
- GitHub OAuth: Integração social
- Netlify: Hosting e deploy
- TanStack Router: Roteamento type-safe

---

## 📞 Contatos e Recursos

### Projeto Original
- **Autor**: [@satnaing](https://github.com/satnaing)
- **Repositório Base**: [shadcn-admin](https://github.com/satnaing/shadcn-admin)
- **Licença**: MIT

### Projeto Atual (Vibe Dashboard)
- **Repositório**: [vide-dashboard](https://github.com/pedroccm/vide-dashboard)
- **Deploy**: [vibeosdash.netlify.app](https://vibeosdash.netlify.app)
- **Documentação**: `/docs`
- **Database Setup**: `/docs/database/database_setup.sql`

### Links Úteis
- [Supabase Dashboard](https://supabase.com/dashboard)
- [ShadcnUI Docs](https://ui.shadcn.com)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Radix UI Docs](https://www.radix-ui.com)

---

**Última Atualização**: 2025-01-08
**Versão do Documento**: 1.0
**Status**: Em Produção