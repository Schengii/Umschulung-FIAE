/**
 * Reusable Site Components — Header, Navigation, Footer
 * Single source of truth (DRY) for shared layout elements.
 * Auto-detects the current page and applies the active navigation state.
 */

const StorageManager = {
    isAvailable() {
        try {
            const key = '__storage_test__';
            localStorage.setItem(key, key);
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    },
    getItem(key, defaultValue = null) {
        if (this.isAvailable()) {
            const val = localStorage.getItem(key);
            return val !== null ? val : defaultValue;
        }
        return defaultValue;
    },
    setItem(key, value) {
        if (this.isAvailable()) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('StorageManager: Failed to write to localStorage:', e);
            }
        }
        return false;
    },
    removeItem(key) {
        if (this.isAvailable()) {
            localStorage.removeItem(key);
            return true;
        }
        return false;
    }
};

/* ============================================================
   HEADER
   ============================================================ */
function renderHeader(currentPage) {
    return `
    <header class="app-header">
        <div class="header-banner">
            <h1 class="header-title">
                <span lang="de">Meine Umschulung zum Fachinformatiker für Anwendungsentwicklung</span>
                <span lang="en">My Retraining as an IT Specialist in Application Development</span>
            </h1>
        </div>
        ${renderNav(currentPage)}
    </header>`;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function renderNav(currentPage) {
    // Determine active navigation group
    const ausbildungPages = ['ausbildungsablauf.html', 'berufsfoerderungswerk.html', 'kostentraeger.html', 'praktikumsbetrieb.html'];
    const weiteresPages = ['quiz.html', 'snake.html', 'games.html', 'memory.html', 'flashcards.html', 'interview-trainer.html', 'playground.html', 'architecture.html', 'dashboard.html'];

    const active = (pages) => {
        if (Array.isArray(pages)) return pages.includes(currentPage) ? ' active' : '';
        return currentPage === pages ? ' active' : '';
    };

    return `
    <nav class="topnav" aria-label="Hauptnavigation">
        <div class="nav-wrapper">
            <button class="menu-toggle" id="menu-toggle" aria-label="Menü öffnen/schließen" aria-expanded="false">
                <i class="fa fa-bars" aria-hidden="true"></i>
            </button>
            <ul class="nav-menu" id="nav-menu">
                <li class="nav-item${active('home.html')}">
                    <a href="home.html" class="nav-link"><i class="fa fa-home" aria-hidden="true"></i> Home</a>
                </li>
                <li class="nav-item${active('ueber-mich.html')}">
                    <a href="ueber-mich.html" class="nav-link"><i class="fa-solid fa-user" aria-hidden="true"></i> <span lang="de">Über mich</span><span lang="en">About Me</span></a>
                </li>
                <li class="nav-item${active(ausbildungPages)}">
                    <a href="#" class="nav-link"><i class="fa fa-university" aria-hidden="true"></i> <span lang="de">Ausbildung</span><span lang="en">Education</span> <i class="fa fa-caret-down" aria-hidden="true"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="ausbildungsablauf.html" class="dropdown-link"><span lang="de">Ablauf Ausbildung</span><span lang="en">Training Process</span></a></li>
                        <li><a href="berufsfoerderungswerk.html" class="dropdown-link"><span lang="de">Berufsförderungswerk Dortmund</span><span lang="en">BFW Dortmund Center</span></a></li>
                        <li class="dropdown-item">
                            <a href="kostentraeger.html" class="dropdown-link"><span lang="de">Kostenträger</span><span lang="en">Sponsors</span> <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                            <ul class="sub-dropdown-menu">
                                <li><a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Berufliche-Reha/berufliche-reha.html" target="_blank" rel="noopener" class="dropdown-link"><span lang="de">Rentenversicherung</span><span lang="en">Pension Insurance</span></a></li>
                                <li><a href="https://www.bgbau.de/themen/versicherungsschutz-und-leistungen/berufliche-und-soziale-rehabilitation" target="_blank" rel="noopener" class="dropdown-link"><span lang="de">Berufsgenossenschaften</span><span lang="en">Trade Associations</span></a></li>
                                <li><a href="https://www.arbeitsagentur.de/menschen-mit-behinderungen/berufliche-rehabilitation" target="_blank" rel="noopener" class="dropdown-link"><span lang="de">Agentur für Arbeit</span><span lang="en">Employment Agency</span></a></li>
                            </ul>
                        </li>
                        <li><a href="praktikumsbetrieb.html" class="dropdown-link"><span lang="de">Praktikumsbetrieb</span><span lang="en">Internship Company</span></a></li>
                    </ul>
                </li>
                <li class="nav-item${active('portfolio.html')}">
                    <a href="portfolio.html" class="nav-link"><i class="fa fa-code" aria-hidden="true"></i> <span lang="de">Projekte</span><span lang="en">Projects</span></a>
                </li>
                <li class="nav-item${active(['impressum.html', 'datenschutz.html'])}">
                    <a href="impressum.html" class="nav-link"><i class="fa fa-phone" aria-hidden="true"></i> <span lang="de">Impressum</span><span lang="en">Contact</span></a>
                </li>
                <li class="nav-item${active('news.html')}">
                    <a href="news.html" class="nav-link"><i class="fa-solid fa-newspaper" aria-hidden="true"></i> News</a>
                </li>
                <li class="nav-item${active('links.html')}">
                    <a href="links.html" class="nav-link"><i class="fa fa-external-link" aria-hidden="true"></i> Links</a>
                </li>
                <li class="nav-item${active(weiteresPages)}">
                    <a href="#" class="nav-link"><span lang="de">Weiteres</span><span lang="en">More</span> <i class="fa fa-caret-down" aria-hidden="true"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="interview-trainer.html" class="dropdown-link"><span lang="de">Bewerbungs-Trainer</span><span lang="en">Interview Trainer</span></a></li>
                        <li><a href="playground.html" class="dropdown-link"><span lang="de">Code Playground</span><span lang="en">Code Playground</span></a></li>
                        <li><a href="architecture.html" class="dropdown-link"><span lang="de">Architektur &amp; API</span><span lang="en">Architecture &amp; API</span></a></li>
                        <li><a href="flashcards.html" class="dropdown-link"><span lang="de">IHK Lernkarten</span><span lang="en">IHK Flashcards</span></a></li>
                        <li><a href="dashboard.html" class="dropdown-link"><span lang="de">Dashboard</span><span lang="en">Dashboard</span></a></li>
                        <li><a href="quiz.html" class="dropdown-link"><span lang="de">Test Quiz</span><span lang="en">Quiz Test</span></a></li>
                        <li class="dropdown-item">
                            <a href="games.html" class="dropdown-link">Games <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                            <ul class="sub-dropdown-menu">
                                <li><a href="snake.html" class="dropdown-link">Snake JS</a></li>
                                <li><a href="memory.html" class="dropdown-link">Memory JS</a></li>
                                <li><a href="quiz.html" class="dropdown-link">Quiz JS</a></li>
                            </ul>
                        </li>
                        <li><a href="index.html" class="dropdown-link"><span lang="de">Startseite</span><span lang="en">Welcome Page</span></a></li>
                    </ul>
                </li>
            </ul>

            <div class="nav-controls">
                <div class="search-container">
                    <label for="searchbar" class="sr-only">
                        <span lang="de">Karten filtern</span>
                        <span lang="en">Filter cards</span>
                    </label>
                    <i class="fa fa-search search-icon" aria-hidden="true"></i>
                    <input type="text" id="searchbar" class="search-input" placeholder="Suche..." aria-label="Karten filtern">
                </div>
                <button id="lang-toggle" class="theme-toggle" style="font-size: 0.85rem; min-width: 75px;" aria-label="Sprache umschalten"></button>
                <button id="theme-toggle" class="theme-toggle" aria-label="Design umschalten">
                    <i class="fa-solid fa-moon" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    </nav>`;
}

/* ============================================================
   FOOTER
   ============================================================ */
function renderFooter() {
    const year = new Date().getFullYear();
    return `
    <footer class="app-footer">
        <!-- SVG wave decoration at the top of the footer (Parallax gentle waves) -->
        <div class="footer-wave-container">
            <svg class="footer-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
                <defs>
                    <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                </defs>
                <g class="parallax-waves">
                    <use href="#gentle-wave" x="48" y="0" class="wave-layer-1" />
                    <use href="#gentle-wave" x="48" y="3" class="wave-layer-2" />
                    <use href="#gentle-wave" x="48" y="5" class="wave-layer-3" />
                    <use href="#gentle-wave" x="48" y="7" class="wave-layer-4" />
                </g>
            </svg>
        </div>
        
        <div class="footer-content">
            <div class="footer-grid">
                <!-- Column 1: Personal Brand -->
                <div class="footer-col col-brand">
                    <h3>Maximilian Schenk</h3>
                    <p lang="de" class="brand-desc">Umschulung zum Fachinformatiker für Anwendungsentwicklung. Erfolgreich abgeschlossen vor der IHK im Juni 2026.</p>
                    <p lang="en" class="brand-desc">Retraining as an IT Specialist in Application Development. Successfully completed before the IHK in June 2026.</p>
                    <div class="footer-socials">
                        <a href="https://github.com/Schengii" target="_blank" rel="noopener" aria-label="GitHub" class="social-icon"><i class="fa-brands fa-github" aria-hidden="true"></i></a>
                        <a href="https://linkedin.com/in/maximilian-schenk" target="_blank" rel="noopener" aria-label="LinkedIn" class="social-icon"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a>
                        <a href="https://instagram.com/schengii" target="_blank" rel="noopener" aria-label="Instagram" class="social-icon"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
                        <a href="https://wa.me/4917624921897" target="_blank" rel="noopener" aria-label="WhatsApp" class="social-icon"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
                        <a href="mailto:sche-max@web.de" aria-label="E-Mail" class="social-icon"><i class="fa-solid fa-envelope" aria-hidden="true"></i></a>
                    </div>
                </div>
                
                <!-- Column 2: Navigation Links -->
                <div class="footer-col col-links">
                    <h4 lang="de">Navigation</h4>
                    <h4 lang="en">Navigation</h4>
                    <ul class="footer-links-list">
                        <li><a href="home.html" class="footer-link">Home</a></li>
                        <li><a href="portfolio.html" class="footer-link"><span lang="de">Projekte</span><span lang="en">Projects</span></a></li>
                        <li><a href="news.html" class="footer-link">News</a></li>
                        <li><a href="impressum.html" class="footer-link"><span lang="de">Impressum &amp; Kontakt</span><span lang="en">Contact</span></a></li>
                        <li><a href="datenschutz.html" class="footer-link"><span lang="de">Datenschutz</span><span lang="en">Privacy</span></a></li>
                    </ul>
                </div>
                
                <!-- Column 3: Status Info Widget -->
                <div class="footer-col col-status">
                    <h4 lang="de">Status Umschulung</h4>
                    <h4 lang="en">Retraining Status</h4>
                    <div class="status-widget">
                        <div class="status-indicator">
                            <span class="status-dot pulsing"></span>
                            <span lang="de">Ausbildung abgeschlossen (IHK)</span>
                            <span lang="en">Graduated successfully (IHK)</span>
                        </div>
                        <p class="status-text">BFW Dortmund &amp; DFG Bonn</p>
                        <p class="status-meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Bonn / Dortmund, Germany</p>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p class="copyright">&copy; ${year} Maximilian Schenk &middot; Rüdesheimer Str. 14 &middot; 53175 Bonn &middot; Germany</p>
            </div>
        </div>
    </footer>`;
}

/* ============================================================
   BACK-TO-TOP BUTTON
   ============================================================ */
function renderBackToTop() {
    return `
    <button id="back-to-top" class="back-to-top" aria-label="Zum Seitenanfang scrollen" title="Nach oben">
        <i class="fa fa-chevron-up" aria-hidden="true"></i>
    </button>`;
}

/* ============================================================
   COOKIE CONSENT BANNER
   ============================================================ */
function renderCookieBanner() {
    return `
    <div id="cookie-banner" class="cookie-banner" role="dialog" aria-label="Cookie-Hinweis">
        <div class="cookie-content">
            <p>
                <span lang="de">Diese Website verwendet Local Storage für Theme- und Spracheinstellungen sowie externe Dienste (Google Maps, Font Awesome CDN). Mehr dazu in der <a href="datenschutz.html">Datenschutzerklärung</a>.</span>
                <span lang="en">This website uses Local Storage for theme and language settings, and external services (Google Maps, Font Awesome CDN). Learn more in the <a href="datenschutz.html">Privacy Policy</a>.</span>
            </p>
            <button id="cookie-accept" class="btn-primary" style="width: auto; padding: 0.5rem 1.5rem; font-size: 0.9rem;">
                <span lang="de">Verstanden</span>
                <span lang="en">Got it</span>
            </button>
        </div>
    </div>`;
}

/* ============================================================
   BREADCRUMB
   ============================================================ */
function renderBreadcrumb(items) {
    // items = [{ label_de, label_en, href }, ...]
    // Last item is current page (no link)
    let html = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>';
    items.forEach((item, i) => {
        const isLast = i === items.length - 1;
        if (isLast) {
            html += `<li aria-current="page"><span lang="de">${item.label_de}</span><span lang="en">${item.label_en}</span></li>`;
        } else {
            html += `<li><a href="${item.href}"><span lang="de">${item.label_de}</span><span lang="en">${item.label_en}</span></a></li>`;
        }
    });
    html += '</ol></nav>';
    return html;
}

/* ============================================================
   BREADCRUMB RENDERER (statt document.write)
   ============================================================ */
function initBreadcrumbs() {
    const container = document.getElementById('breadcrumb-container');
    if (!container) return;
    try {
        const items = JSON.parse(container.getAttribute('data-items'));
        container.innerHTML = renderBreadcrumb(items);
    } catch (e) {
        console.warn('Breadcrumb data-items parse error:', e);
    }
}

/* ============================================================
   AUTO-INJECT ON LOAD
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initBreadcrumbs();
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Header & Navigation Loader (not on index.html)
    const headerEl = document.getElementById('site-header');
    const navEl = document.getElementById('site-nav');

    if (headerEl) {
        headerEl.outerHTML = renderHeader(currentPage);
        if (navEl) navEl.remove();
    } else if (navEl) {
        navEl.outerHTML = renderNav(currentPage);
    }

    // Scroll-based Header Shrink Animation
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
        const toggleHeaderScroll = () => {
            if (window.scrollY > 20) {
                appHeader.classList.add('scrolled');
            } else {
                appHeader.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', toggleHeaderScroll, { passive: true });
        toggleHeaderScroll();
    }

    // Hide search bar on pages where search is not needed
    const searchablePages = ['news.html', 'home.html'];
    if (!searchablePages.includes(currentPage)) {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.style.display = 'none';
        }
    }

    // Footer
    const footerEl = document.getElementById('site-footer');
    if (footerEl) footerEl.outerHTML = renderFooter();

    // Back-to-top button
    if (!document.getElementById('back-to-top')) {
        document.body.insertAdjacentHTML('beforeend', renderBackToTop());
    }

    // Cookie banner (only if not already accepted)
    if (!StorageManager.getItem('cookieConsent') && !document.getElementById('cookie-banner')) {
        document.body.insertAdjacentHTML('beforeend', renderCookieBanner());
    }

    // Register Service Worker & Manifest link for PWA (only on http/https protocols)
    if (window.location.protocol.startsWith('http')) {
        if (!document.querySelector('link[rel="manifest"]')) {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = 'manifest.json';
            document.head.appendChild(link);
        }
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('PWA Service Worker registered:', reg.scope))
                .catch(err => console.warn('PWA Service Worker failed:', err));
        }
    }
});
