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

  // Função para carregar o perfil do usuário
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('sa_user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        return null
      }

      return profileData as UserProfile
    } catch (error) {
      console.error('Error loading user profile:', error)
      return null
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
    // Obter sessão inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id)
        setProfile(userProfile)
      }

      setLoading(false)
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
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