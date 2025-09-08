import { createFileRoute, redirect } from '@tanstack/react-router'
import { githubAuth } from '@/services/github-auth'

export const Route = createFileRoute('/api/auth/github/callback')({
  beforeLoad: async ({ location }) => {
    const urlParams = new URLSearchParams(location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')
    
    // Verifica se houve erro na autorização
    if (error) {
      console.error('GitHub OAuth error:', error)
      const errorDescription = urlParams.get('error_description') || 'Authorization failed'
      throw redirect({ 
        to: '/github', 
        search: { error: 'oauth_error', message: errorDescription } 
      })
    }
    
    // Verifica se o código foi fornecido
    if (!code) {
      throw redirect({ 
        to: '/github', 
        search: { error: 'no_code', message: 'No authorization code received' } 
      })
    }

    // Valida o state para prevenir CSRF
    if (!state || !githubAuth.validateState(state)) {
      throw redirect({ 
        to: '/github', 
        search: { error: 'invalid_state', message: 'Invalid OAuth state' } 
      })
    }

    try {
      // Troca o código pelo token
      const token = await githubAuth.exchangeCodeForToken(code)
      githubAuth.setAccessToken(token)
      
      // Testa a conexão
      const isConnected = await githubAuth.testConnection()
      if (!isConnected) {
        throw new Error('Failed to connect to GitHub')
      }
      
      // Redireciona para a página do GitHub com sucesso
      throw redirect({ 
        to: '/github', 
        search: { success: 'true', message: 'Successfully connected to GitHub' } 
      })
    } catch (error: any) {
      console.error('OAuth callback error:', error)
      
      // Limpa qualquer token inválido
      githubAuth.clearAccessToken()
      
      throw redirect({ 
        to: '/github', 
        search: { 
          error: 'auth_failed', 
          message: error.message || 'Failed to authenticate with GitHub' 
        } 
      })
    }
  },
  component: () => {
    // Este componente nunca será renderizado devido ao redirect
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Processing GitHub authentication...</p>
        </div>
      </div>
    )
  },
})