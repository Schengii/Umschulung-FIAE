/**
 * Translation Module — DE/EN Language Switcher
 */
function initTranslation() {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;
    
    const storedLang = StorageManager.getItem(STORAGE_KEYS.LANG, APP.DEFAULT_LANG);
    document.documentElement.setAttribute('lang', storedLang);
    updateLangToggleButton(storedLang);
    updateDynamicElementsTranslation(storedLang);
    
    langToggle.addEventListener('click', () => {
        const currentLang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
        const newLang = currentLang === 'de' ? 'en' : 'de';
        
        document.documentElement.setAttribute('lang', newLang);
        StorageManager.setItem(STORAGE_KEYS.LANG, newLang);
        updateLangToggleButton(newLang);
        updateDynamicElementsTranslation(newLang);
        
        document.dispatchEvent(new CustomEvent('langchange', { detail: newLang }));
    });
}

function updateLangToggleButton(lang) {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;
    
    if (lang === 'de') {
        langToggle.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i> DE | <strong>EN</strong>';
        langToggle.setAttribute('aria-label', 'Switch to English');
    } else {
        langToggle.innerHTML = '<i class="fa fa-globe" aria-hidden="true"></i> <strong>DE</strong> | EN';
        langToggle.setAttribute('aria-label', 'Auf Deutsch umstellen');
    }
}

function updateDynamicElementsTranslation(lang) {
    // 1. Search bars placeholder and aria-label
    const searchBar = document.getElementById('searchbar');
    if (searchBar) {
        if (lang === 'de') {
            searchBar.placeholder = 'Suche...';
            searchBar.setAttribute('aria-label', 'Karten filtern');
        } else {
            searchBar.placeholder = 'Search...';
            searchBar.setAttribute('aria-label', 'Filter cards');
        }
    }

    const portfolioSearch = document.getElementById('portfolio-searchbar');
    if (portfolioSearch) {
        if (lang === 'de') {
            portfolioSearch.placeholder = 'Projekte durchsuchen...';
            portfolioSearch.setAttribute('aria-label', 'Projekte filtern');
        } else {
            portfolioSearch.placeholder = 'Search projects...';
            portfolioSearch.setAttribute('aria-label', 'Filter projects');
        }
    }

    // 2. Theme toggle button aria-label
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        if (lang === 'de') {
            themeToggle.setAttribute('aria-label', 'Design umschalten');
        } else {
            themeToggle.setAttribute('aria-label', 'Toggle theme');
        }
    }

    // 3. Audio toggle button aria-label
    const audioToggle = document.getElementById('audio-mute-toggle');
    if (audioToggle) {
        if (lang === 'de') {
            audioToggle.setAttribute('aria-label', 'Ton umschalten');
        } else {
            audioToggle.setAttribute('aria-label', 'Toggle mute');
        }
    }
}

