import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'
import { RepositorySortOption, RepositoryFilterOption } from '../data/types'

interface RepositoryFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: RepositorySortOption
  onSortChange: (sort: RepositorySortOption) => void
  filterBy: RepositoryFilterOption
  onFilterChange: (filter: RepositoryFilterOption) => void
  onClearFilters: () => void
}

export function RepositoryFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  onClearFilters,
}: RepositoryFiltersProps) {
  const hasActiveFilters = searchQuery || filterBy !== 'all' || sortBy !== 'updated'

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={filterBy} onValueChange={(value) => onFilterChange(value as RepositoryFilterOption)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All repositories</SelectItem>
            <SelectItem value="public">Public only</SelectItem>
            <SelectItem value="private">Private only</SelectItem>
            <SelectItem value="fork">Forks only</SelectItem>
            <SelectItem value="source">Sources only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as RepositorySortOption)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last updated</SelectItem>
            <SelectItem value="created">Recently created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stars">Stars</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}