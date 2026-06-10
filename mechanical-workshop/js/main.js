const articlesData = [
    {
        id: 7,
        title: "Advanced Robotics in Industrial Automation",
        link: "articles/industrial-robotics.html",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
        description: "Explores the latest advancements in industrial robotics technology, including collaborative robots, AI-powered automation, and smart factory integration strategies for improved productivity.",
        category: "General Machinery",
        date: "2026-06-10",
        author: "John Chen"
    },
    {
        id: 8,
        title: "Centrifugal Pump Selection and Installation Essentials",
        link: "articles/centrifugal-pump-selection.html",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
        description: "Introduces centrifugal pump selection methods, including flow rate and head calculation, material selection, and installation considerations.",
        category: "General Machinery",
        date: "2026-06-05",
        author: "Mike Wang"
    },
    {
        id: 9,
        title: "Screw Compressor Daily Maintenance",
        link: "articles/screw-compressor-maintenance.html",
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
        description: "Details the maintenance cycle, lubricating oil replacement, filter replacement and other maintenance essentials for screw compressors.",
        category: "General Machinery",
        date: "2026-06-05",
        author: "Emily Zhang"
    },
    {
        id: 10,
        title: "Industrial Fan Selection and Application Scenarios",
        link: "articles/industrial-fan-selection.html",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
        description: "Analyzes the characteristics of different types of industrial fans and their application choices in different industries.",
        category: "General Machinery",
        date: "2026-06-05",
        author: "David Li"
    },
    {
        id: 1,
        title: "CNC Machine Tool Daily Maintenance Guide",
        link: "articles/cnc-maintenance-guide.html",
        image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
        description: "This article details the daily maintenance essentials for CNC machine tools, including spindle maintenance, lubrication system care, cooling system inspection and other key aspects to help extend equipment lifespan.",
        category: "Machine Tools",
        date: "2026-06-05",
        author: "Sarah Liu"
    },
    {
        id: 2,
        title: "Common Fault Diagnosis and Troubleshooting for Hydraulic Excavators",
        link: "articles/hydraulic-excavator-fault.html",
        image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600",
        description: "Analyzes common fault phenomena of hydraulic excavators, including diagnosis methods and solutions for walking weakness, reduced digging efficiency, hydraulic system noise and other issues.",
        category: "Construction Machinery",
        date: "2026-06-06",
        author: "Tom Huang"
    },
    {
        id: 3,
        title: "Design Essentials for Industrial Workshop Ventilation Systems",
        link: "articles/industrial-ventilation-design.html",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
        description: "Discusses the design principles of industrial ventilation systems, including key technologies such as air volume calculation, duct layout, and fan selection to ensure workshop air quality standards.",
        category: "Cleaning & Ventilation",
        date: "2026-06-07",
        author: "Lisa Chen"
    },
    {
        id: 4,
        title: "ASRS and Conveyor Selection Guide",
        link: "articles/asrs-conveyor-selection.html",
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600",
        description: "Introduces the composition structure of automated storage and retrieval systems, shelf type selection, conveyor system configuration and other contents to help enterprises achieve warehouse automation upgrade.",
        category: "Logistics Equipment",
        date: "2026-06-08",
        author: "James Wu"
    },
    {
        id: 5,
        title: "Hygienic Design Specifications for Food Packaging Machinery",
        link: "articles/food-packaging-hygiene.html",
        image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600",
        description: "Explains the hygienic design requirements for food packaging machinery, including material selection, structural design, cleaning methods and other aspects to ensure compliance with food production safety standards.",
        category: "Food Machinery",
        date: "2026-06-09",
        author: "Emma Yang"
    },
    {
        id: 6,
        title: "Industrial 3D Printing Technology Applications and Development Trends",
        link: "articles/3d-printing-industrial.html",
        image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600",
        description: "Analyzes the application scenarios of industrial 3D printing technology in manufacturing, including technical characteristics of metal printing, plastic printing and future development trends.",
        category: "Other Equipment",
        date: "2026-06-10",
        author: "Chris Zhao"
    }
];

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

document.addEventListener('DOMContentLoaded', function() {
    checkCookieConsent();
    loadCookiePreferences();
    
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