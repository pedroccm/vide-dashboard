import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente Supabase para uso no frontend com tipos TypeScript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para as tabelas principais
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  name?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'moderator'
  bio?: string
  website?: string
  location?: string
  timezone: string
  language: string
  theme: 'light' | 'dark' | 'system'
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface GitHubProfile {
  id: string
  user_id: string
  github_user_id: number
  github_username: string
  access_token: string
  scope: string
  avatar_url?: string
  name?: string
  email?: string
  created_at: string
  updated_at: string
}

// Database schema criada através dos arquivos:
/*
- docs/database/002_user_authentication_system.sql
- docs/database/003_rename_github_profiles.sql

Tabelas principais:
- sa_users: Usuários vinculados ao auth.users do Supabase
- sa_user_profiles: Perfis estendidos dos usuários  
- sa_github_profiles: Perfis GitHub vinculados aos usuários
*/