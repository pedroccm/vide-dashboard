import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente Supabase para uso no frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas
export interface GitHubUserProfile {
  id: string
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

// Database schema que precisa ser criada no Supabase:
/*
Ver arquivo completo: docs/database/001_initial_github_integration.sql

Tabela principal: sa_admin_github_profiles
- id uuid (PK)
- github_user_id bigint (unique)
- github_username text
- access_token text
- scope text
- avatar_url text (opcional)
- name text (opcional)  
- email text (opcional)
- created_at timestamp
- updated_at timestamp
*/