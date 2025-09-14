import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  RefreshCw,
  Star,
  GitFork,
  Eye,
  Calendar,
  ExternalLink,
  Archive,
  Plus,
  Github
} from 'lucide-react'
import { toast } from 'sonner'
import { useGitHub } from '@/features/github/components/github-provider'
import { repositoriesService, type Repository } from '@/services/repositories-service'
import type { GitHubRepository } from '@/features/github/data/types'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

function RepositoriesContent() {
  const [availableRepos, setAvailableRepos] = useState<GitHubRepository[]>([])
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([])
  const queryClient = useQueryClient()
  
  // Usar GitHubProvider para pegar repositórios
  const { repositories: githubRepos, isLoading: loadingGitHub, refreshRepositories } = useGitHub()

  // Buscar repositórios salvos no Supabase
  const { data: savedRepos, isLoading: loadingSaved } = useQuery({
    queryKey: ['saved-repositories'],
    queryFn: () => repositoriesService.getRepositories(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Mutation para salvar repositório
  const saveRepoMutation = useMutation({
    mutationFn: (repo: GitHubRepository) => repositoriesService.saveRepository(repo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-repositories'] })
      toast.success('Repositório salvo com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar repositório')
    }
  })

  // Mutation para remover repositório
  const removeRepoMutation = useMutation({
    mutationFn: (repoId: string) => repositoriesService.deleteRepository(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-repositories'] })
      toast.success('Repositório removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover repositório')
    }
  })

  // Filtrar repositórios disponíveis (não salvos)
  useEffect(() => {
    if (githubRepos && savedRepos) {
      const savedFullNames = new Set(savedRepos.map(repo => repo.full_name))
      const available = githubRepos.filter(repo => !savedFullNames.has(repo.full_name))
      setAvailableRepos(available)
      setSelectedRepos(savedRepos)
    }
  }, [githubRepos, savedRepos])

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Se não foi dropado em lugar válido
    if (!destination) return

    // Se foi dropado no mesmo lugar
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Se foi movido da lista disponível para a lista selecionada
    if (source.droppableId === 'available' && destination.droppableId === 'selected') {
      const repoToMove = availableRepos.find(repo => repo.id.toString() === draggableId)
      if (repoToMove) {
        saveRepoMutation.mutate(repoToMove)
      }
      return
    }

    // Se foi movido da lista selecionada para a lista disponível (remover)
    if (source.droppableId === 'selected' && destination.droppableId === 'available') {
      const repoToMove = selectedRepos.find(repo => repo.id === draggableId)
      if (repoToMove) {
        removeRepoMutation.mutate(repoToMove.id)
      }
      return
    }

    // Reordenar dentro da mesma lista
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'available') {
        const items = Array.from(availableRepos)
        const [reorderedItem] = items.splice(source.index, 1)
        items.splice(destination.index, 0, reorderedItem)
        setAvailableRepos(items)
      } else if (source.droppableId === 'selected') {
        const items = Array.from(selectedRepos)
        const [reorderedItem] = items.splice(source.index, 1)
        items.splice(destination.index, 0, reorderedItem)
        setSelectedRepos(items)
      }
    }
  }

  const isLoading = loadingGitHub || loadingSaved

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositórios</h1>
          <p className="text-muted-foreground">
            Gerencie seus repositórios do GitHub. Arraste da esquerda para a direita para salvar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refreshRepositories()}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Lista de Repositórios Disponíveis */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Repositórios Disponíveis
                <Badge variant="secondary">{availableRepos.length}</Badge>
              </CardTitle>
              <CardDescription>
                Seus repositórios do GitHub. Arraste para a direita para salvar.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <ScrollArea
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`h-full rounded-lg border-2 border-dashed p-4 transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25'
                    }`}
                  >
                    <div className="space-y-3">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-muted rounded-lg p-4 space-y-2">
                              <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                              <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
                              <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))
                      ) : availableRepos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Archive className="w-8 h-8 mx-auto mb-2" />
                          <p>Todos os repositórios já foram salvos!</p>
                        </div>
                      ) : (
                        availableRepos.map((repo, index) => (
                          <Draggable
                            key={repo.id.toString()}
                            draggableId={repo.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card border rounded-lg p-4 transition-all cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging 
                                    ? 'shadow-lg rotate-2 scale-105' 
                                    : 'hover:shadow-md'
                                }`}
                              >
                                <RepositoryCard repo={repo} isGitHub={true} />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Lista de Repositórios Selecionados */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Repositórios Salvos
                <Badge variant="default">{selectedRepos.length}</Badge>
              </CardTitle>
              <CardDescription>
                Repositórios salvos no seu workspace. Arraste para a esquerda para remover.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <Droppable droppableId="selected">
                {(provided, snapshot) => (
                  <ScrollArea
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`h-full rounded-lg border-2 border-dashed p-4 transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'border-destructive bg-destructive/5' 
                        : 'border-muted-foreground/25'
                    }`}
                  >
                    <div className="space-y-3">
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-muted rounded-lg p-4 space-y-2">
                              <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                              <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
                              <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))
                      ) : selectedRepos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <p>Nenhum repositório salvo ainda.</p>
                          <p className="text-sm">Arraste repositórios da esquerda para cá!</p>
                        </div>
                      ) : (
                        selectedRepos.map((repo, index) => (
                          <Draggable
                            key={repo.id}
                            draggableId={repo.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card border rounded-lg p-4 transition-all cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging 
                                    ? 'shadow-lg rotate-2 scale-105' 
                                    : 'hover:shadow-md'
                                }`}
                              >
                                <RepositoryCard repo={repo} isGitHub={false} />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </CardContent>
          </Card>
        </div>
      </DragDropContext>
    </div>
  )
}

export function RepositoriesPage() {
  const { isConnected } = useGitHub()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {!isConnected ? (
          <>
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Repositórios</h1>
                <p className="text-muted-foreground">
                  Gerencie seus repositórios do GitHub. Arraste da esquerda para a direita para salvar.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Github className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">GitHub não conectado</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Você precisa conectar sua conta do GitHub primeiro para gerenciar repositórios.
              </p>
              <Button asChild>
                <a href="/github">
                  <Github className="w-4 h-4 mr-2" />
                  Ir para página do GitHub
                </a>
              </Button>
            </div>
          </>
        ) : (
          <RepositoriesContent />
        )}
      </Main>
    </>
  )
}

// Componente para exibir informações do repositório
function RepositoryCard({ 
  repo, 
  isGitHub 
}: { 
  repo: GitHubRepository | Repository
  isGitHub: boolean 
}) {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getLanguageColor = (language: string | null | undefined) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'C#': 'bg-purple-500',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-600',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'Swift': 'bg-orange-500',
    }
    return colors[language || ''] || 'bg-gray-500'
  }

  return (
    <div className="space-y-3">
      {/* Header com nome e owner */}
      <div className="flex items-start gap-3">
        {'owner' in repo && repo.owner && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
            <AvatarFallback>{repo.owner.login.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        {'owner_avatar_url' in repo && repo.owner_avatar_url && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={repo.owner_avatar_url} alt={repo.owner_login || ''} />
            <AvatarFallback>{repo.owner_login?.charAt(0)?.toUpperCase() || 'R'}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">
              {isGitHub && 'owner' in repo && repo.owner ? repo.owner.login : ('owner_login' in repo ? repo.owner_login : '') || ''}/
              <span className="text-primary">{repo.name}</span>
            </h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {'stargazers_count' in repo ? repo.stargazers_count : repo.stars}
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {'forks_count' in repo ? repo.forks_count : repo.forks}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {'watchers_count' in repo ? repo.watchers_count : repo.watchers}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(
            isGitHub && 'updated_at' in repo 
              ? repo.updated_at 
              : ('github_updated_at' in repo ? repo.github_updated_at : repo.updated_at) || new Date().toISOString()
          )}
        </div>
      </div>

      {/* Linguagem e badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {repo.language && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
              <span className="text-xs">{repo.language}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {'private' in repo ? (
            repo.private && <Badge variant="secondary" className="text-xs px-1 py-0">Private</Badge>
          ) : (
            repo.is_private && <Badge variant="secondary" className="text-xs px-1 py-0">Private</Badge>
          )}
          {'fork' in repo ? (
            repo.fork && <Badge variant="outline" className="text-xs px-1 py-0">Fork</Badge>
          ) : (
            repo.is_fork && <Badge variant="outline" className="text-xs px-1 py-0">Fork</Badge>
          )}
        </div>
      </div>
    </div>
  )
}