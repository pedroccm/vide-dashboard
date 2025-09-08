import { supabase, GitHubUserProfile } from '@/lib/supabase'

export class GitHubSupabaseService {
  private static instance: GitHubSupabaseService
  
  private constructor() {}

  static getInstance(): GitHubSupabaseService {
    if (!GitHubSupabaseService.instance) {
      GitHubSupabaseService.instance = new GitHubSupabaseService()
    }
    return GitHubSupabaseService.instance
  }

  // Salvar/atualizar perfil GitHub na database
  async saveGitHubProfile(profile: {
    github_user_id: number
    github_username: string
    access_token: string
    scope: string
    avatar_url?: string
    name?: string
    email?: string
  }): Promise<GitHubUserProfile | null> {
    try {
      console.log('💾 Saving GitHub profile to Supabase...')
      console.log('User ID:', profile.github_user_id)
      console.log('Username:', profile.github_username)

      const { data, error } = await supabase
        .from('sa_admin_github_profiles')
        .upsert({
          github_user_id: profile.github_user_id,
          github_username: profile.github_username,
          access_token: profile.access_token,
          scope: profile.scope,
          avatar_url: profile.avatar_url,
          name: profile.name,
          email: profile.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'github_user_id'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error saving GitHub profile:', error)
        return null
      }

      console.log('✅ GitHub profile saved successfully')
      return data as GitHubUserProfile

    } catch (error) {
      console.error('❌ Unexpected error saving profile:', error)
      return null
    }
  }

  // Buscar perfil GitHub por username
  async getGitHubProfile(github_user_id: number): Promise<GitHubUserProfile | null> {
    try {
      console.log('🔍 Looking for GitHub profile:', github_user_id)

      const { data, error } = await supabase
        .from('sa_admin_github_profiles')
        .select('*')
        .eq('github_user_id', github_user_id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found for user:', github_user_id)
          return null
        }
        console.error('❌ Error fetching GitHub profile:', error)
        return null
      }

      console.log('✅ GitHub profile found')
      return data as GitHubUserProfile

    } catch (error) {
      console.error('❌ Unexpected error fetching profile:', error)
      return null
    }
  }

  // Buscar perfil por username (para casos onde não temos ID)
  async getGitHubProfileByUsername(username: string): Promise<GitHubUserProfile | null> {
    try {
      console.log('🔍 Looking for GitHub profile by username:', username)

      const { data, error } = await supabase
        .from('sa_admin_github_profiles')
        .select('*')
        .eq('github_username', username)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found for username:', username)
          return null
        }
        console.error('❌ Error fetching GitHub profile by username:', error)
        return null
      }

      console.log('✅ GitHub profile found by username')
      return data as GitHubUserProfile

    } catch (error) {
      console.error('❌ Unexpected error fetching profile by username:', error)
      return null
    }
  }

  // Deletar perfil GitHub
  async deleteGitHubProfile(github_user_id: number): Promise<boolean> {
    try {
      console.log('🗑️ Deleting GitHub profile:', github_user_id)

      const { error } = await supabase
        .from('sa_admin_github_profiles')
        .delete()
        .eq('github_user_id', github_user_id)

      if (error) {
        console.error('❌ Error deleting GitHub profile:', error)
        return false
      }

      console.log('✅ GitHub profile deleted successfully')
      return true

    } catch (error) {
      console.error('❌ Unexpected error deleting profile:', error)
      return false
    }
  }

  // Atualizar apenas o access token (para refresh)
  async updateAccessToken(github_user_id: number, access_token: string): Promise<boolean> {
    try {
      console.log('🔄 Updating access token for user:', github_user_id)

      const { error } = await supabase
        .from('sa_admin_github_profiles')
        .update({ 
          access_token,
          updated_at: new Date().toISOString()
        })
        .eq('github_user_id', github_user_id)

      if (error) {
        console.error('❌ Error updating access token:', error)
        return false
      }

      console.log('✅ Access token updated successfully')
      return true

    } catch (error) {
      console.error('❌ Unexpected error updating access token:', error)
      return false
    }
  }

  // Verificar se database está funcionando
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase connection...')
      
      const { error } = await supabase
        .from('sa_admin_github_profiles')
        .select('count(*)', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Supabase connection test failed:', error)
        return false
      }

      console.log('✅ Supabase connection successful')
      return true

    } catch (error) {
      console.error('❌ Unexpected error testing Supabase connection:', error)
      return false
    }
  }
}

export const githubSupabase = GitHubSupabaseService.getInstance()