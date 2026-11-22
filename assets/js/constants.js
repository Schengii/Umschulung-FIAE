/**
 * Zentrale Konstanten für localStorage-Keys und App-weite Werte
 * Vermeidet Magic Strings und Tippfehler.
 */
const STORAGE_KEYS = Object.freeze({
    THEME: 'theme',
    LANG: 'lang',
    USERNAME: 'username',
    COOKIE_CONSENT: 'cookieConsent',
    ACHIEVEMENTS: 'achievements',
    VISITED_PAGES: 'visited_pages',
    PORTFOLIO_ACCENT: 'portfolio_accent',
    PORTFOLIO_DYSLEXIA: 'portfolio_dyslexia',
    PORTFOLIO_COLORBLIND: 'portfolio_colorblind',
    PORTFOLIO_FONT_SCALE: 'portfolio_font_scale',
    PORTFOLIO_CONTRAST: 'portfolio_contrast',
    GITHUB_PROJECTS_CACHE: 'github_projects_cache',
    GITHUB_PROJECTS_CACHE_TIME: 'github_projects_cache_time',
    GITHUB_LIVE_COMMITS_TODAY: 'github_live_commits_today',
});

const APP = Object.freeze({
    DEFAULT_LANG: 'de',
    SEARCHABLE_PAGES: ['news.html', 'home.html'],
    SCROLL_THRESHOLD: 300,
    GITHUB_USERNAME: 'Schengii',
    WEB3FORMS_KEY: 'a170fb6a-e47b-43d7-ac1c-2c09ad6c7289',
});

/** @param {string} pathStr */
function resolveAssetPath(pathStr) {
    if (!pathStr || typeof pathStr !== 'string') return pathStr;
    if (
        pathStr.startsWith('http://') ||
        pathStr.startsWith('https://') ||
        pathStr.startsWith('data:') ||
        pathStr.startsWith('blob:')
    ) {
        return pathStr;
    }
    const isPagesFolder =
        window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
    if (isPagesFolder) {
        if (pathStr.startsWith('../')) return pathStr;
        if (pathStr.startsWith('./')) return '../' + pathStr.substring(2);
        return '../' + pathStr;
    } else {
        if (pathStr.startsWith('./')) return pathStr;
        if (pathStr.startsWith('../')) return pathStr.replace(/^\.\.\//, '');
        return './' + pathStr;
    }
}

// Neutral placeholder shown in place of a project screenshot that fails to load
// (missing file, blocked request, bad path). Used as the `onerror` fallback for
// every project <img> so a single broken image never looks like a broken page.
const PLACEHOLDER_IMAGE =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">' +
            '<rect width="400" height="225" fill="#dfe3ea"/>' +
            '<g fill="none" stroke="#8f97a3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="140" y="72" width="120" height="90" rx="10"/>' +
            '<circle cx="168" cy="99" r="9"/>' +
            '<path d="M140 148 L172 116 194 138 226 100 260 148"/>' +
            '</g></svg>'
    );

// Expose constants to global window scope for backwards compatibility with non-module scripts
if (typeof window !== 'undefined') {
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.APP = APP;
    window.resolveAssetPath = resolveAssetPath;
    window.PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;
}
