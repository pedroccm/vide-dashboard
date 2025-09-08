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
CREATE TABLE github_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  github_user_id bigint UNIQUE NOT NULL,
  github_username text NOT NULL,
  access_token text NOT NULL,
  scope text NOT NULL,
  avatar_url text,
  name text,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE github_profiles ENABLE ROW LEVEL SECURITY;

-- Policy para permitir operações (ajustar conforme necessário)
CREATE POLICY "Allow all operations for authenticated users" ON github_profiles
  FOR ALL USING (true);
*/