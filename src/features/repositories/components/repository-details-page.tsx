import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Info,
  GitCommit,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Code,
  Tag,
  Users,
  Clock,
  FileText,
  ArrowLeft,
  AlertCircle,
  Plus
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { repositoriesService } from '@/services/repositories-service'
import { useGitHub } from '@/features/github/components/github-provider'
import ReactMarkdown from 'react-markdown'
import { Octokit } from '@octokit/rest'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface RepositoryDetailsPageProps {
  repositoryName: string
}

export function RepositoryDetailsPage({ repositoryName }: RepositoryDetailsPageProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { accessToken } = useGitHub()

  // Buscar dados do repositório no Supabase
  const { data: repository, isLoading: loadingRepo } = useQuery({
    queryKey: ['repository', repositoryName],
    queryFn: () => repositoriesService.getRepository(repositoryName),
  })

  // Buscar commits do repositório
  const { data: commits, isLoading: loadingCommits } = useQuery({
    queryKey: ['repository-commits', repositoryName],
    queryFn: async () => {
      if (!repository || !accessToken) return []
      const [owner, repo] = repository.full_name.split('/')
      const octokit = new Octokit({ auth: accessToken })
      const response = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 50
      })
      return response.data
    },
    enabled: !!repository && !!accessToken,
  })

  if (loadingRepo) {
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
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </Main>
      </>
    )
  }

  if (!repository) {
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
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-muted-foreground mb-4">
              Repositório não encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              O repositório "{repositoryName}" não foi encontrado ou não está salvo.
            </p>
            <Button asChild>
              <Link to="/repositories">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Repositórios
              </Link>
            </Button>
          </div>
        </Main>
      </>
    )
  }

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
        {/* Header */}
        <div className="flex items-start justify-between space-y-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/repositories">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Repositórios
              </Link>
            </Button>
            <span>/</span>
            <span>{repository.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {repository.owner_avatar_url && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={repository.owner_avatar_url} alt={repository.owner_login || ''} />
                <AvatarFallback>{repository.owner_login?.charAt(0)?.toUpperCase() || 'R'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {repository.owner_login}/{repository.name}
                {repository.is_private && (
                  <Badge variant="secondary">Private</Badge>
                )}
              </h1>
              {repository.description && (
                <p className="text-muted-foreground mt-1">{repository.description}</p>
              )}
            </div>
          </div>

          {/* Métricas */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {repository.stars}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {repository.forks}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {repository.watchers}
            </div>
            {repository.language && (
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                {repository.language}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver no GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="commits" className="flex items-center gap-2">
            <GitCommit className="w-4 h-4" />
            Commits
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="prd" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PRD
          </TabsTrigger>
          <TabsTrigger value="infos" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Infos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RepositoryOverview repository={repository} />
        </TabsContent>

        <TabsContent value="commits" className="space-y-6">
          <RepositoryCommits
            repository={repository}
            commits={commits || []}
            isLoading={loadingCommits}
          />
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <RepositoryIssues repository={repository} />
        </TabsContent>

        <TabsContent value="prd" className="space-y-6">
          <RepositoryPRD repository={repository} />
        </TabsContent>

        <TabsContent value="infos" className="space-y-6">
          <RepositoryInfos repository={repository} />
        </TabsContent>
      </Tabs>
      </Main>
    </>
  )
}

// Componente da aba Overview
function RepositoryOverview({ repository }: { repository: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Linguagem:</span>
              <p className="font-medium">{repository.language || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Branch padrão:</span>
              <p className="font-medium">{repository.default_branch}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tamanho:</span>
              <p className="font-medium">{(repository.size_kb / 1024).toFixed(2)} MB</p>
            </div>
            <div>
              <span className="text-muted-foreground">Visibilidade:</span>
              <p className="font-medium">{repository.is_private ? 'Privado' : 'Público'}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">Datas:</span>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Criado:</span>
                <span>{new Date(repository.github_created_at || repository.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Atualizado:</span>
                <span>{new Date(repository.github_updated_at || repository.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
              {repository.github_pushed_at && (
                <div className="flex items-center justify-between">
                  <span>Último push:</span>
                  <span>{new Date(repository.github_pushed_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Issues</span>
              <Badge variant={repository.has_issues ? 'default' : 'secondary'}>
                {repository.has_issues ? 'Habilitado' : 'Desabilitado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Projects</span>
              <Badge variant={repository.has_projects ? 'default' : 'secondary'}>
                {repository.has_projects ? 'Habilitado' : 'Desabilitado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Wiki</span>
              <Badge variant={repository.has_wiki ? 'default' : 'secondary'}>
                {repository.has_wiki ? 'Habilitado' : 'Desabilitado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fork</span>
              <Badge variant={repository.is_fork ? 'default' : 'secondary'}>
                {repository.is_fork ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tópicos */}
      {repository.topics && repository.topics.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tópicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {repository.topics.map((topic: string) => (
                <Badge key={topic} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* URLs */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">GitHub:</span>
              <p>
                <a 
                  href={repository.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {repository.html_url}
                </a>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Clone HTTPS:</span>
              <p className="font-mono text-xs break-all bg-muted p-1 rounded">
                {repository.clone_url}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Clone SSH:</span>
              <p className="font-mono text-xs break-all bg-muted p-1 rounded">
                {repository.ssh_url}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente da aba Commits
function RepositoryCommits({ 
  repository, 
  commits, 
  isLoading 
}: { 
  repository: any
  commits: any[]
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Commits Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Commits Recentes
          <Badge variant="secondary">{commits.length}</Badge>
        </CardTitle>
        <CardDescription>
          Últimos commits do repositório {repository.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GitCommit className="w-8 h-8 mx-auto mb-2" />
            <p>Nenhum commit encontrado</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {commits.map((commit) => (
                <div key={commit.sha} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Avatar do autor */}
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={commit.author?.avatar_url} alt={commit.commit.author?.name || 'Author'} />
                    <AvatarFallback>
                      {commit.commit.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Informações do commit */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">
                          {commit.commit.message.split('\n')[0]}
                        </p>
                        {commit.commit.message.includes('\n') && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs font-mono">
                        {commit.sha.substring(0, 7)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {commit.commit.author?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(commit.commit.author?.date || '').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {commit.files?.length || 0} arquivo(s)
                      </div>
                    </div>
                  </div>

                  {/* Link para ver no GitHub */}
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                    <a 
                      href={commit.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Ver commit no GitHub"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Componente da aba Issues
function RepositoryIssues({ repository }: { repository: any }) {
  const { accessToken } = useGitHub()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '' })

  // Buscar issues do repositório
  const { data: issues, isLoading, refetch } = useQuery({
    queryKey: ['repository-issues', repository.full_name],
    queryFn: async () => {
      if (!accessToken) return []
      const [owner, repo] = repository.full_name.split('/')
      const octokit = new Octokit({ auth: accessToken })

      try {
        const { data } = await octokit.issues.listForRepo({
          owner,
          repo,
          state: 'all',
          per_page: 50
        })
        return data
      } catch (error: any) {
        console.error('Failed to get issues:', error)
        throw new Error(`Failed to get issues: ${error.message}`)
      }
    },
    enabled: !!repository && !!accessToken,
  })

  // Criar nova issue
  const handleCreateIssue = async () => {
    if (!accessToken || !newIssue.title.trim()) return

    try {
      const [owner, repo] = repository.full_name.split('/')
      const octokit = new Octokit({ auth: accessToken })

      await octokit.issues.create({
        owner,
        repo,
        title: newIssue.title,
        body: newIssue.body || undefined
      })

      // Reset form and close dialog
      setNewIssue({ title: '', body: '' })
      setIsCreateDialogOpen(false)

      // Refresh issues list
      refetch()
    } catch (error: any) {
      console.error('Failed to create issue:', error)
      alert('Erro ao criar issue: ' + error.message)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Issues ({issues?.length || 0})
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Issue</DialogTitle>
                <DialogDescription>
                  Crie uma nova issue para o repositório {repository.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="issue-title">Título *</Label>
                  <Input
                    id="issue-title"
                    placeholder="Digite o título da issue..."
                    value={newIssue.title}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="issue-body">Descrição</Label>
                  <Textarea
                    id="issue-body"
                    placeholder="Descreva a issue (opcional)..."
                    rows={6}
                    value={newIssue.body}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, body: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateIssue}
                    disabled={!newIssue.title.trim()}
                  >
                    Criar Issue
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {issues && issues.length > 0 ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {issues.map((issue: any) => (
                <div key={issue.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                          {issue.state === 'open' ? 'Aberta' : 'Fechada'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          #{issue.number}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {issue.title}
                      </h4>
                      {issue.body && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {issue.body}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={issue.user.avatar_url} alt={issue.user.login} />
                            <AvatarFallback>{issue.user.login.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {issue.user.login}
                        </div>
                        <span>•</span>
                        <span>{new Date(issue.created_at).toLocaleDateString('pt-BR')}</span>
                        {issue.comments > 0 && (
                          <>
                            <span>•</span>
                            <span>{issue.comments} comentários</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma Issue Encontrada</h3>
            <p className="text-sm mb-4">
              Este repositório não possui issues ainda.
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Issue
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente da aba Infos
function RepositoryInfos({ repository }: { repository: any }) {
  const { accessToken } = useGitHub()

  // Buscar conteúdo do infos.md
  const { data: infosContent, isLoading, error } = useQuery({
    queryKey: ['repository-infos', repository.full_name],
    queryFn: async () => {
      if (!accessToken) return null
      const [owner, repo] = repository.full_name.split('/')
      const octokit = new Octokit({ auth: accessToken })

      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: 'docs/infos.md',
        })

        // Verifica se é um arquivo (não diretório)
        if ('content' in data && data.type === 'file') {
          // Decodifica o conteúdo base64 com suporte a UTF-8
          const content = decodeURIComponent(escape(atob(data.content)))
          return content
        }

        return null
      } catch (error: any) {
        // Se o arquivo não existe, retorna null
        if (error.status === 404) {
          return null
        }
        console.error('Failed to get Infos file:', error)
        throw new Error(`Failed to get Infos file: ${error.message}`)
      }
    },
    enabled: !!repository && !!accessToken,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Infos - Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Infos - Informações Adicionais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {infosContent ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{infosContent}</ReactMarkdown>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Infos Inexistente</h3>
            <p className="text-sm">
              Este repositório não possui um arquivo infos.md na pasta docs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente da aba PRD
function RepositoryPRD({ repository }: { repository: any }) {
  const { accessToken } = useGitHub()
  
  // Buscar conteúdo do PRD.md
  const { data: prdContent, isLoading, error } = useQuery({
    queryKey: ['repository-prd', repository.full_name],
    queryFn: async () => {
      if (!accessToken) return null
      const [owner, repo] = repository.full_name.split('/')
      const octokit = new Octokit({ auth: accessToken })
      
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: 'docs/prd.md',
        })

        // Verifica se é um arquivo (não diretório)
        if ('content' in data && data.type === 'file') {
          // Decodifica o conteúdo base64 com suporte a UTF-8
          const content = decodeURIComponent(escape(atob(data.content)))
          return content
        }

        return null
      } catch (error: any) {
        // Se o arquivo não existe, retorna null
        if (error.status === 404) {
          return null
        }
        console.error('Failed to get PRD file:', error)
        throw new Error(`Failed to get PRD file: ${error.message}`)
      }
    },
    enabled: !!repository && !!accessToken,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PRD - Product Requirements Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PRD - Product Requirements Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p>Erro ao carregar PRD</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          PRD - Product Requirements Document
        </CardTitle>
        <CardDescription>
          Documento de Requisitos do Produto do repositório {repository.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prdContent ? (
          <ScrollArea className="h-[600px] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{prdContent}</ReactMarkdown>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">PRD Inexistente</h3>
            <p className="text-sm">
              Este repositório não possui um arquivo PRD.md na pasta docs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}