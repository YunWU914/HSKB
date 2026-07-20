let articlesData = [];

async function loadArticlesData() {
    try {
        const basePath = getBasePath();
        const response = await fetch(basePath + 'articles/articles.json?' + Date.now());
        if (response.ok) {
            const data = await response.json();
            articlesData = data.map(article => ({
                ...article,
                url: article.link
            }));
        } else {
            console.error('Failed to load articles.json');
        }
    } catch (error) {
        console.error('Error loading articles.json:', error);
    }
}

function getBasePath() {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes('/categories/')) {
        return '../';
    } else if (pathname.includes('/articles/')) {
        return '../';
    } else if (pathname.includes('/admin/')) {
        return '../';
    }
    return '';
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

function generateCookiePopupHTML() {
    const basePath = getBasePath();
    return `
        <div class="cookie-popup" id="cookiePopup">
            <div class="cookie-content">
                <div class="cookie-header">
                    <h3>Cookie Consent</h3>
                    <button class="cookie-close" onclick="dismissCookiePopup()">×</button>
                </div>
                <p>We use cookies to improve your experience, analyze site traffic, and serve personalized ads. Please choose your preferences below. For more details, see our <a href="${basePath}cookie-policy.html" class="cookie-link">Cookie Policy</a> and <a href="${basePath}privacy-policy.html" class="cookie-link">Privacy Policy</a>.</p>
                
                <div class="cookie-settings" id="cookieSettings">
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="necessaryCookies" checked disabled>
                            <span>Strictly Necessary</span>
                        </label>
                        <p class="cookie-description">Essential for basic website functionality. Cannot be disabled.</p>
                    </div>
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="analyticsCookies">
                            <span>Analytics</span>
                        </label>
                        <p class="cookie-description">Help us understand how visitors interact with the site.</p>
                    </div>
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="marketingCookies">
                            <span>Marketing</span>
                        </label>
                        <p class="cookie-description">Deliver personalized ads based on your browsing history.</p>
                    </div>
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="functionalCookies">
                            <span>Functional</span>
                        </label>
                        <p class="cookie-description">Enhance functionality and personalization (e.g., remembering preferences).</p>
                    </div>
                </div>
                
                <div class="cookie-buttons" id="cookieButtons">
                    <button class="btn-cookie btn-cookie-reject" onclick="rejectAllCookies()">Reject</button>
                    <button class="btn-cookie btn-cookie-customize" onclick="toggleCookieSettings()">Customize</button>
                    <button class="btn-cookie btn-cookie-accept" onclick="acceptAllCookies()">Accept</button>
                </div>
                <div class="cookie-save-buttons" id="cookieSaveButtons" style="display: none;">
                    <button class="btn-cookie" onclick="toggleCookieSettings()">Cancel</button>
                    <button class="btn-cookie btn-cookie-primary" onclick="saveCustomPreferences()">Save Preferences</button>
                </div>
            </div>
        </div>
    `;
}

function dismissCookiePopup() {
    const popup = document.getElementById('cookiePopup');
    if (popup) {
        popup.classList.remove('show');
    }
    localStorage.setItem('cookieConsent', JSON.stringify({
        dismissed: true,
        consented: false,
        analytics: false,
        marketing: false,
        functional: false,
        timestamp: Date.now()
    }));
}

function toggleCookieSettings() {
    const settings = document.getElementById('cookieSettings');
    const cookieButtons = document.getElementById('cookieButtons');
    const cookieSaveButtons = document.getElementById('cookieSaveButtons');
    
    if (settings) {
        settings.classList.toggle('show');
    }
    
    if (cookieButtons && cookieSaveButtons) {
        if (settings && settings.classList.contains('show')) {
            cookieButtons.style.display = 'none';
            cookieSaveButtons.style.display = 'flex';
        } else {
            cookieButtons.style.display = 'flex';
            cookieSaveButtons.style.display = 'none';
        }
    }
}

function acceptAllCookies() {
    localStorage.setItem('cookieConsent', JSON.stringify({
        consented: true,
        dismissed: false,
        analytics: true,
        marketing: true,
        functional: true,
        timestamp: Date.now()
    }));
    const popup = document.getElementById('cookiePopup');
    if (popup) {
        popup.classList.remove('show');
    }
}

function rejectAllCookies() {
    localStorage.setItem('cookieConsent', JSON.stringify({
        consented: true,
        dismissed: false,
        analytics: false,
        marketing: false,
        functional: false,
        timestamp: Date.now()
    }));
    const popup = document.getElementById('cookiePopup');
    if (popup) {
        popup.classList.remove('show');
    }
}

function saveCustomPreferences() {
    const analyticsEl = document.getElementById('analyticsCookies');
    const analytics = analyticsEl ? analyticsEl.checked : false;
    const marketingEl = document.getElementById('marketingCookies');
    const marketing = marketingEl ? marketingEl.checked : false;
    const functionalEl = document.getElementById('functionalCookies');
    const functional = functionalEl ? functionalEl.checked : false;
    
    localStorage.setItem('cookieConsent', JSON.stringify({
        consented: true,
        dismissed: false,
        analytics: analytics,
        marketing: marketing,
        functional: functional,
        timestamp: Date.now()
    }));
    
    const popup = document.getElementById('cookiePopup');
    if (popup) {
        popup.classList.remove('show');
    }
}

function generateSubmitPopupHTML() {
    return `
        <div class="submit-popup" id="submitPopup">
            <div class="submit-overlay" onclick="closeSubmitPopup()"></div>
            <div class="submit-content">
                <div class="submit-header">
                    <h3>✍️ Write for Us</h3>
                    <button class="submit-close" onclick="closeSubmitPopup()">×</button>
                </div>
                <div class="submit-body">
                    <div class="submit-section">
                        <h4>📝 Author Information</h4>
                        <div class="submit-form">
                            <div class="form-group required">
                                <label>Real Name *</label>
                                <input type="text" id="submitName" placeholder="Your full name" maxlength="100">
                            </div>
                            <div class="form-group required">
                                <label>Email Address *</label>
                                <input type="email" id="submitEmail" placeholder="your@email.com" maxlength="150">
                            </div>
                            <div class="form-group required">
                                <label>Phone Number *</label>
                                <input type="tel" id="submitPhone" placeholder="+1-XXX-XXX-XXXX" maxlength="20">
                            </div>
                            <div class="form-group">
                                <label>Company/Organization</label>
                                <input type="text" id="submitCompany" placeholder="Optional" maxlength="100">
                            </div>
                            <div class="form-group">
                                <label>Position</label>
                                <input type="text" id="submitPosition" placeholder="Optional" maxlength="50">
                            </div>
                            <div class="form-group">
                                <label>LinkedIn / Personal Website</label>
                                <input type="url" id="submitLinkedin" placeholder="Optional" maxlength="200">
                            </div>
                        </div>
                    </div>

                    <div class="submit-section">
                        <h4>📄 Article Details</h4>
                        <div class="submit-form">
                            <div class="form-group required">
                                <label>Article Title *</label>
                                <input type="text" id="submitTitle" placeholder="Title of your article" maxlength="200">
                            </div>
                            <div class="form-group required">
                                <label>Article Content *</label>
                                <textarea id="submitContent" placeholder="Paste your article content here..." rows="5"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="submit-section">
                        <h4>📋 Submission Agreement</h4>
                        <div class="agreement-list">
                            <label class="agreement-item">
                                <input type="checkbox" id="agree1" required>
                                <span>I confirm that the submitted content is original and does not infringe on third-party trademarks or copyrights.</span>
                            </label>
                            <label class="agreement-item">
                                <input type="checkbox" id="agree2" required>
                                <span>I understand that if the content causes legal disputes, the platform has the right to disclose my registration information.</span>
                            </label>
                            <label class="agreement-item">
                                <input type="checkbox" id="agree3" required>
                                <span>I agree to bear legal responsibility for any false statements or infringement.</span>
                            </label>
                        </div>
                    </div>

                    <div class="submit-section">
                        <button class="guidelines-toggle" onclick="toggleGuidelines()">📌 Content Review Guidelines ▼</button>
                        <div class="guidelines-content" id="guidelinesContent">
                            <table class="review-table">
                                <thead>
                                    <tr>
                                        <th>Auto-Reject</th>
                                        <th>Requires Revision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Claims "official partnership/authorization" without proof</td>
                                        <td>Brand case → Add "not sponsored" disclaimer</td>
                                    </tr>
                                    <tr>
                                        <td>Uses brand logos as images</td>
                                        <td>Brand names in title → Change to generic description</td>
                                    </tr>
                                    <tr>
                                        <td>Denigrates competitors / False technical parameters</td>
                                        <td>Personal experience → Add "based on personal experience"</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p class="submit-note">
                        <strong>Note:</strong> Email and phone verification will be implemented when our registration system goes live. Submissions must include all required fields and agreement checkboxes to be considered.
                    </p>
                </div>
                <div class="submit-buttons">
                    <button class="btn btn-primary" onclick="submitArticle()">Submit Article</button>
                    <button class="btn btn-secondary" onclick="closeSubmitPopup()">Close</button>
                </div>
            </div>
        </div>
    `;
}

function showSubmitPopup() {
    let popup = document.getElementById('submitPopup');
    if (!popup) {
        document.body.insertAdjacentHTML('beforeend', generateSubmitPopupHTML());
        popup = document.getElementById('submitPopup');
    }
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSubmitPopup() {
    const popup = document.getElementById('submitPopup');
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function toggleGuidelines() {
    const content = document.getElementById('guidelinesContent');
    if (content) {
        content.classList.toggle('show');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[0-9\s\-]{7,20}$/;
    return re.test(phone);
}

function submitArticle() {
    const name = document.getElementById('submitName').value.trim();
    const email = document.getElementById('submitEmail').value.trim();
    const phone = document.getElementById('submitPhone').value.trim();
    const company = document.getElementById('submitCompany').value.trim();
    const position = document.getElementById('submitPosition').value.trim();
    const linkedin = document.getElementById('submitLinkedin').value.trim();
    const title = document.getElementById('submitTitle').value.trim();
    const content = document.getElementById('submitContent').value.trim();
    const agree1 = document.getElementById('agree1').checked;
    const agree2 = document.getElementById('agree2').checked;
    const agree3 = document.getElementById('agree3').checked;

    if (!name) {
        alert('Please enter your real name.');
        return;
    }
    if (!email || !validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    if (!phone || !validatePhone(phone)) {
        alert('Please enter a valid phone number.');
        return;
    }
    if (!title) {
        alert('Please enter the article title.');
        return;
    }
    if (!content) {
        alert('Please enter the article content.');
        return;
    }
    if (!agree1 || !agree2 || !agree3) {
        alert('Please agree to all submission agreements.');
        return;
    }

    const submitBtn = document.querySelector('.submit-buttons .btn-primary');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('company', company);
    formData.append('position', position);
    formData.append('linkedin', linkedin);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('agreements', 'All agreed');
    formData.append('_subject', `Article Submission: ${title}`);
    formData.append('_replyto', email);

    fetch('https://formsubmit.co/NB914Y@163.com', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.message) {
            showSuccessMessage();
        } else {
            alert('Submission failed. Please try again or send an email directly to NB914Y@163.com');
        }
    })
    .catch(error => {
        console.error('Submission error:', error);
        alert('Submission failed due to network error. Please send an email directly to NB914Y@163.com');
    })
    .finally(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    });
}

function showSuccessMessage() {
    closeSubmitPopup();
    const successPopup = document.createElement('div');
    successPopup.className = 'success-popup';
    successPopup.innerHTML = `
        <div class="success-overlay" onclick="closeSuccessPopup()"></div>
        <div class="success-content">
            <div class="success-icon">✅</div>
            <h3>Submission Received!</h3>
            <p>Thank you for your article submission. We will review it within 24-48 hours and contact you via email if needed.</p>
            <button class="btn btn-primary" onclick="closeSuccessPopup()">OK</button>
        </div>
    `;
    document.body.appendChild(successPopup);
    setTimeout(() => successPopup.classList.add('show'), 10);
}

function closeSuccessPopup() {
    const popup = document.querySelector('.success-popup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }
}

function checkCookieConsent() {
    const consentData = localStorage.getItem('cookieConsent');
    if (!consentData) return false;
    
    try {
        const data = JSON.parse(consentData);
        
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        if (Date.now() - data.timestamp > TWENTY_FOUR_HOURS) {
            localStorage.removeItem('cookieConsent');
            return false;
        }
        
        if (data.consented || data.dismissed) {
            return true;
        }
        
        return false;
    } catch {
        localStorage.removeItem('cookieConsent');
        return false;
    }
}

function initCookiePopup() {
    if (checkCookieConsent()) return;
    
    let popup = document.getElementById('cookiePopup');
    if (!popup) {
        document.body.insertAdjacentHTML('afterbegin', generateCookiePopupHTML());
        popup = document.getElementById('cookiePopup');
    }
    
    setTimeout(() => {
        if (popup) {
            popup.classList.add('show');
        }
    }, 500);
}

function showCookieSettings() {
    let popup = document.getElementById('cookiePopup');
    if (!popup) {
        document.body.insertAdjacentHTML('afterbegin', generateCookiePopupHTML());
        popup = document.getElementById('cookiePopup');
    }
    
    popup.classList.add('show');
    
    const consentData = localStorage.getItem('cookieConsent');
    if (consentData) {
        try {
            const data = JSON.parse(consentData);
            const analyticsEl = document.getElementById('analyticsCookies');
            if (analyticsEl) analyticsEl.checked = data.analytics || false;
            const marketingEl = document.getElementById('marketingCookies');
            if (marketingEl) marketingEl.checked = data.marketing || false;
            const functionalEl = document.getElementById('functionalCookies');
            if (functionalEl) functionalEl.checked = data.functional || false;
        } catch (e) {
            console.error('Failed to parse cookie consent data');
        }
    }
    
    toggleCookieSettings();
}

function renderArticles(articles, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (articles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No articles found in this category.</p>';
        return;
    }

    const basePath = getBasePath();

    container.innerHTML = articles.map(article => `
        <article class="article-card">
            <img src="${basePath}${article.image}" alt="${article.title}">
            <div class="article-card-content">
                <h3>${article.title}</h3>
                <div class="meta">
                    <span>${article.author}</span> | <span>${article.date}</span>
                </div>
                <p>${article.description}</p>
            </div>
        </article>
    `).join('');

    const cards = container.querySelectorAll('.article-card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = basePath + articles[index].url;
        });
    });
}

function renderLatestArticles() {
    const sortedArticles = [...articlesData].sort((a, b) => new Date(b.date) - new Date(a.date));
    renderArticles(sortedArticles, 'articlesList');
}

function renderCategoryArticles(categoryName) {
    const filteredArticles = articlesData.filter(article => article.category === categoryName);
    const sortedArticles = filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderArticles(sortedArticles, 'articlesList');
}

function renderRelatedArticles(currentCategory, excludeLink) {
    let relatedArticles = articlesData.filter(
        article => article.category === currentCategory && article.link !== excludeLink
    );
    
    relatedArticles = relatedArticles.sort(() => Math.random() - 0.5).slice(0, 3);
    
    const container = document.getElementById('relatedArticlesList');
    
    if (!container) return;
    
    if (relatedArticles.length === 0) {
        document.getElementById('relatedArticles').style.display = 'none';
        return;
    }

    const basePath = getBasePath();

    container.innerHTML = relatedArticles.map(article => `
        <article class="article-card">
            <img src="${basePath}${article.image}" alt="${article.title}">
            <div class="article-card-content">
                <h3>${article.title}</h3>
                <div class="meta">
                    <span>${article.author}</span> | <span>${article.date}</span>
                </div>
                <p>${article.description}</p>
            </div>
        </article>
    `).join('');

    const cards = container.querySelectorAll('.article-card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = basePath + relatedArticles[index].url;
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initCookiePopup();

    await loadArticlesData();

    const articlesList = document.getElementById('articlesList');
    if (articlesList) {
        const category = articlesList.dataset.category;
        if (category) {
            renderCategoryArticles(category);
        } else {
            renderLatestArticles();
        }
    }

    const relatedArticles = document.getElementById('relatedArticles');
    if (relatedArticles) {
        const metaCategory = document.querySelector('meta[name="category"]');
        const currentUrl = window.location.pathname;
        const articleLink = 'articles/' + currentUrl.split('/').pop();
        if (metaCategory) {
            renderRelatedArticles(metaCategory.content, articleLink);
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSubmitPopup();
        }
    });
});