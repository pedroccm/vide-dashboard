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
          const savedState = sessionStorage.getItem('github_oauth_state')
          if (state !== savedState) {
            toast.error('Invalid OAuth state - potential CSRF attack')
            navigate({ to: '/github', replace: true })
            return
          }
          
          sessionStorage.removeItem('github_oauth_state')
          
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
          
          // Get GitHub user info
          const githubUserResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${access_token}` }
          })
          const githubUser = await githubUserResponse.json()
          
          // Save user and profile in database using regular client
          await supabase.from('sa_users').upsert({
            id: session.user.id,
            email: session.user.email || '',
            updated_at: new Date().toISOString()
          })
          
          await supabase.from('sa_user_profiles').upsert({
            user_id: session.user.id,
            name: githubUser.name || githubUser.login || session.user.email?.split('@')[0],
            avatar_url: githubUser.avatar_url,
            updated_at: new Date().toISOString()
          })
          
          // Save GitHub token and profile in database using regular client
          await supabase.from('sa_github_profiles').upsert({
            user_id: session.user.id,
            github_user_id: githubUser.id,
            github_username: githubUser.login,
            access_token: access_token,
            scope: 'repo,user',
            avatar_url: githubUser.avatar_url,
            name: githubUser.name,
            email: githubUser.email,
            updated_at: new Date().toISOString()
          })
          
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