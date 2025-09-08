import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { GitHubConnection, GitHubRepository } from '../data/types'
import { githubAuth } from '@/services/github-auth'
import { githubAPI } from '@/services/github-api'
import { toast } from 'sonner'
import { useSearch } from '@tanstack/react-router'
import { debugGitHub } from '@/services/github-debug'
import { githubSupabase } from '@/services/github-supabase'

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

  // Verifica parâmetros de busca para mensagens de sucesso/erro
  const searchParams = useSearch({ strict: false }) as any
  
  // Função para carregar autenticação do Supabase
  const loadAuthFromSupabase = useCallback(async () => {
    try {
      console.log('🔍 Checking Supabase for existing GitHub authentication...')
      
      // Por enquanto, buscamos pelo username pedroccm
      // TODO: Em produção, isso seria baseado na sessão do usuário
      const profile = await githubSupabase.getGitHubProfileByUsername('pedroccm')
      
      if (profile) {
        console.log('✅ Found GitHub profile in Supabase')
        console.log('Profile user:', profile.github_username)
        
        // Configura o auth service com o token do Supabase
        githubAuth.setAccessToken(profile.access_token)
        
        // Testa se o token ainda é válido
        const isValid = await githubAuth.testConnection()
        if (isValid) {
          console.log('✅ Supabase token is still valid')
          setConnection(prev => ({ ...prev, isLoading: true }))
          
          // Carrega dados do GitHub
          const user = await githubAPI.getCurrentUser()
          const repositories = await githubAPI.getUserRepositories()
          
          setConnection({
            isConnected: true,
            user,
            accessToken: profile.access_token,
            repositories,
            isLoading: false,
            error: null,
          })
          
          console.log('✅ Successfully loaded auth from Supabase')
          return true
        } else {
          console.warn('⚠️ Supabase token is expired, clearing...')
          await githubSupabase.deleteGitHubProfile(profile.github_user_id)
        }
      } else {
        console.log('ℹ️ No GitHub profile found in Supabase')
      }
      
      return false
    } catch (error) {
      console.error('❌ Error loading auth from Supabase:', error)
      return false
    }
  }, [])
  
  // Verifica autenticação ao carregar e trata mensagens de callback
  useEffect(() => {
    const handleAuthResult = async () => {
      // Debug: Log do estado atual
      console.log('🔍 GitHub Provider - handleAuthResult started')
      debugGitHub.fullDebug()
      console.log('🔍 Search Params:', searchParams)
      console.log('🔍 Is Authenticated:', githubAuth.isAuthenticated())
      
      // Trata mensagens de callback
      if (searchParams?.success === 'true') {
        console.log('✅ Success callback detected')
        toast.success(searchParams.message || 'Successfully connected to GitHub!')
        // Remove os parâmetros da URL
        window.history.replaceState({}, '', '/github')
      } else if (searchParams?.error) {
        console.log('❌ Error callback detected:', searchParams.error)
        const errorMessage = searchParams.message || 'Failed to connect to GitHub'
        toast.error(errorMessage)
        // Remove os parâmetros da URL
        window.history.replaceState({}, '', '/github')
        return
      }

      // Tenta carregar autenticação persistida do Supabase
      await loadAuthFromSupabase()
      
      // Fallback: Verifica se já está autenticado no localStorage
      if (githubAuth.isAuthenticated()) {
        console.log('🔐 User is authenticated via localStorage, loading data...')
        setConnection(prev => ({ ...prev, isLoading: true }))
        try {
          const user = await githubAPI.getCurrentUser()
          console.log('👤 User loaded:', user.login)
          const repositories = await githubAPI.getUserRepositories()
          console.log('📦 Repositories loaded:', repositories.length)
          
          setConnection({
            isConnected: true,
            user,
            accessToken: githubAuth.getAccessToken(),
            repositories,
            isLoading: false,
            error: null,
          })
          console.log('✅ Connection state updated')
        } catch (error: any) {
          console.error('❌ Failed to load GitHub data:', error)
          githubAuth.clearAccessToken()
          setConnection(prev => ({ 
            ...prev, 
            isLoading: false,
            error: error.message || 'Failed to load GitHub data'
          }))
          toast.error('Failed to load GitHub data')
        }
      } else {
        console.log('🔓 User is not authenticated')
      }
    }
    
    handleAuthResult()
  }, [searchParams])

  const connect = useCallback(async () => {
    setConnection(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // GitHub OAuth for API access only (not for login)
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      if (!clientId) {
        throw new Error('GitHub Client ID not configured')
      }
      
      // Generate random state for security
      const state = Math.random().toString(36).substring(7)
      localStorage.setItem('github_oauth_state', state)
      
      // GitHub OAuth URL for repository access
      const githubOAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/callback')}&` +
        `scope=repo,user&` +
        `state=${state}`
      
      toast.info('Redirecting to GitHub for repository access...')
      window.location.href = githubOAuthUrl
      
    } catch (error: any) {
      console.error('Failed to initiate OAuth:', error)
      setConnection(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to connect to GitHub',
      }))
      toast.error('Failed to connect to GitHub')
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting from GitHub...')
      
      // Limpar do localStorage
      githubAuth.clearAccessToken()
      
      // Tentar limpar do Supabase também (por username pedroccm)
      try {
        const profile = await githubSupabase.getGitHubProfileByUsername('pedroccm')
        if (profile) {
          await githubSupabase.deleteGitHubProfile(profile.github_user_id)
          console.log('✅ Cleared GitHub profile from Supabase')
        }
      } catch (supabaseError) {
        console.warn('⚠️ Could not clear from Supabase:', supabaseError)
      }
      
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
      
    } catch (error) {
      console.error('❌ Error during disconnect:', error)
      toast.error('Error disconnecting from GitHub')
    }
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
        error: null,
      }))
      toast.success('Repositories refreshed successfully')
    } catch (error: any) {
      console.error('Failed to refresh repositories:', error)
      setConnection(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to refresh repositories',
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