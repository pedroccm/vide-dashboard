# Informações do Projeto - Vibe Dashboard

## 🔑 Credenciais e Acessos

### Login Principal do Sistema
- **Email**: pedroccm+1@gmail.com
- **Uso**: Login principal no dashboard

### Supabase (Database & Backend)
- **Email**: Ricardoneris133@gmail.com
- **Database**: PostgreSQL (hospedado no Supabase)

---

## 🌐 URLs e Links Importantes

### Produção
- **Dashboard**: https://vibeosdash.netlify.app
- **Repositório**: https://github.com/pedroccm/vide-dashboard

### Ferramentas de Desenvolvimento
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Netlify Dashboard**: https://app.netlify.com
- **GitHub Repository**: https://github.com/pedroccm/vide-dashboard

---

## 🔐 Variáveis de Ambiente

### Arquivo: `.env.local`

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://yyfealwxpebzezfximhg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=Ov23li7HPBStIZDvFWOi
VITE_GITHUB_CLIENT_SECRET=<secret-key-here>
```

> ⚠️ **Nota de Segurança**: Nunca commite o arquivo `.env.local` no Git. Ele deve estar no `.gitignore`.

---

## 📊 Database Information

### Supabase Project Details
- **Project Name**: vide-dashboard (ou nome configurado)
- **Region**: Configurado no Supabase
- **Database**: PostgreSQL 15+
- **Prefixo das Tabelas**: `sa_` (shadcn-admin)

### Tabelas Principais
1. `sa_users` - Usuários do sistema
2. `sa_user_profiles` - Perfis estendidos
3. `sa_github_profiles` - Conexões OAuth GitHub
4. `sa_repositories` - Repositórios salvos

### SQL Setup
- **Arquivo**: `docs/database/database_setup.sql`
- **Como Executar**:
  1. Acesse Supabase Dashboard → SQL Editor
  2. Cole o conteúdo do arquivo
  3. Execute (Run)

---

## 🔧 GitHub OAuth Configuration

### GitHub App Credentials
- **Client ID**: `Ov23li7HPBStIZDvFWOi`
- **Client Secret**: (armazenado em `.env.local`)

### Callback URLs Configuradas
- **Supabase**: `https://yyfealwxpebzezfximhg.supabase.co/auth/v1/callback`
- **Local Development**: `http://localhost:5173/auth/callback`

### Configuração no GitHub
1. Acesse: https://github.com/settings/developers
2. OAuth Apps → Sua aplicação
3. Verifique Callback URLs estão corretas

---

## 🚀 Deploy Information

### Netlify
- **Site Name**: vibeosdash (ou nome configurado)
- **Deploy Branch**: `main`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Auto-Deploy
- ✅ Push to `main` → Deploy automático em produção
- ✅ Pull Requests → Deploy preview automático

---

## 👤 Contas Admin

### Como Criar um Admin
Execute no Supabase SQL Editor:

```sql
UPDATE sa_user_profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM sa_users
  WHERE email = 'pedroccm+1@gmail.com'
);
```

### Verificar Admins Atuais
```sql
SELECT
  u.email,
  p.name,
  p.role
FROM sa_users u
JOIN sa_user_profiles p ON u.id = p.user_id
WHERE p.role = 'admin';
```

---

## 📝 Notas Importantes

### Backup e Segurança
- ✅ Supabase faz backup automático diário
- ✅ Tokens OAuth armazenados no banco (não localStorage)
- ✅ RLS (Row Level Security) ativo em todas as tabelas
- ✅ Políticas de acesso configuradas

### Manutenção
- **Logs do Database**: Supabase Dashboard → Logs
- **Logs do Deploy**: Netlify Dashboard → Deploys → Logs
- **Erros do Frontend**: Browser Console (temporário)

### Monitoramento
- **Database**: Supabase Dashboard → Database → Metrics
- **Frontend**: Netlify Analytics
- **API Requests**: Supabase Dashboard → API → Logs

---

## 🔄 Sincronização de Dados

### GitHub → Database
- Tokens OAuth salvos em `sa_github_profiles`
- Repositórios podem ser salvos em `sa_repositories`
- Commits são buscados via API em tempo real (não salvos)

### User Flow
1. Usuário faz login (email/senha ou GitHub OAuth)
2. Dados salvos em `sa_users` e `sa_user_profiles`
3. Se GitHub OAuth → dados salvos em `sa_github_profiles`
4. Repositórios podem ser salvos localmente na tabela

---

## 📞 Contatos e Suporte

### Documentação Técnica
- **PRD**: `docs/PRD.md`
- **Database**: `docs/database/README.md`
- **Setup Database**: `docs/database/database_setup.sql`

### Links Úteis
- [Supabase Docs](https://supabase.com/docs)
- [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps)
- [Netlify Docs](https://docs.netlify.com)

---

**Última Atualização**: 2025-01-08
**Mantido por**: pedroccm
**Projeto**: Vibe Dashboard v2.1.0
