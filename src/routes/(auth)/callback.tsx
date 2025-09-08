import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const Route = createFileRoute('/(auth)/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        
        // Check if this is GitHub OAuth callback
        if (code && state) {
          const savedState = localStorage.getItem('github_oauth_state')
          if (state !== savedState) {
            toast.error('Invalid OAuth state - potential CSRF attack')
            navigate({ to: '/github', replace: true })
            return
          }
          
          localStorage.removeItem('github_oauth_state')
          
          // Exchange code for token using Netlify function
          const response = await fetch('/.netlify/functions/github-exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          })
          
          if (!response.ok) {
            throw new Error('Failed to exchange code for token')
          }
          
          const { access_token } = await response.json()
          
          // Get current user session
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.user) {
            toast.error('Please sign in first to connect GitHub')
            navigate({ to: '/sign-in', replace: true })
            return
          }
          
          // Save GitHub token to localStorage for now
          // TODO: Save to database later
          localStorage.setItem('github_access_token', access_token)
          
          toast.success('GitHub connected successfully!')
          navigate({ to: '/github', replace: true })
          return
        }
        
        // Otherwise handle regular Supabase auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed')
          navigate({ to: '/sign-in', replace: true })
          return
        }

        if (data.session) {
          toast.success('Successfully signed in!')
          navigate({ to: '/', replace: true })
        } else {
          navigate({ to: '/sign-in', replace: true })
        }
      } catch (error) {
        console.error('Callback error:', error)
        toast.error('Callback processing failed')
        navigate({ to: '/sign-in', replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Processing callback...</p>
      </div>
    </div>
  )
}