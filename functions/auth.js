export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `${url.origin}/callback`;
  const scope = 'repo';
  
  // 生成随机 state 防止 CSRF
  const state = crypto.randomUUID();
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  
  // 把 state 存到 cookie
  const headers = new Headers();
  headers.append('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  
  return Response.redirect(authUrl, 302);
}
