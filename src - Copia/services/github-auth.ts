import { Octokit } from '@octokit/rest'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_REDIRECT_URI = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_GITHUB_REDIRECT_URI_DEV || 'http://localhost:5173/api/auth/github/callback'
  : import.meta.env.VITE_GITHUB_REDIRECT_URI

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
    const scope = 'repo,user'
    const state = this.generateRandomState()
    
    // Armazena o state para validação posterior
    sessionStorage.setItem('github_oauth_state', state)
    
    const authUrl = new URL('https://github.com/login/oauth/authorize')
    authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI)
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('state', state)
    
    window.location.href = authUrl.toString()
  }

  // Gera state aleatório para segurança OAuth
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // Valida o state OAuth
  validateState(receivedState: string): boolean {
    const storedState = sessionStorage.getItem('github_oauth_state')
    sessionStorage.removeItem('github_oauth_state')
    return storedState === receivedState
  }

  // Troca o código por um token de acesso via Netlify Function (seguro)
  async exchangeCodeForToken(code: string): Promise<string> {
    console.log('🔍 Exchanging code for token via Netlify Function...')
    
    const functionUrl = import.meta.env.MODE === 'development'
      ? 'http://localhost:8888/.netlify/functions/github-oauth'
      : '/.netlify/functions/github-oauth'
    
    console.log('Function URL:', functionUrl)
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        state: sessionStorage.getItem('github_oauth_state')
      }),
    })

    console.log('Netlify function response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Netlify function error:', errorText)
      throw new Error(`Failed to exchange code for token: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Token exchange successful via Netlify Function')
    console.log('Response data keys:', Object.keys(data))
    console.log('Token type from response:', typeof data.access_token)
    console.log('Token preview:', data.access_token?.substring(0, 20) + '...')
    
    if (data.error) {
      console.error('❌ OAuth error from function:', data.error, data.message)
      throw new Error(data.message || data.error)
    }

    if (!data.access_token) {
      console.error('❌ No access_token in response:', data)
      throw new Error('No access token received from function')
    }

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
    sessionStorage.removeItem('github_oauth_state')
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

  // Testa a conexão
  async testConnection(): Promise<boolean> {
    console.log('🔍 Testing GitHub connection...')
    console.log('Has stored token:', !!this.getAccessToken())
    
    const octokit = this.getOctokit()
    console.log('Has Octokit instance:', !!octokit)
    
    if (!octokit) {
      console.error('❌ No Octokit instance available')
      return false
    }

    try {
      console.log('🚀 Making GitHub API call to /user...')
      const response = await octokit.users.getAuthenticated()
      console.log('✅ GitHub API response successful')
      console.log('User:', response.data.login)
      console.log('User ID:', response.data.id)
      return true
    } catch (error: any) {
      console.error('❌ GitHub connection test failed:', error)
      console.error('Error status:', error.status)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response?.data)
      return false
    }
  }
}

export const githubAuth = GitHubAuthService.getInstance()