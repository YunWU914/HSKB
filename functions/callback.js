export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  // 验证 state
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
  
  // 返回给 Decap CMS 的回调页面
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Success</title>
</head>
<body>
  <script>
    (function() {
      const token = "${tokenData.access_token}";
      const provider = "github";
      
      // 发送消息给父窗口
      if (window.opener) {
        window.opener.postMessage(
          'authorization:github:success:{"token":"' + token + '","provider":"' + provider + '"}',
          '*'
        );
      }
      
      // 关闭窗口
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
