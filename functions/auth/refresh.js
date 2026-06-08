export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const refreshToken = body.refresh_token;
  
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  const tokenData = await tokenRes.json();
  
  return new Response(JSON.stringify({
    token: tokenData.access_token,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
