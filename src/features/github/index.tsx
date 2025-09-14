import { useState, useMemo } from 'react'
import { GitHubProvider, useGitHub } from './components/github-provider'
import { GitHubConnect } from './components/github-connect'
import { GitHubHeader } from './components/github-header'
import { RepositoryCard } from './components/repository-card'
import { RepositoryFilters } from './components/repository-filters'
import { RepositorySortOption, RepositoryFilterOption, GitHubRepository } from './data/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Github, Package } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

function GitHubContent() {
  const { isConnected, repositories, isLoading, error } = useGitHub()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<RepositorySortOption>('updated')
  const [filterBy, setFilterBy] = useState<RepositoryFilterOption>('all')

  const filteredAndSortedRepos = useMemo(() => {
    let filtered = [...repositories]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply type filter
    switch (filterBy) {
      case 'public':
        filtered = filtered.filter((repo) => !repo.private)
        break
      case 'private':
        filtered = filtered.filter((repo) => repo.private)
        break
      case 'fork':
        filtered = filtered.filter((repo) => repo.fork)
        break
      case 'source':
        filtered = filtered.filter((repo) => !repo.fork)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'stars':
        filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
        break
      case 'created':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'updated':
      default:
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        break
    }

    return filtered
  }, [repositories, searchQuery, sortBy, filterBy])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSortBy('updated')
    setFilterBy('all')
  }

  const handleSelectRepository = (repo: GitHubRepository) => {
    window.open(repo.html_url, '_blank')
  }

  if (!isConnected) {
    return <GitHubConnect />
  }

  return (
    <div className="space-y-6">
      <GitHubHeader />

      <RepositoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        onClearFilters={handleClearFilters}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : filteredAndSortedRepos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedRepos.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onSelect={handleSelectRepository}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No repositories found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'You don\'t have any repositories yet'}
          </p>
        </div>
      )}
    </div>
  )
}

export function GitHubPage() {
  return (
    <GitHubProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>GitHub</h1>
            <p className='text-muted-foreground'>
              Connect your GitHub account to view and manage your repositories
            </p>
          </div>
        </div>
        <GitHubContent />
      </Main>
    </GitHubProvider>
  )
}