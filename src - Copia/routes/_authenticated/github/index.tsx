import { createFileRoute } from '@tanstack/react-router'
import { GitHubPage } from '@/features/github'

export const Route = createFileRoute('/_authenticated/github/')({
  component: GitHubPage,
})