import { createFileRoute } from '@tanstack/react-router'
import { RepositoriesPage } from '@/features/repositories'
import { GitHubProvider } from '@/features/github/components/github-provider'

export const Route = createFileRoute('/_authenticated/repositories/')({
  component: RepositoriesPageComponent,
})

function RepositoriesPageComponent() {
  return (
    <GitHubProvider>
      <RepositoriesPage />
    </GitHubProvider>
  )
}