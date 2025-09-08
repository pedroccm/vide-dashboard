# GitHub OAuth Setup - Supabase

## ⚠️ IMPORTANTE: Dois Fluxos Diferentes

Você tem **DOIS sistemas de GitHub OAuth** configurados:

### 1. GitHub OAuth Direto (ATUAL - PROBLEMA)
- **Callback URL**: `https://vibeosdash.netlify.app/api/auth/github/callback`
- **Problema**: Salva token no localStorage, não cria usuário no Supabase
- **Arquivo**: `src/routes/api/auth/github/callback.tsx`
- **Status**: FUNCIONANDO mas NÃO integrado com autenticação

### 2. GitHub OAuth via Supabase (CORRETO)
- **Callback URL**: `https://yyfealwxpebzezfximhg.supabase.co/auth/v1/callback`
- **Vantagem**: Cria usuário automaticamente, gerencia sessões
- **Arquivo**: `src/routes/(auth)/auth.callback.tsx`
- **Status**: PRECISA CONFIGURAR

## 🔧 Como Corrigir

### Opção A: Usar Supabase Auth (RECOMENDADO)

1. **No GitHub OAuth App Settings**:
   - Mude o callback URL para: `https://yyfealwxpebzezfximhg.supabase.co/auth/v1/callback`

2. **No Supabase Dashboard**:
   - Authentication → Providers → GitHub
   - Client ID: `Ov23li7HPBStIZDvFWOi`
   - Client Secret: `e2a41bcef86b835cd2946ba24ebcaf2ed37735c4`
   - Callback URL (use este no GitHub): `https://yyfealwxpebzezfximhg.supabase.co/auth/v1/callback`

3. **No código**:
   - O botão "Continue with GitHub" já está configurado
   - Usa `signInWithGithub()` do auth context
   - Cria usuário automaticamente

### Opção B: Manter GitHub Direto (NÃO recomendado)

Se quiser manter o sistema atual, precisa:
1. Após receber o token do GitHub
2. Criar manualmente o usuário no Supabase
3. Fazer sign in programaticamente
4. Salvar o token GitHub na tabela `sa_github_profiles`

## 📝 Fluxo Correto com Supabase

1. Usuário clica em "Continue with GitHub"
2. Redireciona para GitHub OAuth
3. GitHub redireciona para Supabase (não para seu app)
4. Supabase cria o usuário e sessão
5. Supabase redireciona para seu app em `/auth/callback`
6. App finaliza o login

## 🚨 Problema Atual

Você está misturando os dois sistemas:
- GitHub OAuth direto (Netlify function)
- Supabase Auth com GitHub

**Solução**: Use APENAS o Supabase Auth para simplificar!