export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  html_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  bio: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  description: string | null
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  forks_count: number
  open_issues_count: number
  license: {
    key: string
    name: string
    spdx_id: string
    url: string | null
    node_id: string
  } | null
  topics: string[]
  visibility: 'public' | 'private'
  default_branch: string
  archived: boolean
  disabled: boolean
}

export interface GitHubConnection {
  isConnected: boolean
  user: GitHubUser | null
  accessToken: string | null
  repositories: GitHubRepository[]
  isLoading: boolean
  error: string | null
}

export type RepositorySortOption = 'name' | 'stars' | 'updated' | 'created'
export type RepositoryFilterOption = 'all' | 'public' | 'private' | 'fork' | 'source'