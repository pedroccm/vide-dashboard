// Netlify Function para troca segura de código OAuth por token
// Esta função roda no servidor, evitando problemas de CORS

exports.handler = async (event, context) => {
  // Headers CORS para permitir requests do frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Só aceitar método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse do body da requisição
    const { code, state } = JSON.parse(event.body);
    
    console.log('🔍 GitHub OAuth Function - Starting exchange');
    console.log('Code received:', code?.substring(0, 10) + '...');
    console.log('State received:', state);
    
    // Validações básicas
    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'missing_code',
          message: 'Authorization code is required' 
        })
      };
    }

    // Obter credenciais das variáveis de ambiente
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.VITE_GITHUB_CLIENT_SECRET;
    
    console.log('Client ID:', clientId);
    console.log('Has Client Secret:', !!clientSecret);

    if (!clientId || !clientSecret) {
      console.error('❌ Missing GitHub OAuth credentials');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'server_config_error',
          message: 'GitHub OAuth not configured properly'
        })
      };
    }

    // Fazer requisição para GitHub OAuth
    console.log('🚀 Making request to GitHub OAuth endpoint...');
    
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'shadcn-admin-app/1.0'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    console.log('GitHub response status:', response.status);
    console.log('GitHub response headers:', response.headers);

    if (!response.ok) {
      console.error('❌ GitHub OAuth request failed:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'github_oauth_error',
          message: `GitHub OAuth failed: ${response.status} ${response.statusText}`
        })
      };
    }

    const data = await response.json();
    console.log('GitHub response data keys:', Object.keys(data));
    
    // Verificar se houve erro na resposta
    if (data.error) {
      console.error('❌ GitHub OAuth error:', data.error, data.error_description);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: data.error,
          message: data.error_description || 'GitHub OAuth error'
        })
      };
    }

    // Verificar se recebemos o token
    if (!data.access_token) {
      console.error('❌ No access token in GitHub response');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'no_token',
          message: 'No access token received from GitHub'
        })
      };
    }

    console.log('✅ Successfully exchanged code for token');
    console.log('Token scope:', data.scope);
    console.log('Token type:', data.token_type);

    // Retornar o token com sucesso
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: data.access_token,
        token_type: data.token_type,
        scope: data.scope
      })
    };

  } catch (error) {
    console.error('❌ Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'internal_error',
        message: 'Internal server error during OAuth exchange'
      })
    };
  }
};