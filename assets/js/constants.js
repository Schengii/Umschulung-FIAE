/**
 * Zentrale Konstanten für localStorage-Keys und App-weite Werte
 * Vermeidet Magic Strings und Tippfehler.
 */
const STORAGE_KEYS = Object.freeze({
    THEME: 'theme',
    LANG: 'lang',
    USERNAME: 'username',
    COOKIE_CONSENT: 'cookieConsent',
    SNAKE_HIGHSCORE: 'snake_highscore',
    MEMORY_BEST_MOVES: 'memoryBestMoves',
    MEMORY_BEST_TIME: 'memoryBestTime',
    PORTFOLIO_CUSTOM_PROJECTS: 'portfolio_custom_projects',
    LEARNING_RECOMMENDATIONS_QUIZ_WEAK_CATEGORIES: 'learning_recommendations_quiz_weak_categories',
    LEARNING_RECOMMENDATIONS_FLASHCARDS_WRONG_COUNTS: 'learning_recommendations_flashcards_wrong_counts',
    GITHUB_PROJECTS_CACHE: 'github_projects_cache',
    GITHUB_PROJECTS_CACHE_TIME: 'github_projects_cache_time',
});

const APP = Object.freeze({
    DEFAULT_LANG: 'de',
    SEARCHABLE_PAGES: ['news.html', 'home.html'],
    IHK_TARGET_DATE: '2026-06-08T10:00:00+02:00',
    SCROLL_THRESHOLD: 300,
    SKILL_OBSERVER_THRESHOLD: 0.5,
    GITHUB_USERNAME: 'Schengii',
    WEB3FORMS_KEY: '', // Trage hier deinen Web3Forms Access Key ein, um direkte Mail-Zustellung zu aktivieren!
});

function resolveAssetPath(pathStr) {
    if (!pathStr || typeof pathStr !== 'string') return pathStr;
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('data:') || pathStr.startsWith('blob:')) {
        return pathStr;
    }
    const isPagesFolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
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
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">' +
    '<rect width="400" height="225" fill="#dfe3ea"/>' +
    '<g fill="none" stroke="#8f97a3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="140" y="72" width="120" height="90" rx="10"/>' +
    '<circle cx="168" cy="99" r="9"/>' +
    '<path d="M140 148 L172 116 194 138 226 100 260 148"/>' +
    '</g></svg>'
);

// Expose constants to global window scope for backwards compatibility with non-module scripts
window.STORAGE_KEYS = STORAGE_KEYS;
window.APP = APP;
window.resolveAssetPath = resolveAssetPath;
window.PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;

