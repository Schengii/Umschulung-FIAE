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
