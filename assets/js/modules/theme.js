/**
 * Theme Module — Light/Dark Mode
 * Nutzt STORAGE_KEYS aus constants.js
 */
export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // components.js already resolved the theme before first paint (stored choice, else the
    // system colour scheme); only fall back if that attribute is missing.
    const initialTheme =
        document.documentElement.getAttribute('data-theme') || AppStorage.getItem(STORAGE_KEYS.THEME) || 'dark';

    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
    document.addEventListener('langchange', () => {
        updateThemeIcon(document.documentElement.getAttribute('data-theme'));
    });

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        AppStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        updateThemeIcon(newTheme);
        window.dispatchEvent(new CustomEvent('fiae:theme-change', { detail: { theme: newTheme } }));
        document.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    const isEnglish = document.documentElement.getAttribute('lang') === 'en';
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        icon.setAttribute('title', isEnglish ? 'Switch to light theme' : 'Zu hellem Design wechseln');
    } else {
        icon.className = 'fa-solid fa-moon';
        icon.setAttribute('title', isEnglish ? 'Switch to dark theme' : 'Zu dunklem Design wechseln');
    }
}
