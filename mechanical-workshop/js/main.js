// Article loading system
const ARTICLES_JSON_URL = 'articles.json';
const ARTICLES_PATH = 'mechanical-workshop/articles/';

async function loadArticles() {
  const container = document.getElementById('articlesList');
  if (!container) return;

  let articles = [];

  // Try to load pre-generated JSON first
  try {
    const res = await fetch(ARTICLES_JSON_URL + '?t=' + Date.now());
    if (res.ok) {
      articles = await res.json();
    }
  } catch(e) {
    console.log('JSON not available, will try fallback');
  }

  // If no articles from JSON, show message
  if (!articles || articles.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No articles found. New articles may take a few minutes to appear after publishing.</p>';
    return;
  }

  // Sort by date descending
  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Render articles
  container.innerHTML = articles.map(article => `
    <div class="article-card" onclick="location.href='${article.url || article.path || '#'}'">
      <div class="article-image">
        ${article.cover ? `<img src="${article.cover}" alt="${article.title}" loading="lazy">` : '<div class="no-image">📄</div>'}
      </div>
      <div class="article-info">
        <span class="article-category">${article.category || 'Uncategorized'}</span>
        <h3>${article.title || 'Untitled'}</h3>
        <p class="article-excerpt">${article.excerpt || ''}</p>
        <div class="article-meta">
          <span>${article.author || 'Anonymous'}</span>
          <span>${article.date || ''}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Load articles when DOM is ready
document.addEventListener('DOMContentLoaded', loadArticles);

// Mobile menu toggle
function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.toggle('active');
}

// Cookie popup
function toggleCookiePopup() {
  const popup = document.getElementById('cookiePopup');
  if (popup) popup.classList.toggle('hidden');
}

function acceptAllCookies() {
  localStorage.setItem('cookieConsent', 'all');
  toggleCookiePopup();
}

function rejectNonNecessaryCookies() {
  localStorage.setItem('cookieConsent', 'necessary');
  toggleCookiePopup();
}

function showCookieSettings() {
  const settings = document.getElementById('cookieSettings');
  if (settings) settings.style.display = 'block';
}

// Check cookie consent on load
document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('cookieConsent')) {
    const popup = document.getElementById('cookiePopup');
    if (popup) popup.classList.remove('hidden');
  }
});
