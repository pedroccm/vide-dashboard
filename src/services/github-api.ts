import { githubAuth } from './github-auth'
import type { GitHubUser, GitHubRepository } from '@/features/github/data/types'

export class GitHubAPIService {
  // Busca informações do usuário autenticado
  async getCurrentUser(): Promise<GitHubUser> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.users.getAuthenticated()
      return data as GitHubUser
    } catch (error: any) {
      console.error('Failed to get current user:', error)
      throw new Error(`Failed to get user information: ${error.message}`)
    }
  }

  // Busca repositórios do usuário
  async getUserRepositories(options?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
    type?: 'all' | 'owner' | 'member'
  }): Promise<GitHubRepository[]> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: options?.sort || 'updated',
        direction: options?.direction || 'desc',
        per_page: options?.per_page || 100,
        page: options?.page || 1,
        type: options?.type || 'all',
      })

      return data as GitHubRepository[]
    } catch (error: any) {
      console.error('Failed to get repositories:', error)
      throw new Error(`Failed to get repositories: ${error.message}`)
    }
  }

  // Busca um repositório específico
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.repos.get({ owner, repo })
      return data as GitHubRepository
    } catch (error: any) {
      console.error('Failed to get repository:', error)
      throw new Error(`Failed to get repository: ${error.message}`)
    }
  }

  // Busca as linguagens de um repositório
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.repos.listLanguages({ owner, repo })
      return data
    } catch (error: any) {
      console.error('Failed to get repository languages:', error)
      throw new Error(`Failed to get repository languages: ${error.message}`)
    }
  }

  // Busca commits de um repositório
  async getRepositoryCommits(owner: string, repo: string, options?: {
    sha?: string
    path?: string
    per_page?: number
    page?: number
  }) {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        sha: options?.sha,
        path: options?.path,
        per_page: options?.per_page || 30,
        page: options?.page || 1,
      })
      return data
    } catch (error: any) {
      console.error('Failed to get repository commits:', error)
      throw new Error(`Failed to get repository commits: ${error.message}`)
    }
  }

  // Busca issues de um repositório
  async getRepositoryIssues(owner: string, repo: string, options?: {
    state?: 'open' | 'closed' | 'all'
    labels?: string
    sort?: 'created' | 'updated' | 'comments'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  }) {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.issues.listForRepo({
        owner,
        repo,
        state: options?.state || 'open',
        labels: options?.labels,
        sort: options?.sort || 'created',
        direction: options?.direction || 'desc',
        per_page: options?.per_page || 30,
        page: options?.page || 1,
      })
      return data
    } catch (error: any) {
      console.error('Failed to get repository issues:', error)
      throw new Error(`Failed to get repository issues: ${error.message}`)
    }
  }

  // Verifica rate limit
  async getRateLimit() {
    const octokit = githubAuth.getOctokit()
    if (!octokit) {
      throw new Error('Not authenticated with GitHub')
    }

    try {
      const { data } = await octokit.rateLimit.get()
      return data
    } catch (error: any) {
      console.error('Failed to get rate limit:', error)
      throw new Error(`Failed to get rate limit: ${error.message}`)
    }
  }

  // Busca estatísticas do usuário
  async getUserStats(): Promise<{
    totalRepos: number
    totalStars: number
    totalForks: number
    languages: Record<string, number>
  }> {
    try {
      const repositories = await this.getUserRepositories({ per_page: 100 })
      
      const totalRepos = repositories.length
      const totalStars = repositories.reduce((acc, repo) => acc + repo.stargazers_count, 0)
      const totalForks = repositories.reduce((acc, repo) => acc + repo.forks_count, 0)
      
      // Agregar linguagens de todos os repositórios
      const languages: Record<string, number> = {}
      for (const repo of repositories) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1
        }
      }

      return {
        totalRepos,
        totalStars,
        totalForks,
        languages,
      }
    } catch (error: any) {
      console.error('Failed to get user stats:', error)
      throw new Error(`Failed to get user stats: ${error.message}`)
    }
  }
}

export const githubAPI = new GitHubAPIService()