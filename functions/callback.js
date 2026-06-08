export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code', { status: 400 });
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
  const token = tokenData.access_token;
  
  const html = `<!DOCTYPE html>
<html>
<body>
  <script>
    (function() {
      function receiveMessage(e) {
        if (!e.data || e.data.slice(0, 18) !== "authorizing:github") return;
        window.opener.postMessage(
          "authorization:github:success:" + JSON.stringify({
            token: "${token}",
            provider: "github"
          }),
          e.origin
        );
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script>
</body>
</html>`;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
