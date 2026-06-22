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
    GITHUB_PROJECTS_CACHE: 'github_projects_cache',
    GITHUB_PROJECTS_CACHE_TIME: 'github_projects_cache_time',
});

const APP = Object.freeze({
    DEFAULT_LANG: 'de',
    SEARCHABLE_PAGES: ['news.html', 'portfolio.html', 'home.html'],
    IHK_TARGET_DATE: '2026-06-08T10:00:00+02:00',
    SCROLL_THRESHOLD: 300,
    SKILL_OBSERVER_THRESHOLD: 0.5,
    GITHUB_USERNAME: 'Schengii',
});
