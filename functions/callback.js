export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  const cookies = request.headers.get('Cookie') || '';
  const savedState = cookies.match(/oauth_state=([^;]+)/)?.[1];
  
  if (!code || state !== savedState) {
    return new Response('Invalid request', { status: 400 });
  }
  
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });
  
  const tokenData = await tokenRes.json();
  
  if (!tokenData.access_token) {
    return new Response('Failed to get token', { status: 500 });
  }
  
  // git-gateway 格式：返回 token 和 provider
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Success</title>
</head>
<body>
  <script>
    (function() {
      const message = JSON.stringify({
        token: "${tokenData.access_token}",
        provider: "github"
      });
      
      if (window.opener) {
        window.opener.postMessage("authorization:github:success:" + message, "*");
      }
      
      setTimeout(function() {
        window.close();
      }, 1000);
    })();
  </script>
  <p>Authorization successful. Closing window...</p>
</body>
</html>`;
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    },
  });
}
