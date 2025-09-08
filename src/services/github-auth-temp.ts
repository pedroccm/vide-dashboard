// Versão temporária para debug - APENAS PARA DESENVOLVIMENTO
// EM PRODUÇÃO, O CLIENT SECRET NÃO DEVE FICAR NO FRONTEND!

import { Octokit } from '@octokit/rest'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET
const isDevelopment = import.meta.env.MODE === 'development'

export const debugOAuth = {
  // Teste de exchange de token manual
  async exchangeCodeForTokenDirect(code: string): Promise<string | null> {
    console.log('🔍 Tentando trocar código por token...')
    console.log('Code:', code.substring(0, 10) + '...')
    console.log('Client ID:', GITHUB_CLIENT_ID)
    console.log('Has Secret:', !!GITHUB_CLIENT_SECRET)
    
    if (!GITHUB_CLIENT_SECRET) {
      console.error('❌ GITHUB_CLIENT_SECRET não configurado')
      return null
    }

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText)
        return null
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.error) {
        console.error('❌ OAuth Error:', data.error, data.error_description)
        return null
      }

      if (data.access_token) {
        console.log('✅ Token recebido:', data.access_token.substring(0, 10) + '...')
        return data.access_token
      }

      console.error('❌ Nenhum access_token na resposta')
      return null
    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      return null
    }
  },

  // Teste de conexão com token
  async testTokenConnection(token: string): Promise<boolean> {
    try {
      console.log('🔍 Testando conexão com token...')
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.users.getAuthenticated()
      console.log('✅ Usuário autenticado:', data.login)
      return true
    } catch (error) {
      console.error('❌ Erro na conexão:', error)
      return false
    }
  },

  // Debug completo de OAuth
  async debugOAuthFlow(code: string, state: string): Promise<{token: string | null, isValid: boolean}> {
    console.log('🚀 === DEBUG OAUTH FLOW ===')
    console.log('Code:', code?.substring(0, 10) + '...')
    console.log('State:', state)
    
    const token = await this.exchangeCodeForTokenDirect(code)
    let isValid = false
    
    if (token) {
      isValid = await this.testTokenConnection(token)
      if (isValid) {
        console.log('✅ OAuth flow completo com sucesso!')
        // Salva no localStorage
        localStorage.setItem('github_access_token', token)
      }
    }
    
    console.log('🚀 === END DEBUG OAUTH ===')
    return { token, isValid }
  }
}