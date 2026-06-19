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
function renderHeader() {
    return `
    <header>
        <span lang="de">Meine Umschulung zum Fachinformatiker für Anwendungsentwicklung</span>
        <span lang="en">My Retraining as an IT Specialist in Application Development</span>
    </header>`;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function renderNav(currentPage) {
    // Determine active navigation group
    const ausbildungPages = ['ausbildungsablauf.html', 'berufsfoerderungswerk.html', 'kostentraeger.html', 'praktikumsbetrieb.html'];
    const weiteresPages = ['quiz.html', 'snake.html', 'games.html', 'memory.html', 'flashcards.html'];

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
                <li class="nav-item${active(ausbildungPages)}">
                    <a href="#" class="nav-link"><i class="fa fa-university" aria-hidden="true"></i> <span lang="de">Ausbildung</span><span lang="en">Education</span> <i class="fa fa-caret-down" aria-hidden="true"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="ausbildungsablauf.html" class="dropdown-link" lang="de">Ablauf Ausbildung</a></li>
                        <li><a href="ausbildungsablauf.html" class="dropdown-link" lang="en">Training Process</a></li>
                        <li><a href="berufsfoerderungswerk.html" class="dropdown-link" lang="de">Berufsförderungswerk Dortmund</a></li>
                        <li><a href="berufsfoerderungswerk.html" class="dropdown-link" lang="en">BFW Dortmund Center</a></li>
                        <li class="dropdown-item">
                            <a href="kostentraeger.html" class="dropdown-link"><span lang="de">Kostenträger</span><span lang="en">Sponsors</span> <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                            <ul class="sub-dropdown-menu">
                                <li><a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Berufliche-Reha/berufliche-reha.html" target="_blank" rel="noopener" class="dropdown-link" lang="de">Rentenversicherung</a></li>
                                <li><a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Berufliche-Reha/berufliche-reha.html" target="_blank" rel="noopener" class="dropdown-link" lang="en">Pension Insurance</a></li>
                                <li><a href="https://www.bgbau.de/themen/versicherungsschutz-und-leistungen/berufliche-und-soziale-rehabilitation" target="_blank" rel="noopener" class="dropdown-link" lang="de">Berufsgenossenschaften</a></li>
                                <li><a href="https://www.bgbau.de/themen/versicherungsschutz-und-leistungen/berufliche-und-soziale-rehabilitation" target="_blank" rel="noopener" class="dropdown-link" lang="en">Trade Associations</a></li>
                                <li><a href="https://www.arbeitsagentur.de/menschen-mit-behinderungen/berufliche-rehabilitation" target="_blank" rel="noopener" class="dropdown-link" lang="de">Agentur für Arbeit</a></li>
                                <li><a href="https://www.arbeitsagentur.de/menschen-mit-behinderungen/berufliche-rehabilitation" target="_blank" rel="noopener" class="dropdown-link" lang="en">Employment Agency</a></li>
                            </ul>
                        </li>
                        <li><a href="praktikumsbetrieb.html" class="dropdown-link" lang="de">Praktikumsbetrieb</a></li>
                        <li><a href="praktikumsbetrieb.html" class="dropdown-link" lang="en">Internship Company</a></li>
                    </ul>
                </li>
                <li class="nav-item${active('portfolio.html')}">
                    <a href="portfolio.html" class="nav-link"><i class="fa fa-code" aria-hidden="true"></i> <span lang="de">Projekte</span><span lang="en">Projects</span></a>
                </li>
                <li class="nav-item${active(['impressum.html', 'datenschutz.html'])}">
                    <a href="impressum.html" class="nav-link"><i class="fa fa-phone" aria-hidden="true"></i> <span lang="de">Impressum</span><span lang="en">Contact</span></a>
                </li>
                <li class="nav-item${active('news.html')}">
                    <a href="news.html" class="nav-link"><i class="fa fa-newspaper-o" aria-hidden="true"></i> News</a>
                </li>
                <li class="nav-item${active('links.html')}">
                    <a href="links.html" class="nav-link"><i class="fa fa-external-link" aria-hidden="true"></i> Links</a>
                </li>
                <li class="nav-item${active(weiteresPages)}">
                    <a href="#" class="nav-link"><span lang="de">Weiteres</span><span lang="en">More</span> <i class="fa fa-caret-down" aria-hidden="true"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="flashcards.html" class="dropdown-link" lang="de">IHK Lernkarten</a></li>
                        <li><a href="flashcards.html" class="dropdown-link" lang="en">IHK Flashcards</a></li>
                        <li><a href="quiz.html" class="dropdown-link" lang="de">Test Quiz</a></li>
                        <li><a href="quiz.html" class="dropdown-link" lang="en">Quiz Test</a></li>
                        <li class="dropdown-item">
                            <a href="games.html" class="dropdown-link">Games <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                            <ul class="sub-dropdown-menu">
                                <li><a href="snake.html" class="dropdown-link">Snake JS</a></li>
                                <li><a href="memory.html" class="dropdown-link">Memory JS</a></li>
                                <li><a href="quiz.html" class="dropdown-link">Quiz JS</a></li>
                            </ul>
                        </li>
                        <li><a href="index.html" class="dropdown-link" lang="de">Startseite</a></li>
                        <li><a href="index.html" class="dropdown-link" lang="en">Welcome Page</a></li>
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
                <button id="audio-mute-toggle" class="theme-toggle mute-toggle-btn" aria-label="Ton umschalten"></button>
                <button id="theme-toggle" class="theme-toggle" aria-label="Design umschalten">
                    <i class="fa fa-moon-o" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    </nav>`;
}

/* ============================================================
   FOOTER
   ============================================================ */
function renderFooter() {
    return `
    <footer>
        <p>&copy; 2026 Maximilian Schenk &middot; Rüdesheimer Str. 14 &middot; 53175 Bonn &middot; Germany &middot;
            <a href="datenschutz.html" style="color: var(--text-secondary); text-decoration: underline;">
                <span lang="de">Datenschutz</span><span lang="en">Privacy</span>
            </a>
        </p>
        <div class="icons">
            <a href="https://github.com/" target="_blank" rel="noopener" aria-label="GitHub"><i class="fa fa-github" aria-hidden="true"></i></a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa fa-linkedin" aria-hidden="true"></i></a>
            <a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa fa-instagram" aria-hidden="true"></i></a>
            <a href="mailto:info@Max-Schenk.de" aria-label="E-Mail"><i class="fa fa-envelope" aria-hidden="true"></i></a>
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

    // Header (not on index.html which has its own header)
    const headerEl = document.getElementById('site-header');
    if (headerEl) headerEl.outerHTML = renderHeader();

    // Navigation (not on index.html)
    const navEl = document.getElementById('site-nav');
    if (navEl) navEl.outerHTML = renderNav(currentPage);

    // Hide search bar on pages where search is not needed
    const searchablePages = ['news.html', 'portfolio.html', 'home.html'];
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
});
