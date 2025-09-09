import { createFileRoute } from '@tanstack/react-router'
import { RepositoriesPage } from '@/features/repositories'

export const Route = createFileRoute('/_authenticated/repositories/')({
  component: RepositoriesPageComponent,
})

function RepositoriesPageComponent() {
  return <RepositoriesPage />
}