import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithGithub: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para carregar o perfil do usuário (BYPASS TEMPORÁRIO)
  const loadUserProfile = async (userId: string) => {
    console.log('🔄 Loading profile for user:', userId)
    
    // TEMPORARY FIX: Always return default profile to avoid infinite loop
    const defaultProfile = {
      id: userId,
      user_id: userId,
      role: 'user' as const,
      timezone: 'UTC',
      language: 'en', 
      theme: 'system' as const,
      email_notifications: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as UserProfile

    try {
      // Try to fetch real profile but don't block on errors
      const { data: profileData, error } = await supabase
        .from('sa_user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('⚠️ Profile fetch failed, using default:', error.message)
        return defaultProfile
      }

      console.log('✅ Profile loaded successfully:', profileData)
      return profileData as UserProfile
    } catch (error) {
      console.warn('⚠️ Profile fetch error, using default:', error)
      return defaultProfile
    }
  }

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Função para criar conta
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Função para logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error }
      }

      // Limpar estado local
      setUser(null)
      setProfile(null)
      setSession(null)

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Função para login com GitHub
  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Função para atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await supabase
        .from('sa_user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return { error: new Error(error.message) }
      }

      // Atualizar estado local
      setProfile(data as UserProfile)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Efeito para monitorar mudanças de autenticação
  useEffect(() => {
    let isMounted = true
    
    // Obter sessão inicial
    const getInitialSession = async () => {
      console.log('🚀 Getting initial session...')
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📱 Session received:', !!session?.user, session?.user?.email)
        
        if (!isMounted) return
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('👤 Loading user profile...')
          const userProfile = await loadUserProfile(session.user.id)
          if (isMounted) {
            setProfile(userProfile)
          }
        }

        if (isMounted) {
          setLoading(false)
          console.log('✅ Auth initialization complete')
        }
      } catch (error) {
        console.error('❌ Initial session error:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, !!session?.user)
      
      if (!isMounted) return
      
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id)
        if (isMounted) {
          setProfile(userProfile)
        }
      } else {
        if (isMounted) {
          setProfile(null)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGithub,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook para verificar se o usuário é admin
export const useIsAdmin = () => {
  const { profile } = useAuth()
  return profile?.role === 'admin'
}

// Hook para verificar se o usuário está autenticado
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user, loading }
}