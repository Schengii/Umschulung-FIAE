/**
 * Main entry point — dynamically loads modules, then bootstraps.
 * Works without modifying HTML: loads constants + all modules,
 * then initializes everything on DOMContentLoaded.
 */

// Scripts to load before initialization (in order)
const __MODULE_SCRIPTS = [
    'assets/js/constants.js',
    'assets/js/modules/theme.js',
    'assets/js/modules/navigation.js',
    'assets/js/modules/translation.js',
    'assets/js/modules/search-filter.js',
    'assets/js/modules/countdown.js',
    'assets/js/modules/username-greeting.js',
    'assets/js/modules/scroll-animations.js',
    'assets/js/modules/backtotop.js',
    'assets/js/modules/cookie-banner.js',
    'assets/js/modules/pwa-installer.js',
    'assets/js/modules/contact-form.js',
    'assets/js/modules/skill-bars.js',
    'assets/js/modules/skill-radar.js',
    'assets/js/modules/roadmap.js',
    'assets/js/modules/confetti.js',
    'assets/js/modules/project-slideshow.js',
    'assets/js/modules/game-audio.js',
    'assets/js/modules/age-calculator.js',
    'assets/js/modules/hero-section.js',
    'assets/js/modules/keyboard-shortcuts.js', // This was already here
    'assets/js/modules/easter-eggs.js',
    'assets/js/modules/achievements.js',
    'assets/js/modules/blog-enhancements.js',
    'assets/js/modules/learning-progress.js',
    'assets/js/modules/praktikumsbetrieb-media.js', // Interactive DFG and EcoChef Media Module
    'assets/js/elektrocheck_overlay.js', // New module for ElektroCheck AI bounding boxes
    'assets/js/dashboard.js',
];

(function loadModules() {
    let i = 0;
    function boot() {
        const fn = () => {
            if (typeof initTheme === 'function') initTheme();
            if (typeof initNavigation === 'function') initNavigation();
            if (typeof initTranslation === 'function') initTranslation();
            if (typeof initSearchAndFilter === 'function') initSearchAndFilter();
            if (typeof initCountdown === 'function') initCountdown();
            if (typeof initUsernameGreeting === 'function') initUsernameGreeting();
            if (typeof initScrollAnimations === 'function') initScrollAnimations();
            if (typeof initBackToTop === 'function') initBackToTop();
            if (typeof initCookieBanner === 'function') initCookieBanner();
            if (typeof initPwaInstaller === 'function') initPwaInstaller();
            if (typeof initContactForm === 'function') initContactForm();
            if (typeof initSkillBars === 'function') initSkillBars();
            if (typeof initSkillRadar === 'function') initSkillRadar();
            if (typeof initRoadmap === 'function') initRoadmap();
            if (typeof initSlideshow === 'function') initSlideshow();
            if (typeof initConfetti === 'function') initConfetti();
            if (typeof initGameAudio === 'function') initGameAudio();
            if (typeof initAgeCalculator === 'function') initAgeCalculator();
            if (typeof initHeroSection === 'function') initHeroSection();
            if (typeof initKeyboardShortcuts === 'function') initKeyboardShortcuts();
            if (typeof initEasterEggs === 'function') initEasterEggs();
            if (typeof initAchievements === 'function') initAchievements();
            if (typeof initBlogEnhancements === 'function') initBlogEnhancements();
            if (typeof initLearningProgress === 'function') initLearningProgress();
            if (typeof initPraktikumsbetriebMedia === 'function') initPraktikumsbetriebMedia();
            if (typeof initDashboard === 'function') initDashboard();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn(); // DOM already ready
        }
    }
    function next() {
        if (i >= __MODULE_SCRIPTS.length) {
            boot();
            return;
        }
        const script = document.createElement('script');
        script.src = __MODULE_SCRIPTS[i++];
        script.onload = next;
        script.onerror = next;
        document.head.appendChild(script);
    }
    next();
})();
