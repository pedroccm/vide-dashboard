// Funções de debug para GitHub integration
export const debugGitHub = {
  // Verifica variáveis de ambiente
  checkEnvVars() {
    console.log('🔍 GitHub Debug - Environment Variables:')
    console.log('VITE_GITHUB_CLIENT_ID:', import.meta.env.VITE_GITHUB_CLIENT_ID)
    console.log('VITE_GITHUB_CLIENT_SECRET:', import.meta.env.VITE_GITHUB_CLIENT_SECRET?.substring(0, 8) + '...')
    console.log('VITE_GITHUB_REDIRECT_URI:', import.meta.env.VITE_GITHUB_REDIRECT_URI)
    console.log('MODE:', import.meta.env.MODE)
  },

  // Verifica localStorage/sessionStorage
  checkStorage() {
    console.log('🔍 GitHub Debug - Storage:')
    console.log('Access Token:', localStorage.getItem('github_access_token')?.substring(0, 10) + '...')
    console.log('OAuth State:', sessionStorage.getItem('github_oauth_state'))
  },

  // Verifica URL atual
  checkURL() {
    console.log('🔍 GitHub Debug - Current URL:')
    console.log('Full URL:', window.location.href)
    console.log('Search params:', window.location.search)
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search)
      console.log('Code:', params.get('code')?.substring(0, 10) + '...')
      console.log('State:', params.get('state'))
      console.log('Error:', params.get('error'))
    }
  },

  // Debug completo
  fullDebug() {
    console.log('🚀 === GITHUB DEBUG REPORT ===')
    this.checkEnvVars()
    this.checkStorage()
    this.checkURL()
    console.log('🚀 === END DEBUG REPORT ===')
  }
}