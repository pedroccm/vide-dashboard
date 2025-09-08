import { supabase } from '@/lib/supabase'
import type { GitHubRepository } from '@/features/github/data/types'

export interface Repository {
  id: string
  name: string
  full_name: string
  description?: string
  url: string
  clone_url?: string
  ssh_url?: string
  html_url?: string
  language?: string
  stars: number
  forks: number
  watchers: number
  size_kb: number
  is_private: boolean
  is_fork: boolean
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  default_branch: string
  owner_login?: string
  owner_avatar_url?: string
  topics?: string[]
  license_name?: string
  created_at: string
  updated_at: string
  github_created_at?: string
  github_updated_at?: string
  github_pushed_at?: string
  status: 'active' | 'archived' | 'deleted'
  notes?: string
  category?: string
  priority: number
}

export class RepositoriesService {
  private static instance: RepositoriesService
  
  private constructor() {}

  static getInstance(): RepositoriesService {
    if (!RepositoriesService.instance) {
      RepositoriesService.instance = new RepositoriesService()
    }
    return RepositoriesService.instance
  }

  // Converter repositório do GitHub para nosso formato
  private mapGitHubRepository(githubRepo: GitHubRepository): Omit<Repository, 'id' | 'created_at' | 'updated_at'> {
    return {
      name: githubRepo.name,
      full_name: githubRepo.full_name,
      description: githubRepo.description || undefined,
      url: githubRepo.html_url,
      clone_url: githubRepo.clone_url,
      ssh_url: githubRepo.ssh_url,
      html_url: githubRepo.html_url,
      language: githubRepo.language || undefined,
      stars: githubRepo.stargazers_count || 0,
      forks: githubRepo.forks_count || 0,
      watchers: githubRepo.watchers_count || 0,
      size_kb: githubRepo.size || 0,
      is_private: githubRepo.private || false,
      is_fork: githubRepo.fork || false,
      has_issues: githubRepo.has_issues || false,
      has_projects: githubRepo.has_projects || false,
      has_wiki: githubRepo.has_wiki || false,
      default_branch: githubRepo.default_branch || 'main',
      owner_login: githubRepo.owner?.login,
      owner_avatar_url: githubRepo.owner?.avatar_url,
      topics: githubRepo.topics || [],
      license_name: githubRepo.license?.name || undefined,
      github_created_at: githubRepo.created_at,
      github_updated_at: githubRepo.updated_at,
      github_pushed_at: githubRepo.pushed_at,
      status: 'active' as const,
      priority: 0
    }
  }

  // Salvar repositório do GitHub no Supabase
  async saveRepository(githubRepo: GitHubRepository): Promise<Repository | null> {
    try {
      console.log('💾 Saving repository to Supabase:', githubRepo.full_name)

      const repositoryData = this.mapGitHubRepository(githubRepo)

      const { data, error } = await supabase
        .from('sa_repositories')
        .upsert(repositoryData, {
          onConflict: 'full_name'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error saving repository:', error)
        return null
      }

      console.log('✅ Repository saved successfully')
      return data as unknown as Repository

    } catch (error) {
      console.error('❌ Unexpected error saving repository:', error)
      return null
    }
  }

  // Salvar múltiplos repositórios
  async saveRepositories(githubRepos: GitHubRepository[]): Promise<Repository[]> {
    try {
      console.log('💾 Saving multiple repositories to Supabase:', githubRepos.length)

      const repositoriesData = githubRepos.map(repo => this.mapGitHubRepository(repo))

      const { data, error } = await supabase
        .from('sa_repositories')
        .upsert(repositoriesData, {
          onConflict: 'full_name'
        })
        .select()

      if (error) {
        console.error('❌ Error saving repositories:', error)
        return []
      }

      console.log('✅ Repositories saved successfully:', data.length)
      return data as unknown as Repository[]

    } catch (error) {
      console.error('❌ Unexpected error saving repositories:', error)
      return []
    }
  }

  // Buscar todos os repositórios salvos
  async getRepositories(): Promise<Repository[]> {
    try {
      console.log('🔍 Fetching repositories from Supabase...')

      const { data, error } = await supabase
        .from('sa_repositories')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching repositories:', error)
        return []
      }

      console.log('✅ Repositories fetched successfully:', data.length)
      return data as unknown as Repository[]

    } catch (error) {
      console.error('❌ Unexpected error fetching repositories:', error)
      return []
    }
  }

  // Buscar repositório por full_name
  async getRepository(fullName: string): Promise<Repository | null> {
    try {
      console.log('🔍 Fetching repository:', fullName)

      const { data, error } = await supabase
        .from('sa_repositories')
        .select('*')
        .eq('full_name', fullName)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Repository not found:', fullName)
          return null
        }
        console.error('❌ Error fetching repository:', error)
        return null
      }

      console.log('✅ Repository found')
      return data as unknown as Repository

    } catch (error) {
      console.error('❌ Unexpected error fetching repository:', error)
      return null
    }
  }

  // Atualizar status do repositório
  async updateRepositoryStatus(id: string, status: 'active' | 'archived' | 'deleted'): Promise<boolean> {
    try {
      console.log('🔄 Updating repository status:', id, status)

      const { error } = await supabase
        .from('sa_repositories')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Error updating repository status:', error)
        return false
      }

      console.log('✅ Repository status updated successfully')
      return true

    } catch (error) {
      console.error('❌ Unexpected error updating repository status:', error)
      return false
    }
  }

  // Atualizar categoria e prioridade
  async updateRepositoryMetadata(id: string, metadata: {
    category?: string
    priority?: number
    notes?: string
  }): Promise<boolean> {
    try {
      console.log('🔄 Updating repository metadata:', id)

      const { error } = await supabase
        .from('sa_repositories')
        .update({ 
          ...metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Error updating repository metadata:', error)
        return false
      }

      console.log('✅ Repository metadata updated successfully')
      return true

    } catch (error) {
      console.error('❌ Unexpected error updating repository metadata:', error)
      return false
    }
  }

  // Deletar repositório
  async deleteRepository(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting repository:', id)

      const { error } = await supabase
        .from('sa_repositories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting repository:', error)
        return false
      }

      console.log('✅ Repository deleted successfully')
      return true

    } catch (error) {
      console.error('❌ Unexpected error deleting repository:', error)
      return false
    }
  }

  // Buscar por linguagem
  async getRepositoriesByLanguage(language: string): Promise<Repository[]> {
    try {
      const { data, error } = await supabase
        .from('sa_repositories')
        .select('*')
        .eq('language', language)
        .eq('status', 'active')
        .order('stars', { ascending: false })

      if (error) {
        console.error('❌ Error fetching repositories by language:', error)
        return []
      }

      return data as unknown as Repository[]
    } catch (error) {
      console.error('❌ Unexpected error fetching repositories by language:', error)
      return []
    }
  }

  // Estatísticas
  async getRepositoryStats(): Promise<{
    total: number
    byLanguage: Record<string, number>
    byStatus: Record<string, number>
    totalStars: number
    totalForks: number
  }> {
    try {
      const repositories = await this.getRepositories()
      
      const stats = {
        total: repositories.length,
        byLanguage: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        totalStars: 0,
        totalForks: 0
      }

      repositories.forEach(repo => {
        // Por linguagem
        if (repo.language) {
          stats.byLanguage[repo.language] = (stats.byLanguage[repo.language] || 0) + 1
        }

        // Por status
        stats.byStatus[repo.status] = (stats.byStatus[repo.status] || 0) + 1

        // Totais
        stats.totalStars += repo.stars
        stats.totalForks += repo.forks
      })

      return stats
    } catch (error) {
      console.error('❌ Error getting repository stats:', error)
      return {
        total: 0,
        byLanguage: {},
        byStatus: {},
        totalStars: 0,
        totalForks: 0
      }
    }
  }
}

export const repositoriesService = RepositoriesService.getInstance()