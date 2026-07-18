/**
 * Main entry point for the application.
 * This file imports all necessary modules and initializes them,
 * making it compatible with modern bundlers like Vite.
 */

// Import core utilities and constants first.
// These are assumed to set up global constants and functions.
import './constants.js';
import './toast.js';

// Import all feature modules.
import { initTheme } from './modules/theme.js';
import { initNavigation } from './modules/navigation.js';
import { initTranslation } from './modules/translation.js';
import { initSearchAndFilter } from './modules/search-filter.js';
import { initCountdown } from './modules/countdown.js';
import { initUsernameGreeting } from './modules/username-greeting.js';
import { initScrollAnimations } from './modules/scroll-animations.js';
import { initBackToTop } from './modules/backtotop.js';
import { initCookieBanner } from './modules/cookie-banner.js';
import { initPwaInstaller } from './modules/pwa-installer.js';
import { initContactForm } from './modules/contact-form.js';
import { initSkillBars } from './modules/skill-bars.js';
import { initSkillRadar } from './modules/skill-radar.js';
import { initRoadmap } from './modules/roadmap.js';
import { initSlideshow } from './modules/project-slideshow.js';
import { initConfetti } from './modules/confetti.js';
import { initGameAudio } from './modules/game-audio.js';
import { initAgeCalculator } from './modules/age-calculator.js';
import { initHeroSection } from './modules/hero-section.js';
import { initKeyboardShortcuts } from './modules/keyboard-shortcuts.js';
import { initEasterEggs } from './modules/easter-eggs.js';
import { initAchievements } from './modules/achievements.js';
import { initBlogEnhancements } from './modules/blog-enhancements.js';
import { initLearningProgress } from './modules/learning-progress.js';
import { initPraktikumsbetriebMedia } from './modules/praktikumsbetrieb-media.js';
import { initDashboard } from './dashboard.js';
import { initQrGenerator } from './modules/qr-generator.js';
import { initDocumentPreview } from './modules/document-preview.js';
import { initFaqAccordion } from './modules/faq-accordion.js';
import { initTokenAuth } from './modules/token-auth.js';
import { initAccentColor } from './modules/accent-color.js';
import { initGitSimulator } from './git-simulator.js';

/**
 * Main bootstrap function to initialize all modules.
 */
function bootstrap() {
    const initializers = [
        initTheme, initNavigation, initTranslation, initSearchAndFilter,
        initCountdown, initUsernameGreeting, initScrollAnimations, initBackToTop,
        initCookieBanner, initPwaInstaller, initContactForm, initSkillBars,
        initSkillRadar, initRoadmap, initSlideshow, initConfetti, initGameAudio,
        initAgeCalculator, initHeroSection, initKeyboardShortcuts, initEasterEggs,
        initAchievements, initBlogEnhancements, initLearningProgress,
        initPraktikumsbetriebMedia, initDashboard, initQrGenerator,
        initDocumentPreview, initFaqAccordion, initTokenAuth, initAccentColor,
        initGitSimulator
    ];

    // Sequentially call all initializer functions
    for (const init of initializers) {
        if (typeof init === 'function') {
            try {
                init();
            } catch (e) {
                console.error(`Error during initialization of ${init.name}:`, e);
            }
        }
    }
}

// Always wait for DOMContentLoaded to guarantee components.js has injected all templates.
// If the document is already fully loaded, bootstrap immediately.
if (document.readyState === 'complete') {
    bootstrap();
} else {
    document.addEventListener('DOMContentLoaded', bootstrap);
}
