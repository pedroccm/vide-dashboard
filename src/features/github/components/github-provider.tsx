import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { GitHubConnection, GitHubRepository } from '../data/types'
import { toast } from 'sonner'
import { useSearch } from '@tanstack/react-router'
import { debugGitHub } from '@/services/github-debug'
import { supabase } from '@/lib/supabase'
import { Octokit } from '@octokit/rest'

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
      
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.log('ℹ️ No authenticated user in Supabase')
        return false
      }
      
      // Get GitHub profile for current user
      const { data: profile, error } = await supabase
        .from('sa_github_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (error || !profile) {
        console.log('ℹ️ No GitHub profile found in Supabase for current user')
        return false
      }
      
      console.log('✅ Found GitHub profile in Supabase')
      console.log('Profile user:', profile.github_username)
      
      // Test if token is still valid
      const octokit = new Octokit({ auth: profile.access_token })
      try {
        await octokit.users.getAuthenticated()
        console.log('✅ Supabase token is still valid')
        setConnection(prev => ({ ...prev, isLoading: true }))
        
        // Load GitHub data directly
        const userResponse = await octokit.users.getAuthenticated()
        const reposResponse = await octokit.repos.listForAuthenticatedUser({ 
          sort: 'updated', 
          per_page: 100 
        })
        
        setConnection({
          isConnected: true,
          user: userResponse.data,
          accessToken: profile.access_token,
          repositories: reposResponse.data as GitHubRepository[],
          isLoading: false,
          error: null,
        })
        
        console.log('✅ Successfully loaded auth from Supabase')
        return true
      } catch (tokenError) {
        console.warn('⚠️ Supabase token is expired, clearing...')
        await supabase
          .from('sa_github_profiles')
          .delete()
          .eq('user_id', session.user.id)
        return false
      }
      
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
      const loaded = await loadAuthFromSupabase()
      
      if (!loaded) {
        console.log('🔓 No GitHub authentication found')
      }
    }
    
    handleAuthResult()
  }, [searchParams])

  const connect = useCallback(async () => {
    setConnection(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        toast.error('Please sign in first to connect GitHub')
        setConnection(prev => ({ ...prev, isLoading: false }))
        return
      }
      
      // GitHub OAuth for API access only (not for login)
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      if (!clientId) {
        throw new Error('GitHub Client ID not configured')
      }
      
      // Generate random state for security
      const state = Math.random().toString(36).substring(7)
      sessionStorage.setItem('github_oauth_state', state)
      
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
      
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Clear GitHub profile from Supabase
        const { error } = await supabase
          .from('sa_github_profiles')
          .delete()
          .eq('user_id', session.user.id)
        
        if (error) {
          console.warn('⚠️ Could not clear from Supabase:', error)
        } else {
          console.log('✅ Cleared GitHub profile from Supabase')
        }
      }
      
      // Clear any remaining session storage
      sessionStorage.removeItem('github_oauth_state')
      
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
    if (!connection.isConnected || !connection.accessToken) {
      toast.error('Please connect to GitHub first')
      return
    }

    setConnection(prev => ({ ...prev, isLoading: true }))

    try {
      const octokit = new Octokit({ auth: connection.accessToken })
      const response = await octokit.repos.listForAuthenticatedUser({ 
        sort: 'updated', 
        per_page: 100 
      })
      
      setConnection(prev => ({
        ...prev,
        repositories: response.data as GitHubRepository[],
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
  }, [connection.isConnected, connection.accessToken])

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