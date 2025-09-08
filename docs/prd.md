# PRD - Vibe OS Dashboard

## 📋 Visão Geral do Produto

**Vibe OS Dashboard** é uma plataforma moderna de gerenciamento de repositórios GitHub com interface drag-and-drop e sistema completo de autenticação. O projeto oferece uma experiência visual rica para desenvolvedores organizarem e monitorarem seus repositórios de forma eficiente.

---

## 🎯 Objetivos do Produto

### Objetivo Principal
Fornecer uma interface intuitiva e moderna para desenvolvedores gerenciarem seus repositórios GitHub, com funcionalidades avançadas de organização e visualização.

### Objetivos Específicos
- ✅ **Autenticação Segura**: Sistema OAuth com GitHub integrado ao Supabase
- ✅ **Gerenciamento Visual**: Interface drag-and-drop para organizar repositórios
- ✅ **Navegação Dinâmica**: Sidebar com submenus automáticos por repositório
- ✅ **Análise Detalhada**: Páginas individuais com informações e histórico de commits
- ✅ **Experiência Responsiva**: Interface adaptável para desktop e mobile

---

## 👥 Personas e Público-Alvo

### Persona Principal: **Desenvolvedor Organizado**
- **Perfil**: Desenvolvedor full-stack com múltiplos repositórios
- **Necessidades**: Organizar projetos, visualizar métricas, acompanhar commits
- **Dores**: Dificuldade em navegar entre muitos repos no GitHub
- **Ganhos**: Interface centralizada e visual para gerenciar portfólio

### Persona Secundária: **Tech Lead**
- **Perfil**: Líder técnico responsável por múltiplos projetos
- **Necessidades**: Monitorar progresso de equipes, acompanhar métricas
- **Dores**: Falta de visão consolidada dos projetos
- **Ganhos**: Dashboard unificado com dados relevantes

---

## ⭐ Funcionalidades Principais

### 🔐 **Sistema de Autenticação**
- **OAuth GitHub**: Integração nativa com autenticação GitHub
- **Supabase Backend**: Gerenciamento seguro de sessões e dados
- **Profile Management**: Sincronização automática de dados do usuário

### 📊 **Dashboard de Repositórios**
- **Lista Interativa**: Visualização de todos os repositórios do GitHub
- **Drag & Drop**: Interface intuitiva para salvar repositórios favoritos
- **Filtragem Inteligente**: Separação entre repositórios disponíveis e salvos
- **Cards Informativos**: Métricas visuais (stars, forks, linguagem)

### 🧭 **Navegação Dinâmica**
- **Sidebar Inteligente**: Menu que se atualiza automaticamente
- **Submenus Automáticos**: Cada repositório salvo vira um submenu
- **Breadcrumb Navigation**: Navegação contextual entre seções

### 📄 **Páginas Individuais dos Repositórios**
- **Aba Overview**: Informações completas do repositório
  - Métricas detalhadas (stars, forks, tamanho)
  - Informações técnicas (linguagem, branch, features)
  - Tópicos e tags
  - Links e URLs de acesso
- **Aba Commits**: Histórico detalhado de commits
  - Lista dos últimos 50 commits
  - Informações do autor com avatar
  - Mensagens e descrições completas
  - Links diretos para GitHub

### 🎨 **Interface e UX**
- **Design System**: ShadCN UI + Tailwind CSS
- **Tema Responsivo**: Suporte a light/dark mode
- **Componentes Modernos**: Drag-and-drop, loading states, animations
- **Acessibilidade**: Interface otimizada para diferentes dispositivos

---

## 🏗️ Arquitetura Técnica

### **Frontend**
- **Framework**: React 19 + TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS + ShadCN UI
- **State Management**: TanStack Query + Zustand
- **Drag & Drop**: Hello Pangea DnD

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + GitHub OAuth
- **API**: GitHub REST API + Octokit
- **Deploy**: Netlify (Frontend) + Netlify Functions

### **Estrutura de Dados**
```sql
-- Usuários e perfis
sa_users                  -- Dados básicos dos usuários
sa_user_profiles          -- Perfis estendidos
sa_github_profiles        -- Conexões GitHub com tokens

-- Repositórios
sa_repositories           -- Repositórios salvos pelo usuário
```

---

## 🚀 Roadmap de Desenvolvimento

### ✅ **Fase 1: Fundação** (Concluída)
- [x] Setup do projeto com React + TypeScript
- [x] Configuração Supabase + autenticação
- [x] Interface básica com ShadCN UI
- [x] Integração GitHub OAuth

### ✅ **Fase 2: Core Features** (Concluída)
- [x] Sistema de repositórios com drag & drop
- [x] Sidebar dinâmica com submenus
- [x] Páginas individuais dos repositórios
- [x] Visualização de commits e métricas

### 🔄 **Fase 3: Melhorias** (Em Andamento)
- [ ] Otimização de performance e bundle size
- [ ] Testes automatizados (Jest + Testing Library)
- [ ] Melhoria da experiência mobile
- [ ] Cache inteligente de dados

### 🔮 **Fase 4: Funcionalidades Avançadas** (Futuro)
- [ ] Análise de linguagens e tecnologias
- [ ] Gráficos de atividade e estatísticas
- [ ] Sistema de tags e categorização
- [ ] Exportação de dados e relatórios
- [ ] Integração com outras plataformas Git

---

## 📊 Métricas de Sucesso

### **Métricas Técnicas**
- **Performance**: Lighthouse Score > 90
- **Build Time**: < 30 segundos
- **Bundle Size**: Chunks principais < 500KB
- **Uptime**: > 99.5% (Netlify)

### **Métricas de Usuário**
- **Time to First Interaction**: < 2 segundos
- **OAuth Success Rate**: > 95%
- **Error Rate**: < 1% das sessões
- **User Retention**: Medição após implementação

### **Métricas de Negócio**
- **Repository Management**: Repositórios salvos por usuário
- **Feature Adoption**: Uso das abas Overview vs Commits
- **User Engagement**: Tempo médio na plataforma

---

## 🔒 Considerações de Segurança

### **Autenticação e Autorização**
- ✅ OAuth 2.0 com GitHub (fluxo seguro)
- ✅ Tokens armazenados de forma criptografada
- ✅ Validação de estado CSRF
- ✅ Row Level Security (RLS) no Supabase

### **Dados Sensíveis**
- ✅ Service Role Key apenas no backend
- ✅ Tokens GitHub com escopo limitado
- ✅ Sanitização de dados de entrada
- ✅ Logs de segurança e auditoria

### **Deploy e Infraestrutura**
- ✅ HTTPS obrigatório em produção
- ✅ Variáveis de ambiente seguras
- ✅ Rate limiting nas APIs
- ✅ Backup automático do banco

---

## 📱 Experiência do Usuário

### **Jornada Típica do Usuário**
1. **Acesso**: Visita o dashboard → Clica em "Connect with GitHub"
2. **Autenticação**: OAuth GitHub → Autoriza aplicação
3. **Descoberta**: Visualiza repositórios → Arrasta favoritos para salvar
4. **Exploração**: Navega pelo menu → Acessa repositório específico
5. **Análise**: Explora informações → Visualiza commits recentes

### **Momentos de Deleite**
- 🎯 **Drag & Drop Intuitivo**: Feedback visual imediato
- 🌟 **Sidebar Dinâmica**: Atualização automática dos menus
- 🎨 **Loading States**: Skeleton loaders suaves
- 🔄 **Real-time Updates**: Sincronização com GitHub

---

## 🛠️ Manutenção e Suporte

### **Monitoramento**
- **Error Tracking**: Logs detalhados no browser e servidor
- **Performance**: Core Web Vitals e métricas de bundle
- **Uptime**: Monitoramento Netlify + status page

### **Updates e Releases**
- **Versionamento**: Semantic versioning (SemVer)
- **Deploy**: CI/CD automático via GitHub → Netlify
- **Rollback**: Capacidade de reversão rápida
- **Testing**: Testes em staging antes da produção

### **Documentação**
- ✅ **README.md**: Instruções de setup e desenvolvimento  
- ✅ **PRD.md**: Este documento de produto
- 📝 **API Docs**: Documentação dos serviços
- 📚 **User Guide**: Guia do usuário (futuro)

---

## 🎨 Design System e Marca

### **Visual Identity**
- **Nome**: Vibe OS Dashboard
- **Tagline**: "Organize your GitHub universe"
- **Cores**: Baseado no ShadCN UI (neutras + accent)
- **Tipografia**: Inter (UI) + Manrope (headings)

### **Componentes Principais**
- **Cards**: Repositórios com informações visuais
- **Dragables**: Elementos arrastáveis com feedback
- **Navigation**: Sidebar collapsible com submenus
- **Tabs**: Navegação entre seções de conteúdo

---

## 🚀 Conclusão

O **Vibe OS Dashboard** representa uma evolução na forma como desenvolvedores interagem com seus repositórios GitHub. Através de uma interface moderna, intuitiva e funcional, o projeto oferece:

- ✨ **Experiência Visual**: Interface drag-and-drop única
- 🔧 **Funcionalidade Robusta**: Sistema completo de gerenciamento
- 🔒 **Segurança First**: Autenticação e dados protegidos
- 📱 **Responsive Design**: Experiência consistente em qualquer device

O produto está posicionado para crescer e evoluir, com uma base sólida e arquitetura escalável que permite futuras expansões e integrações.

---

**Versão**: 2.1.0  
**Data**: Janeiro 2025  
**Status**: ✅ MVP Completo  
**Deploy**: [vibeosdash.netlify.app](https://vibeosdash.netlify.app)  
**Repositório**: [GitHub](https://github.com/pedroccm/vide-dashboard)

---

*Este PRD é um documento vivo e será atualizado conforme o produto evolui.*