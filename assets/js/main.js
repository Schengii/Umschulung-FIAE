/**
 * Main entry point for the application.
 *
 * Two things happen here:
 *
 * 1) Timing fix: this is a `type="module"` script, which browsers treat as
 *    deferred — it runs AFTER the HTML is parsed but BEFORE the
 *    `DOMContentLoaded` event fires. `components.js` injects the actual
 *    header/nav/footer markup (theme toggle, language toggle, accent-color
 *    toggle, mobile nav menu, cookie banner, ...) inside ITS OWN
 *    `DOMContentLoaded` listener, which only runs afterwards. So bootstrapping
 *    on `document.readyState`/`DOMContentLoaded` directly (as this file used
 *    to) means every module that touches those elements finds nothing there
 *    yet and silently no-ops — the buttons render but do nothing. Waiting for
 *    the `fiae:layout-ready` event that components.js dispatches once it's
 *    done fixes that. `window.load` is kept as a safety net in case that
 *    event is ever missed for any reason.
 *
 * 2) Lazy loading: most modules only matter on one or a couple of pages
 *    (e.g. ihk-cockpit.js only does anything on ihk-cockpit.html). Importing
 *    all of them statically meant every page — including a plain legal
 *    notice page — paid for ~50 JS requests regardless of whether anything
 *    used them. LAZY_MODULES below dynamically imports each one only when a
 *    matching element is actually present on the current page, using the
 *    same selector each module already checks internally as its own guard.
 */

// Import core utilities and constants first.
// These are assumed to set up global constants and functions.
import './constants.js';
import './toast.js';

// Modules needed on (almost) every page: header/nav/footer controls, global
// keyboard shortcuts, site-wide widgets, and cheap page-whitelist checks.
import { initTheme } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initTranslation } from './modules/translation.js';
import { initAccentColor } from './modules/accent-color.js';
import { initSearchAndFilter } from './modules/search-filter.js';
import { initScrollAnimations } from './modules/scroll-animations.js';
import { initBackToTop } from './modules/backtotop.js';
import { initCookieBanner } from './modules/consent-notice.js';
import { initPwaInstaller } from './modules/pwa-installer.js';
import { initKeyboardShortcuts } from './modules/keyboard-shortcuts.js';
import { initEasterEggs } from './modules/easter-eggs.js';
import { initAchievements } from './modules/achievements.js';
import { initPremiumEffects } from './modules/premium-effects.js';
import { initPremiumEffectsP2 } from './modules/premium-effects-p2.js';
import { initGameAudio } from './modules/game-audio.js';
import { initPortfolioCopilot } from './modules/portfolio-copilot.js';
import { initConfetti } from './modules/confetti.js';

const CORE_INITIALIZERS = [
    initTheme, initNavigation, initTranslation, initAccentColor,
    initSearchAndFilter, initScrollAnimations, initBackToTop, initCookieBanner,
    initPwaInstaller, initKeyboardShortcuts, initEasterEggs, initAchievements,
    initPremiumEffects, initPremiumEffectsP2, initGameAudio, initPortfolioCopilot,
    initConfetti,
];

// [dynamic import path, named export to call, CSS selector(s) that gate loading]
// The selector is an exact copy of the element check each module already does
// at the top of its own init function — this only decides whether the file
// gets fetched at all, the module's own guard still applies as usual.
const LAZY_MODULES = [
    ['./modules/countdown.js', 'initCountdown', '#cd-days'],
    ['./modules/username-greeting.js', 'initUsernameGreeting', '#mySubmit'],
    ['./modules/contact-form.js', 'initContactForm', '#contact-form, #hire-me-form'],
    ['./modules/skill-bars.js', 'initSkillBars', '.skill-fill'],
    ['./modules/skill-radar.js', 'initSkillRadar', '#skill-radar-container'],
    ['./modules/roadmap.js', 'initRoadmap', '.roadmap-item'],
    ['./modules/project-slideshow.js', 'initSlideshow', '#slide-viewer'],
    ['./modules/age-calculator.js', 'initAgeCalculator', '#my-age, #my-age-en, #my-age-de'],
    ['./modules/hero-section.js', 'initHeroSection', '#hero-section'],
    ['./modules/blog-enhancements.js', 'initBlogEnhancements', 'article.card'],
    ['./modules/learning-progress.js', 'initLearningProgress', '#progress-flashcards-bar'],
    ['./modules/praktikumsbetrieb-media.js', 'initPraktikumsbetriebMedia', '#dfg-gallery-section'],
    ['./dashboard.js', 'initDashboard', '#commit-grid'],
    ['./modules/qr-generator.js', 'initQrGenerator', '#qr-company-input'],
    ['./modules/document-preview.js', 'initDocumentPreview', 'a[href$=".docx"], a[href$=".pptx"]'],
    ['./modules/faq-accordion.js', 'initFaqAccordion', '#faq-accordion-container'],
    ['./modules/token-auth.js', 'initTokenAuth', '.token-secured, #token-input'],
    ['./git-simulator.js', 'initGitSimulator', '#terminal-output'],
    ['./modules/recruiter-filter.js', 'initRecruiterFilter', '.role-filter-container'],
    ['./modules/about-me-enhancements.js', 'initAboutMeEnhancements', '#bridge-display'],
    ['./modules/project-enhancements.js', 'initProjectEnhancements', '.btn-match'],
    ['./modules/impressum-enhancements.js', 'initImpressumEnhancements', '.map-2click-container'],
    ['./modules/timeline-scroll.js', 'initTimelineScroll', '.timeline-v2'],
    ['./modules/skill-matchmaker.js', 'initSkillMatchmaker', '#skill-matchmaker-widget'],
    ['./modules/pdf-exporter.js', 'initPdfExporter', '#btn-cv-print-header, #btn-cv-print-card, .btn-export-pdf, [data-action="export-pdf"]'],
    ['./modules/ical-generator.js', 'initIcalGenerator', '#confirm-booking-btn'],
    ['./modules/ihk-exam-simulator.js', 'initIhkExamSimulator', '.quiz-container'],
    ['./modules/c4-architecture.js', 'initC4Architecture', '.arch-tabs-bar'],
    ['./modules/ihk-cockpit.js', 'initIhkCockpit', '.page-ihk-cockpit, #panel-nwa'],
    ['./modules/quick-sandbox.js', 'initQuickSandbox', '[data-sandbox-project]'],
    ['./modules/executive-dossier.js', 'initExecutiveDossier', '[data-open-dossier]'],
    ['./modules/challenge-lab.js', 'initChallengeLab', '.page-challenge-lab, #lab-challenges-list'],
];

/**
 * Main bootstrap function to initialize all modules.
 */
function bootstrap() {
    // Sequentially call all core initializer functions
    for (const init of CORE_INITIALIZERS) {
        if (typeof init === 'function') {
            try {
                init();
            } catch (e) {
                console.error(`Error during initialization of ${init.name}:`, e);
            }
        }
    }

    // Only fetch+run modules whose page actually contains a matching element.
    for (const [path, exportName, selector] of LAZY_MODULES) {
        if (document.querySelector(selector)) {
            import(path)
                .then((mod) => mod[exportName]?.())
                .catch((e) => console.error(`Failed to lazy-load ${path}:`, e));
        }
    }

    // Optimized card mouse tracking hover glow effect
    document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    // Connection status change notifications (online/offline)
    window.addEventListener('online', () => {
        if (window.showToast) {
            window.showToast('Du bist wieder online!', 'success');
        }
    });
    window.addEventListener('offline', () => {
        if (window.showToast) {
            window.showToast('Verbindung verloren. Offline-Modus aktiv.', 'warning');
        }
    });
}

// Run once, whichever fires first: components.js's layout-ready signal
// (the normal, fast path) or the window load event (safety net).
let didBootstrap = false;
function bootstrapOnce() {
    if (didBootstrap) return;
    didBootstrap = true;
    bootstrap();
}
document.addEventListener('fiae:layout-ready', bootstrapOnce, { once: true });
window.addEventListener('load', bootstrapOnce, { once: true });
