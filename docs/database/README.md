# 🗄️ Database Schema - Shadcn Admin

## 📋 Overview
Este projeto usa **Supabase** como database com PostgreSQL.

**Prefixo das tabelas**: `sa_` (shadcn-admin)

## 🚀 Setup Instructions - IMPORTANTE!

### ⚠️ PROBLEMA ATUAL: Erro 500 no Supabase
Se você está vendo erros 500 nas tabelas `sa_users`, `sa_user_profiles`, `sa_github_profiles`, isso significa que as tabelas não existem no banco.

### 🔧 SOLUÇÃO RÁPIDA:

#### Opção 1: Verificar Problema
```sql
-- Cole este arquivo no SQL Editor do Supabase:
verify_tables.sql
```

#### Opção 2: Correção Rápida 
```sql
-- Se as tabelas não existem, cole este arquivo:
quick_fix.sql
```

#### Opção 3: Setup Completo (RECOMENDADO)
```sql
-- Para setup completo e limpo:
database_setup.sql
```

### 📋 Como Executar no Supabase:
1. Acesse: https://supabase.com/dashboard
2. Entre no projeto: `yyfealwxpebzezfximhg`
3. Vá em: **SQL Editor**
4. Cole o conteúdo do arquivo escolhido
5. Clique em **Run**
6. Verifique se não há erros na execução

### 2. Configurar GitHub OAuth
1. No Supabase Dashboard, vá para **Authentication** > **Providers**
2. Habilite **GitHub**
3. Adicione suas credenciais:
   - Client ID: `Ov23li7HPBStIZDvFWOi`
   - Client Secret: (sua secret key)
4. Configure o callback URL no GitHub: `https://yyfealwxpebzezfximhg.supabase.co/auth/v1/callback`

## 📊 Database Schema

### Tabelas Principais

#### `sa_users`
Tabela principal de usuários (vinculada ao auth.users do Supabase)

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (ref auth.users) |
| `email` | text | Email do usuário |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

#### `sa_user_profiles`
Perfis estendidos dos usuários com preferências

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key para sa_users |
| `name` | text | Nome completo |
| `avatar_url` | text | URL do avatar |
| `role` | text | Role: user/admin/moderator |
| `bio` | text | Biografia |
| `website` | text | Website pessoal |
| `location` | text | Localização |
| `timezone` | text | Fuso horário (default: UTC) |
| `language` | text | Idioma preferido (default: en) |
| `theme` | text | Tema: light/dark/system |
| `email_notifications` | boolean | Notificações por email |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

#### `sa_github_profiles`
Armazena tokens OAuth e informações dos usuários GitHub

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key para sa_users |
| `github_user_id` | bigint | GitHub user ID (único) |
| `github_username` | text | GitHub username |
| `access_token` | text | GitHub OAuth token |
| `scope` | text | OAuth scopes concedidos |
| `avatar_url` | text | URL do avatar |
| `name` | text | Nome completo |
| `email` | text | Email |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

### Views

#### `sa_users_complete`
View que combina dados de usuários e perfis para consultas simplificadas.

### Security (RLS)
- ✅ Usuários podem ver/editar apenas seus próprios dados
- ✅ Admins podem ver todos os dados  
- ✅ Políticas separadas para cada operação (SELECT, INSERT, UPDATE, DELETE)
- ✅ Função `is_admin()` com SECURITY DEFINER para evitar recursão

### Triggers Automáticos
- `sa_handle_new_user()` - Cria perfil automaticamente quando usuário se cadastra
- `sa_update_updated_at()` - Atualiza timestamp automaticamente em todas as tabelas

## 🔧 Environment Variables

Configuradas no `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://yyfealwxpebzezfximhg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=Ov23li7HPBStIZDvFWOi
VITE_GITHUB_CLIENT_SECRET=...
```

## 📁 Arquivos Disponíveis

### 🔥 Arquivo Principal
- **`database_setup.sql`** ⭐ **USE ESTE!**
  - Arquivo completo e limpo com toda configuração
  - Remove conflitos e políticas antigas
  - Inclui verificações e testes automatizados
  - Documentação completa inline

### 📦 Opcional: Repositories Table
- **`repositories_table.sql`**
  - Tabela adicional para armazenar repositórios GitHub
  - Use apenas se precisar salvar repositórios no banco

## 🧪 Testing Database

Para testar a conexão após setup:

```typescript
// Testar se as tabelas foram criadas
const { data, error } = await supabase
  .from('sa_users')
  .select('count(*)')
  
console.log('Database connected:', !error)
```

## 🎯 Próximos Passos

Após rodar o SQL:

1. **Testar Cadastro**: Crie um usuário via email/senha no app
2. **Verificar Triggers**: Confirme que sa_users e sa_user_profiles foram criados
3. **Testar GitHub OAuth**: Faça login com GitHub
4. **Promover Admin**: 
   ```sql
   UPDATE sa_user_profiles 
   SET role = 'admin' 
   WHERE user_id = (SELECT id FROM sa_users WHERE email = 'seu-email@example.com');
   ```

## ✅ Sistema Migrado

O sistema foi completamente migrado de localStorage para Supabase database:

- ❌ **Antes**: Tokens GitHub salvos no localStorage
- ✅ **Agora**: Tokens GitHub salvos na tabela `sa_github_profiles`
- ✅ **Segurança**: RLS políticas implementadas
- ✅ **Performance**: Índices otimizados
- ✅ **Backup**: Dados persistidos no Supabase

## 📝 Notes

- **Desenvolvimento**: Configurado para permitir operações locais
- **Produção**: Políticas RLS já configuradas para segurança
- **Backup**: Supabase faz backup automático diário
- **Logs**: Disponível no dashboard do Supabase
- **Build**: Todas as dependências TypeScript corrigidas