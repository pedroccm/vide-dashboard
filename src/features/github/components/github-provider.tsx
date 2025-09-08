import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { GitHubConnection, GitHubRepository } from '../data/types'
import { githubAuth } from '@/services/github-auth'
import { githubAPI } from '@/services/github-api'
import { toast } from 'sonner'
import { useSearch } from '@tanstack/react-router'
import { debugGitHub } from '@/services/github-debug'

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

      // Verifica se já está autenticado
      if (githubAuth.isAuthenticated()) {
        console.log('🔐 User is authenticated, loading data...')
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
      // Inicia o fluxo OAuth
      githubAuth.initiateOAuth()
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