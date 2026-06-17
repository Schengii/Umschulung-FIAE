/**
 * Translation Module — DE/EN Language Switcher
 */
function initTranslation() {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;
    
    const storedLang = StorageManager.getItem(STORAGE_KEYS.LANG, APP.DEFAULT_LANG);
    document.documentElement.setAttribute('lang', storedLang);
    updateLangToggleButton(storedLang);
    
    langToggle.addEventListener('click', () => {
        const currentLang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
        const newLang = currentLang === 'de' ? 'en' : 'de';
        
        document.documentElement.setAttribute('lang', newLang);
        StorageManager.setItem(STORAGE_KEYS.LANG, newLang);
        updateLangToggleButton(newLang);
        
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
