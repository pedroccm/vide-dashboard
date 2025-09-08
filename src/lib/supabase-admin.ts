import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Configuração do Supabase Admin (com Service Role Key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase admin environment variables')
}

// Cliente Supabase Admin - bypassa RLS policies
export const supabaseAdmin = createClient<Database>(
  supabaseUrl, 
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)