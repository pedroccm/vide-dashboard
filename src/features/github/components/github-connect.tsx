import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGitHub } from './github-provider'
import { Github, Loader2, AlertCircle } from 'lucide-react'

export function GitHubConnect() {
  const { isConnected, isLoading, error, connect } = useGitHub()

  if (isConnected) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Github className="h-6 w-6" />
          </div>
          <CardTitle>Connect to GitHub</CardTitle>
          <CardDescription>
            Connect your GitHub account to view and manage your repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>By connecting your GitHub account, you'll be able to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>View all your repositories</li>
              <li>See repository statistics and details</li>
              <li>Filter and search through your projects</li>
              <li>Access repository information quickly</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={connect} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub Account
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}