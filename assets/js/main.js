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
    'assets/js/modules/contact-form.js',
    'assets/js/modules/skill-bars.js',
];

(function loadModules() {
    let i = 0;
    function boot() {
        const fn = () => {
            initTheme();
            initNavigation();
            initTranslation();
            initSearchAndFilter();
            initCountdown();
            initUsernameGreeting();
            initScrollAnimations();
            initBackToTop();
            initCookieBanner();
            initContactForm();
            initSkillBars();
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
