export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `${url.origin}/callback`;
  const scope = 'repo';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  
  return Response.redirect(authUrl, 302);
}
