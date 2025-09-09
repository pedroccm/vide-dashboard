import { createFileRoute } from '@tanstack/react-router'
import { RepositoryDetailsPage } from '@/features/repositories/components/repository-details-page'
import { GitHubProvider } from '@/features/github/components/github-provider'

export const Route = createFileRoute('/_authenticated/repositories/$repositoryName')({
  component: RepositoryDetailsPageComponent,
})

function RepositoryDetailsPageComponent() {
  const { repositoryName } = Route.useParams()
  
  return (
    <GitHubProvider>
      <RepositoryDetailsPage repositoryName={decodeURIComponent(repositoryName)} />
    </GitHubProvider>
  )
}