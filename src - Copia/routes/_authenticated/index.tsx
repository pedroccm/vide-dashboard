import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

const searchSchema = z.object({
  success: z.string().optional(),
  message: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
  validateSearch: searchSchema,
})
