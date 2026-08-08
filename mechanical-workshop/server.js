const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function loadShortLinks() {
  try {
    const data = fs.readFileSync(path.join(ROOT, 'data', 'short_links.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function loadArticlesData() {
  try {
    const data = fs.readFileSync(path.join(ROOT, 'articles', 'articles.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function generateRelatedArticles(currentArticlePath) {
  const articles = loadArticlesData();
  const shortLinks = loadShortLinks();
  
  const current = articles.find(a => a.link === currentArticlePath);
  const currentCategory = current ? current.category : '';
  
  let related = articles.filter(a => a.link !== currentArticlePath);
  
  if (currentCategory) {
    const sameCategory = related.filter(a => a.category === currentCategory);
    const otherCategory = related.filter(a => a.category !== currentCategory);
    related = [...sameCategory, ...otherCategory];
  }
  
  related = related.slice(0, 3);
  
  if (related.length === 0) return '';
  
  const cards = related.map(a => {
    const shortCode = shortLinks[a.link];
    const url = shortCode ? '/s/' + shortCode : '/' + a.link;
    // 清理图片路径：移除 '../' 前缀，确保路径正确
    let cleanImage = a.image || '';
    while (cleanImage.startsWith('../')) {
      cleanImage = cleanImage.substring(3);
    }
    cleanImage = cleanImage.replace(/^\//, '');
    const imageSrc = cleanImage && cleanImage.startsWith('http') ? cleanImage : '/' + (cleanImage || 'images/categories/general-machinery.webp');
    return `
      <a href="${url}" class="related-card" onclick="event.preventDefault(); window.location.href='${url}'">
        <img src="${imageSrc}" alt="${a.title}" loading="lazy">
        <div class="related-info">
          <h4>${a.title}</h4>
          <span class="related-meta">${a.category} | ${a.readTime || '4 min read'}</span>
        </div>
      </a>`;
  }).join('');
  
  return `
    <section class="related-articles-section">
      <h2>Related Articles</h2>
      <div class="related-cards">${cards}</div>
    </section>`;
}

function generateArticleViewer(articlePath, shortCode) {
  const articleFullPath = path.join(ROOT, articlePath);
  let articleContent = '';
  let articleTitle = 'Article';
  let articleDescription = '';
  let articleImage = '';
  
  try {
    const html = fs.readFileSync(articleFullPath, 'utf-8');
    
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) articleTitle = titleMatch[1];
    
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/) || 
                      html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
    if (descMatch) articleDescription = descMatch[1];
    
    const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
    if (imgMatch) articleImage = imgMatch[1];
    
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
    if (bodyMatch) {
      let body = bodyMatch[1];
      body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
      body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
      body = body.replace(/<header[^>]*>[\s\S]*?<\/header>/g, '');
      body = body.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, '');
      body = body.replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, '');
      body = body.replace(/<div[^>]*class="breadcrumb"[^>]*>[\s\S]*?<\/div>/g, '');
      body = body.replace(/<div[^>]*class="related-articles"[^>]*>[\s\S]*?<\/div>/g, '');
      body = body.replace(/src="\.\.\//g, 'src="/');
      body = body.replace(/href="\.\.\//g, 'href="/');
      articleContent = body;
    }
  } catch (e) {
    articleContent = '<p>Article not found.</p>';
  }
  
  const relatedHtml = generateRelatedArticles(articlePath);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${articleTitle}</title>
  <meta name="description" content="${articleDescription}">
  ${articleImage ? '<meta property="og:image" content="' + articleImage + '">' : ''}
  <link rel="canonical" href="/s/${shortCode}">
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .article-viewer { max-width: 900px; margin: 0 auto; padding: 20px; }
    .article-viewer .nav-header { background: #2c3e50; color: white; padding: 15px 20px; margin: -20px -20px 30px; display: flex; justify-content: space-between; align-items: center; }
    .article-viewer .nav-header a { color: white; text-decoration: none; }
    .article-viewer .nav-header .logo { font-size: 1.3em; font-weight: bold; }
    .article-viewer .article-body { line-height: 1.8; }
    .article-viewer .article-body h1 { font-size: 2em; margin-bottom: 20px; }
    .article-viewer .article-body h2 { font-size: 1.5em; margin: 30px 0 15px; }
    .article-viewer .article-body h3 { font-size: 1.2em; margin: 25px 0 12px; }
    .article-viewer .article-body p { margin-bottom: 15px; }
    .article-viewer .article-body img { max-width: 100%; height: auto; margin: 15px 0; border-radius: 8px; }
    .article-viewer .article-body table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .article-viewer .article-body table td, .article-viewer .article-body table th { border: 1px solid #ddd; padding: 10px; }
    .article-viewer .article-body ul, .article-viewer .article-body ol { margin: 15px 0; padding-left: 25px; }
    .article-viewer .article-body li { margin-bottom: 8px; }
    .article-viewer .article-body a { color: #3498db; }
    .article-viewer .article-body .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    .article-viewer .related-articles-section { margin-top: 40px; padding-top: 30px; border-top: 2px solid #eee; }
    .article-viewer .related-articles-section h2 { font-size: 1.4em; margin-bottom: 20px; color: #2c3e50; }
    .article-viewer .related-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .article-viewer .related-card { display: flex; flex-direction: column; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; }
    .article-viewer .related-card:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.12); }
    .article-viewer .related-card img { width: 100%; height: 160px; object-fit: cover; margin: 0; border-radius: 0; }
    .article-viewer .related-info { padding: 15px; flex: 1; display: flex; flex-direction: column; }
    .article-viewer .related-info h4 { font-size: 0.95em; margin: 0 0 8px; line-height: 1.4; color: #2c3e50; }
    .article-viewer .related-meta { font-size: 0.8em; color: #888; }
  </style>
</head>
<body>
  <div class="article-viewer">
    <div class="nav-header">
      <a href="/" class="logo">forum.tbvoh.com</a>
      <a href="/">Home</a>
    </div>
    <article class="article-body">
      ${articleContent}
    </article>
    ${relatedHtml}
  </div>
  <script>
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && link.href && link.href.includes('/s/')) {
        e.preventDefault();
        window.location.href = link.href;
      }
    });
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  urlPath = decodeURIComponent(urlPath);

  const shortLinkMatch = urlPath.match(/^\/s\/([a-zA-Z0-9]+)$/);
  if (shortLinkMatch) {
    const shortCode = shortLinkMatch[1];
    const shortLinks = loadShortLinks();
    const entries = Object.entries(shortLinks);
    const found = entries.find(([, hash]) => hash === shortCode);
    if (found) {
      const articlePath = found[0];
      const html = generateArticleViewer(articlePath, shortCode);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(html);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
  }

  // 将 URL 路径转换为文件系统路径
  let filePath;
  if (urlPath === '/' || urlPath === '') {
    filePath = path.join(ROOT, 'index.html');
  } else {
    filePath = path.join(ROOT, urlPath);
  }
  
  // 防止路径遍历攻击
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // 为不同类型的文件设置缓存策略
  const noCachePaths = ['articles.json', 'gsc_hot.json', 'short_links.json', 'main.js'];
  const isNoCacheFile = noCachePaths.some(p => filePath.endsWith(p));
  
  let cacheControl;
  if (isNoCacheFile) {
    // 数据文件和主JS：不缓存，确保实时更新
    cacheControl = 'no-cache, no-store, must-revalidate';
  } else if (ext === '.html') {
    // HTML 文件：短缓存
    cacheControl = 'public, max-age=300'; // 5分钟
  } else if (ext === '.css' || ext === '.js') {
    // 其他CSS/JS：长缓存
    cacheControl = 'public, max-age=31536000'; // 1年
  } else if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
    // 图片：中等缓存
    cacheControl = 'public, max-age=86400'; // 1天
  } else {
    cacheControl = 'public, max-age=3600';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`404 Not Found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': cacheControl
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Root directory: ${ROOT}`);
});
