import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente Admin do Supabase (bypassa RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { 
      user_id,
      github_user_id, 
      github_username, 
      access_token, 
      scope, 
      avatar_url, 
      name, 
      email 
    } = JSON.parse(event.body)

    if (!user_id || !github_user_id || !github_username || !access_token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // Save user first (if doesn't exist)
    const { error: userError } = await supabaseAdmin
      .from('sa_users')
      .upsert({
        id: user_id,
        email: email || '',
        updated_at: new Date().toISOString()
      })

    if (userError) {
      console.error('User save error:', userError)
      // Continue anyway, user might already exist
    }

    // Save user profile
    const { error: profileError } = await supabaseAdmin
      .from('sa_user_profiles')
      .upsert({
        user_id: user_id,
        name: name || github_username || email?.split('@')[0],
        avatar_url: avatar_url,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile save error:', profileError)
      // Continue anyway, profile might already exist
    }

    // Save GitHub profile (most important)
    const { data, error: githubError } = await supabaseAdmin
      .from('sa_github_profiles')
      .upsert({
        user_id: user_id,
        github_user_id: github_user_id,
        github_username: github_username,
        access_token: access_token,
        scope: scope || 'repo,user',
        avatar_url: avatar_url,
        name: name,
        email: email,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (githubError) {
      console.error('GitHub profile save error:', githubError)
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to save GitHub profile',
          details: githubError.message 
        })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: true,
        profile: data 
      })
    }

  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// Handle CORS preflight
export const OPTIONS = () => ({
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
})