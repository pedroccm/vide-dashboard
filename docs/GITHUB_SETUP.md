# Guia de Configuração - Integração GitHub

Este guia fornece instruções passo a passo para configurar a integração real com o GitHub, substituindo os dados mockados pela API real do GitHub.

## 📋 Pré-requisitos

- Conta no GitHub
- Node.js 18+ instalado
- Aplicação shadcn-admin rodando localmente

## 🔧 Configuração do GitHub OAuth App

### Passo 1: Criar uma OAuth App no GitHub

1. **Acesse as configurações do GitHub**
   - Faça login na sua conta GitHub
   - Acesse diretamente: **https://github.com/settings/developers**
   - Clique em **OAuth Apps**

2. **Registre uma nova aplicação**
   - Clique em **New OAuth App**
   - Preencha os campos:
     ```
     Application name: Shadcn Admin Dashboard
     Homepage URL: http://localhost:5173
     Authorization callback URL: http://localhost:5173/api/auth/github/callback
     ```
   - Clique em **Register application**

3. **Copie as credenciais**
   - **Client ID**: Será exibido na página da aplicação
   - **Client Secret**: Clique em "Generate a new client secret" e copie

### Passo 2: Configurar Variáveis de Ambiente

1. **Crie um arquivo `.env.local`** na raiz do projeto:
   ```bash
   touch .env.local
   ```

2. **Adicione as variáveis de ambiente**:
   ```env
   # GitHub OAuth
   VITE_GITHUB_CLIENT_ID=seu_client_id_aqui
   VITE_GITHUB_CLIENT_SECRET=seu_client_secret_aqui
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/api/auth/github/callback
   
   # API Configuration
   VITE_GITHUB_API_URL=https://api.github.com
   VITE_APP_URL=http://localhost:5173
   ```

3. **Adicione `.env.local` ao `.gitignore`**:
   ```gitignore
   # Environment variables
   .env.local
   .env.production.local
   ```

## 📦 Instalação de Dependências

### Passo 3: Instalar Pacotes Necessários

```bash
# Instale o Octokit (SDK oficial do GitHub)
pnpm add @octokit/rest @octokit/auth-oauth-app

# Instale dependências para o servidor de autenticação
pnpm add -D @types/node
```

## 🔐 Implementação do Fluxo OAuth

### Passo 4: Criar Serviço de Autenticação GitHub

1. **Crie o arquivo `src/services/github-auth.ts`**:

```typescript
// src/services/github-auth.ts
import { Octokit } from '@octokit/rest'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI

export class GitHubAuthService {
  private static instance: GitHubAuthService
  private octokit: Octokit | null = null

  private constructor() {}

  static getInstance(): GitHubAuthService {
    if (!GitHubAuthService.instance) {
      GitHubAuthService.instance = new GitHubAuthService()
    }
    return GitHubAuthService.instance
  }

  // Inicia o fluxo OAuth
  initiateOAuth(): void {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo,user`
    window.location.href = authUrl
  }

  // Troca o código por um token de acesso
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('/api/auth/github/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const data = await response.json()
    return data.access_token
  }

  // Configura o cliente Octokit com o token
  setAccessToken(token: string): void {
    this.octokit = new Octokit({
      auth: token,
    })
    // Armazena o token de forma segura
    localStorage.setItem('github_access_token', token)
  }

  // Obtém o token armazenado
  getAccessToken(): string | null {
    return localStorage.getItem('github_access_token')
  }

  // Remove o token (logout)
  clearAccessToken(): void {
    localStorage.removeItem('github_access_token')
    this.octokit = null
  }

  // Verifica se está autenticado
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // Obtém a instância do Octokit
  getOctokit(): Octokit | null {
    if (!this.octokit && this.getAccessToken()) {
      this.setAccessToken(this.getAccessToken()!)
    }
    return this.octokit
  }
}

export const githubAuth = GitHubAuthService.getInstance()
```

### Passo 5: Criar API Service do GitHub

2. **Crie o arquivo `src/services/github-api.ts`**:

```typescript
// src/services/github-api.ts
import { githubAuth } from './github-auth'
import type { GitHubUser, GitHubRepository } from '@/features/github/data/types'

export class GitHubAPIService {
  // Busca informações do usuário autenticado
  async getCurrentUser(): Promise<GitHubUser> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated')
    }

    const { data } = await octokit.users.getAuthenticated()
    return data as GitHubUser
  }

  // Busca repositórios do usuário
  async getUserRepositories(options?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  }): Promise<GitHubRepository[]> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated')
    }

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: options?.sort || 'updated',
      direction: options?.direction || 'desc',
      per_page: options?.per_page || 100,
      page: options?.page || 1,
    })

    return data as GitHubRepository[]
  }

  // Busca um repositório específico
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated')
    }

    const { data } = await octokit.repos.get({ owner, repo })
    return data as GitHubRepository
  }

  // Busca as linguagens de um repositório
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated')
    }

    const { data } = await octokit.repos.listLanguages({ owner, repo })
    return data
  }
}

export const githubAPI = new GitHubAPIService()
```

### Passo 6: Criar Rota de Callback

3. **Crie o arquivo `src/routes/api/auth/github/callback.tsx`**:

```typescript
// src/routes/api/auth/github/callback.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { githubAuth } from '@/services/github-auth'

export const Route = createFileRoute('/api/auth/github/callback')({
  beforeLoad: async ({ location }) => {
    const urlParams = new URLSearchParams(location.search)
    const code = urlParams.get('code')
    
    if (!code) {
      throw redirect({ to: '/github', search: { error: 'no_code' } })
    }

    try {
      // Troca o código pelo token
      const token = await githubAuth.exchangeCodeForToken(code)
      githubAuth.setAccessToken(token)
      
      // Redireciona para a página do GitHub
      throw redirect({ to: '/github' })
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw redirect({ to: '/github', search: { error: 'auth_failed' } })
    }
  },
})
```

## 🔄 Atualização do Provider

### Passo 7: Atualizar o GitHub Provider

4. **Atualize `src/features/github/components/github-provider.tsx`**:

```typescript
// src/features/github/components/github-provider.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { GitHubConnection, GitHubRepository, GitHubUser } from '../data/types'
import { githubAuth } from '@/services/github-auth'
import { githubAPI } from '@/services/github-api'
import { toast } from 'sonner'

interface GitHubContextValue extends GitHubConnection {
  connect: () => Promise<void>
  disconnect: () => void
  refreshRepositories: () => Promise<void>
  selectedRepository: GitHubRepository | null
  setSelectedRepository: (repo: GitHubRepository | null) => void
}

const GitHubContext = createContext<GitHubContextValue | null>(null)

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<GitHubConnection>({
    isConnected: false,
    user: null,
    accessToken: null,
    repositories: [],
    isLoading: false,
    error: null,
  })

  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null)

  // Verifica autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      if (githubAuth.isAuthenticated()) {
        setConnection(prev => ({ ...prev, isLoading: true }))
        try {
          const user = await githubAPI.getCurrentUser()
          const repositories = await githubAPI.getUserRepositories()
          
          setConnection({
            isConnected: true,
            user,
            accessToken: githubAuth.getAccessToken(),
            repositories,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('Failed to load GitHub data:', error)
          githubAuth.clearAccessToken()
          setConnection(prev => ({ ...prev, isLoading: false }))
        }
      }
    }
    
    checkAuth()
  }, [])

  const connect = useCallback(async () => {
    setConnection(prev => ({ ...prev, isLoading: true, error: null }))
    
    // Inicia o fluxo OAuth
    githubAuth.initiateOAuth()
  }, [])

  const disconnect = useCallback(() => {
    githubAuth.clearAccessToken()
    setConnection({
      isConnected: false,
      user: null,
      accessToken: null,
      repositories: [],
      isLoading: false,
      error: null,
    })
    setSelectedRepository(null)
    toast.success('Disconnected from GitHub')
  }, [])

  const refreshRepositories = useCallback(async () => {
    if (!connection.isConnected) {
      toast.error('Please connect to GitHub first')
      return
    }

    setConnection(prev => ({ ...prev, isLoading: true }))

    try {
      const repositories = await githubAPI.getUserRepositories()
      setConnection(prev => ({
        ...prev,
        repositories,
        isLoading: false,
      }))
      toast.success('Repositories refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh repositories:', error)
      setConnection(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh repositories',
      }))
      toast.error('Failed to refresh repositories')
    }
  }, [connection.isConnected])

  const value: GitHubContextValue = {
    ...connection,
    connect,
    disconnect,
    refreshRepositories,
    selectedRepository,
    setSelectedRepository,
  }

  return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>
}

export function useGitHub() {
  const context = useContext(GitHubContext)
  if (!context) {
    throw new Error('useGitHub must be used within GitHubProvider')
  }
  return context
}
```

## 🚀 Configuração do Servidor Backend (Opcional)

### Passo 8: Criar Servidor para Token Exchange

Para maior segurança, o exchange de código por token deve ser feito no backend:

5. **Crie `server/github-auth.js`**:

```javascript
// server/github-auth.js
const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

app.post('/api/auth/github/token', async (req, res) => {
  const { code } = req.body
  
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )
    
    res.json(response.data)
  } catch (error) {
    console.error('Token exchange error:', error)
    res.status(500).json({ error: 'Failed to exchange token' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`)
})
```

## ✅ Verificação da Configuração

### Passo 9: Testar a Integração

1. **Inicie a aplicação**:
   ```bash
   pnpm run dev
   ```

2. **Acesse o menu GitHub** no sidebar

3. **Clique em "Connect GitHub Account"**

4. **Autorize a aplicação** no GitHub

5. **Verifique se seus repositórios aparecem**

## 🔒 Considerações de Segurança

### Importantes:

1. **NUNCA exponha o Client Secret no frontend**
   - Use um servidor backend para o token exchange
   - Mantenha o secret apenas no servidor

2. **Use HTTPS em produção**
   - OAuth requer HTTPS para callback URLs em produção
   - Configure certificados SSL adequados

3. **Implemente refresh tokens**
   - Tokens do GitHub não expiram, mas é boa prática renovar periodicamente
   - Implemente revogação de tokens ao fazer logout

4. **Valide os estados OAuth**
   - Use o parâmetro `state` para prevenir ataques CSRF
   - Valide o state no callback

## 📝 Escopos do GitHub OAuth

### Escopos Disponíveis:

```
repo          - Acesso total a repositórios privados
public_repo   - Acesso a repositórios públicos
repo:status   - Acesso ao status de commits
user          - Acesso a informações do perfil
read:user     - Acesso somente leitura ao perfil
user:email    - Acesso aos endereços de email
```

### Recomendado para esta aplicação:
```
scope=repo,user
```

## 🐛 Troubleshooting

### Problema: "Redirect URI mismatch"
**Solução**: Verifique se a URL de callback no GitHub App corresponde exatamente à configurada no `.env.local`

### Problema: "401 Unauthorized"
**Solução**: 
- Verifique se o token está sendo enviado corretamente
- Confirme que o token não foi revogado
- Verifique os escopos do token

### Problema: "Rate limit exceeded"
**Solução**:
- Implemente cache de requisições
- Use autenticação (aumenta o limite de 60 para 5000 req/hora)
- Implemente paginação adequada

## 📚 Recursos Adicionais

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

## 🎯 Próximos Passos

Após configurar a integração básica, considere adicionar:

1. **Webhooks** para atualizações em tempo real
2. **GraphQL API** para consultas mais eficientes
3. **Cache de dados** com React Query
4. **Funcionalidades adicionais**:
   - Criar/editar repositórios
   - Gerenciar issues e PRs
   - Visualizar commits e branches
   - Estatísticas avançadas

---

**Nota**: Este guia assume desenvolvimento local. Para produção, ajuste as URLs e implemente medidas de segurança adicionais.