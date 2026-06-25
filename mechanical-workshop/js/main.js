let articlesData = [];

async function loadArticles() {
    try {
        const response = await fetch('articles/articles.json');
        articlesData = await response.json();
        return articlesData;
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesData = [];
        return articlesData;
    }
}

function renderArticles(category = null) {
    const articlesList = document.getElementById('articlesList');
    if (!articlesList) return;

    let filteredArticles = [...articlesData];
    
    if (category) {
        filteredArticles = filteredArticles.filter(article => article.category === category);
    }
    
    const sortedArticles = filteredArticles.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    }).slice(0, category ? undefined : 6);

    articlesList.innerHTML = sortedArticles.map(article => `
        <article class="article-card">
            <img src="${article.image}" alt="${article.title}">
            <div class="article-content">
                <h3><a href="${article.link}">${article.title}</a></h3>
                <p>${article.description}</p>
                <div class="article-meta">
                    <span>${article.category}</span>
                    <span>${article.date}</span>
                    <span>By ${article.author}</span>
                </div>
            </div>
        </article>
    `).join('');
}

function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    const cookiePopup = document.getElementById('cookiePopup');
    if (consent && cookiePopup) {
        cookiePopup.classList.add('hide');
    }
}

function loadCookiePreferences() {
    const analytics = localStorage.getItem('analyticsCookies') === 'true';
    const advertising = localStorage.getItem('advertisingCookies') === 'true';
    
    const analyticsCheckbox = document.getElementById('analyticsCookies');
    const advertisingCheckbox = document.getElementById('advertisingCookies');
    
    if (analyticsCheckbox) analyticsCheckbox.checked = analytics;
    if (advertisingCheckbox) advertisingCheckbox.checked = advertising;
}

function saveCookiePreferences() {
    const analyticsCheckbox = document.getElementById('analyticsCookies');
    const advertisingCheckbox = document.getElementById('advertisingCookies');
    
    if (analyticsCheckbox) localStorage.setItem('analyticsCookies', analyticsCheckbox.checked);
    if (advertisingCheckbox) localStorage.setItem('advertisingCookies', advertisingCheckbox.checked);
}

function acceptAllCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('analyticsCookies', 'true');
    localStorage.setItem('advertisingCookies', 'true');
    
    const analyticsCheckbox = document.getElementById('analyticsCookies');
    const advertisingCheckbox = document.getElementById('advertisingCookies');
    
    if (analyticsCheckbox) analyticsCheckbox.checked = true;
    if (advertisingCheckbox) advertisingCheckbox.checked = true;
    
    const cookiePopup = document.getElementById('cookiePopup');
    if (cookiePopup) {
        cookiePopup.classList.add('hide');
    }
}

function rejectNonNecessaryCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('analyticsCookies', 'false');
    localStorage.setItem('advertisingCookies', 'false');
    
    const analyticsCheckbox = document.getElementById('analyticsCookies');
    const advertisingCheckbox = document.getElementById('advertisingCookies');
    
    if (analyticsCheckbox) analyticsCheckbox.checked = false;
    if (advertisingCheckbox) advertisingCheckbox.checked = false;
    
    const cookiePopup = document.getElementById('cookiePopup');
    if (cookiePopup) {
        cookiePopup.classList.add('hide');
    }
}

function showCookieSettings() {
    const cookieSettings = document.getElementById('cookieSettings');
    if (cookieSettings) {
        cookieSettings.classList.toggle('show');
    }
}

function renderRelatedArticles(currentArticleId) {
    const relatedArticlesList = document.getElementById('relatedArticlesList');
    if (!relatedArticlesList) return;

    const otherArticles = articlesData.filter(article => article.id !== currentArticleId);
    
    const shuffled = otherArticles.sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 3);

    relatedArticlesList.innerHTML = recommended.map(article => `
        <article class="related-article">
            <img src="${article.image}" alt="${article.title}">
            <div class="related-article-content">
                <h3><a href="../${article.link}">${article.title}</a></h3>
                <p>${article.description.slice(0, 100)}...</p>
                <span class="category-tag">${article.category}</span>
            </div>
        </article>
    `).join('');
}

function toggleCookiePopup() {
    const cookiePopup = document.getElementById('cookiePopup');
    if (cookiePopup) {
        cookiePopup.classList.add('hide');
    }
}

function saveCustomCookies() {
    saveCookiePreferences();
    localStorage.setItem('cookieConsent', 'custom');
    
    const cookiePopup = document.getElementById('cookiePopup');
    if (cookiePopup) {
        cookiePopup.classList.add('hide');
    }
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger-menu');
    if (navLinks && hamburger) {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    checkCookieConsent();
    loadCookiePreferences();
    
    await loadArticles();
    
    const body = document.body;
    if (body.classList.contains('category-page')) {
        const categoryName = body.getAttribute('data-category');
        renderArticles(categoryName);
    } else {
        renderArticles();
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    setTimeout(() => {
        const articleCards = document.querySelectorAll('.article-card');
        
        articleCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }, 100);

    const breadcrumbLinks = document.querySelectorAll('.breadcrumb a');
    
    breadcrumbLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                window.location.href = href;
            }
        });
    });

    function smoothScroll(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const buttons = document.querySelectorAll('.btn:not(.cookie-buttons .btn)');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                smoothScroll(href);
            } else {
                window.location.href = href;
            }
        });
    });

    const cookieCategoryLabels = document.querySelectorAll('.cookie-category-label input');
    cookieCategoryLabels.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (!this.disabled) {
                saveCookiePreferences();
            }
        });
    });

    if (document.body.classList.contains('article-page')) {
        const articleId = parseInt(document.body.getAttribute('data-article-id'));
        if (!isNaN(articleId)) {
            renderRelatedArticles(articleId);
        }
    }
});