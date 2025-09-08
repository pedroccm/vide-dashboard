# 🗄️ Database Schema - Shadcn Admin

## 📋 Overview
Este projeto usa **Supabase** como database com PostgreSQL.

**Prefixo das tabelas**: `shadcn_admin_`

## 🚀 Setup Instructions

### 1. Configurar Supabase
1. Acesse: https://supabase.com/dashboard
2. Entre no projeto: `yyfealwxpebzezfximhg`
3. Vá em: **SQL Editor**

### 2. Executar Migrations
Execute os arquivos SQL em ordem:

1. **001_initial_github_integration.sql** - GitHub OAuth integration

```bash
# Copie o conteúdo do arquivo e cole no SQL Editor
# Clique em "Run" para executar
```

## 📊 Database Schema

### Tables

#### `shadcn_admin_github_profiles`
Armazena tokens OAuth e informações dos usuários GitHub.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `github_user_id` | bigint | GitHub user ID (único) |
| `github_username` | text | GitHub username |
| `access_token` | text | GitHub OAuth token |
| `scope` | text | OAuth scopes concedidos |
| `avatar_url` | text | URL do avatar (opcional) |
| `name` | text | Nome completo (opcional) |
| `email` | text | Email (opcional) |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

### Indexes
- `idx_shadcn_admin_github_profiles_user_id` - Para busca rápida por user ID
- `idx_shadcn_admin_github_profiles_username` - Para busca por username
- `idx_shadcn_admin_github_profiles_updated_at` - Para manutenção

### Security
- **RLS (Row Level Security)**: Habilitado
- **Policy**: Permite todas operações (desenvolvimento)

## 🔧 Environment Variables

As seguintes variáveis devem estar configuradas no `.env.local` e no Netlify:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://yyfealwxpebzezfximhg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 Migrations

### Criar Nova Migration
1. Crie arquivo: `docs/database/00X_nome_da_migration.sql`
2. Use prefixo: `shadcn_admin_`
3. Inclua comentários detalhados
4. Adicione script de rollback no final

### Exemplo:
```sql
-- =====================================================
-- SHADCN ADMIN - Nome da Migration
-- =====================================================

CREATE TABLE shadcn_admin_nova_tabela (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- outros campos...
);

-- Rollback:
-- DROP TABLE IF EXISTS shadcn_admin_nova_tabela;
```

## 🧪 Testing Database

Para testar a conexão:
```typescript
import { githubSupabase } from '@/services/github-supabase'

// Testar conexão
const isConnected = await githubSupabase.testConnection()
console.log('Database connected:', isConnected)
```

## 📝 Notes

- **Desenvolvimento**: RLS permite todas operações
- **Produção**: Implementar policies baseadas em autenticação
- **Backup**: Supabase faz backup automático
- **Logs**: Habilitado no dashboard do Supabase