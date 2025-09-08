import { createFileRoute } from '@tanstack/react-router'
import { RepositoryDetailsPage } from '@/features/repositories/components/repository-details-page'

export const Route = createFileRoute('/_authenticated/repositories/$repositoryName')({
  component: RepositoryDetailsPageComponent,
})

function RepositoryDetailsPageComponent() {
  const { repositoryName } = Route.useParams()
  
  return <RepositoryDetailsPage repositoryName={decodeURIComponent(repositoryName)} />
}