import { createFileRoute, redirect } from '@tanstack/react-router'
import { githubAuth } from '@/services/github-auth'
import { githubSupabase } from '@/services/github-supabase'
import { githubAPI } from '@/services/github-api'

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
        to: '/sign-in', 
        search: { error: 'oauth_error', message: errorDescription } 
      })
    }
    
    // Verifica se o código foi fornecido
    if (!code) {
      throw redirect({ 
        to: '/sign-in', 
        search: { error: 'no_code', message: 'No authorization code received' } 
      })
    }

    // Valida o state para prevenir CSRF
    if (!state || !githubAuth.validateState(state)) {
      throw redirect({ 
        to: '/sign-in', 
        search: { error: 'invalid_state', message: 'Invalid OAuth state' } 
      })
    }

    try {
      console.log('🔍 Callback: Starting OAuth flow via Netlify Function...')
      
      // Troca código por token usando Netlify Function
      const token = await githubAuth.exchangeCodeForToken(code)
      
      if (!token) {
        throw new Error('Failed to authenticate with GitHub')
      }
      
      console.log('📝 Token received:', token.substring(0, 20) + '...')
      console.log('📝 Token type:', typeof token)
      
      // IMPORTANTE: Salvar token ANTES de testar
      githubAuth.setAccessToken(token)
      console.log('💾 Token saved to auth service')
      
      // Testa se o token funciona
      const isValid = await githubAuth.testConnection()
      if (!isValid) {
        throw new Error('Invalid GitHub token received')
      }
      
      console.log('✅ OAuth flow completed successfully via Netlify Function')
      
      // Buscar dados completos do usuário GitHub
      console.log('👤 Fetching complete user data from GitHub...')
      const userData = await githubAPI.getCurrentUser()
      console.log('User data received:', userData.login, userData.id)
      
      // Salvar no Supabase para persistência
      console.log('💾 Saving user profile to Supabase...')
      const savedProfile = await githubSupabase.saveGitHubProfile({
        github_user_id: userData.id,
        github_username: userData.login,
        access_token: token,
        scope: 'repo,user', // Escopo padrão do OAuth
        avatar_url: userData.avatar_url || undefined,
        name: userData.name || undefined,
        email: userData.email || undefined
      })
      
      if (!savedProfile) {
        console.warn('⚠️ Failed to save profile to Supabase, but continuing with localStorage')
      } else {
        console.log('✅ Profile saved to Supabase successfully')
      }
      
      // Redireciona para o dashboard com sucesso (GitHub OAuth antigo)
      throw redirect({ 
        to: '/', 
        search: { success: 'github_connected', message: 'Successfully connected to GitHub' } 
      })
    } catch (error: any) {
      console.error('OAuth callback error:', error)
      
      // Limpa qualquer token inválido
      githubAuth.clearAccessToken()
      
      throw redirect({ 
        to: '/sign-in', 
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