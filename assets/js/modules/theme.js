/**
 * Theme Module — Light/Dark Mode
 * Nutzt STORAGE_KEYS aus constants.js
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const storedTheme = StorageManager.getItem(STORAGE_KEYS.THEME);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        StorageManager.setItem(STORAGE_KEYS.THEME, newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        icon.setAttribute('title', 'Zu hellem Design wechseln');
    } else {
        icon.className = 'fa-solid fa-moon';
        icon.setAttribute('title', 'Zu dunklem Design wechseln');
    }
}
