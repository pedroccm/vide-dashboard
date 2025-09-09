import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGitHub } from './github-provider'
import { ExternalLink, LogOut, RefreshCw, GitBranch, Star, Users, Book } from 'lucide-react'

export function GitHubHeader() {
  const { user, disconnect, refreshRepositories, isLoading, repositories } = useGitHub()

  if (!user) return null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
              <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-muted-foreground">@{user.login}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={refreshRepositories}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              onClick={disconnect}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md">
              <Book className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{repositories.length}</p>
              <p className="text-xs text-muted-foreground">Repositories</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md">
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {repositories.reduce((acc, repo) => acc + repo.stargazers_count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Stars</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{user.followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {repositories.reduce((acc, repo) => acc + repo.forks_count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Forks</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}