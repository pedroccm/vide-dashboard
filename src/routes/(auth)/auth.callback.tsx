import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/(auth)/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error during auth callback:', error)
          toast.error('Authentication failed. Please try again.')
          navigate({ to: '/sign-in', replace: true })
          return
        }

        if (data.session) {
          toast.success('Successfully signed in!')
          navigate({ to: '/', replace: true })
        } else {
          toast.error('No session found. Please sign in again.')
          navigate({ to: '/sign-in', replace: true })
        }
      } catch (error) {
        console.error('Error during auth callback:', error)
        toast.error('Something went wrong. Please try again.')
        navigate({ to: '/sign-in', replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}