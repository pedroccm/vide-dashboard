import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitHubRepository } from '../data/types'
import { Star, GitFork, ExternalLink, Lock, Unlock, Archive, Circle } from 'lucide-react'
import { format } from 'date-fns'

interface RepositoryCardProps {
  repository: GitHubRepository
  onSelect?: (repo: GitHubRepository) => void
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Vue: '#41b883',
  React: '#61dafb',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Markdown: '#083fa1',
}

export function RepositoryCard({ repository, onSelect }: RepositoryCardProps) {
  const languageColor = repository.language ? languageColors[repository.language] || '#6e7681' : '#6e7681'

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect?.(repository)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="truncate">{repository.name}</span>
              {repository.private && (
                <Badge variant="secondary" className="ml-auto">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              {repository.archived && (
                <Badge variant="secondary">
                  <Archive className="h-3 w-3 mr-1" />
                  Archived
                </Badge>
              )}
            </CardTitle>
            {repository.fork && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <GitFork className="h-3 w-3" />
                Forked repository
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              window.open(repository.html_url, '_blank')
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {repository.description && (
          <CardDescription className="line-clamp-2">
            {repository.description}
          </CardDescription>
        )}
        
        <div className="flex flex-wrap gap-1">
          {repository.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
          {repository.topics.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{repository.topics.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {repository.language && (
            <div className="flex items-center gap-1">
              <Circle 
                className="h-3 w-3 fill-current" 
                style={{ color: languageColor }}
              />
              <span>{repository.language}</span>
            </div>
          )}
          
          {repository.stargazers_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{repository.stargazers_count}</span>
            </div>
          )}
          
          {repository.forks_count > 0 && (
            <div className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              <span>{repository.forks_count}</span>
            </div>
          )}

          {repository.license && (
            <div className="flex items-center gap-1">
              <Unlock className="h-3 w-3" />
              <span className="truncate">{repository.license.spdx_id}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Updated {format(new Date(repository.updated_at), 'MMM d, yyyy')}
        </div>
      </CardContent>
    </Card>
  )
}