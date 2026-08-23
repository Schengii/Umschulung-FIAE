const CACHE_NAME = 'umschulung-fiae-v29';
const ASSETS = [
    './',
    'index.html',
    '404.html',
    'pages/home.html',
    'pages/offline.html',
    'pages/portfolio.html',
    'pages/ihk-cockpit.html',
    'pages/challenge-lab.html',
    'pages/ausbildungsablauf.html',
    'pages/berufsfoerderungswerk.html',
    'pages/kostentraeger.html',
    'pages/praktikumsbetrieb.html',
    'pages/links.html',
    'pages/news.html',
    'pages/impressum.html',
    'pages/datenschutz.html',
    'pages/dashboard.html',
    'pages/ueber-mich.html',
    'pages/lebenslauf.html',
    'pages/architecture.html',
    'pages/flashcards.html',
    'pages/games.html',
    'pages/interview-trainer.html',
    'pages/playground.html',
    'pages/quiz.html',
    'pages/snake.html',
    'pages/memory.html',
    'pages/git-simulator.html',
    'pages/404.html',
    // CSS
    'assets/css/style.css',
    'assets/css/skeletons.css',
    'assets/css/skills_matrix.css',
    'assets/css/lebenslauf.css',
    'assets/css/architecture.css',
    'assets/css/darkmode.css',
    'assets/css/games.css',
    'assets/css/git-simulator.css',
    'assets/css/impressum.css',
    'assets/css/interview-trainer.css',
    'assets/css/kostentraeger.css',
    'assets/css/memory.css',
    'assets/css/modal.css',
    'assets/css/playground.css',
    'assets/css/praktikumsbetrieb.css',
    'assets/css/print.css',
    'assets/css/quiz.css',
    'assets/css/snake.css',
    // Core JS
    'assets/js/components.js',
    'assets/js/main.js',
    'assets/js/constants.js',
    'assets/js/portfolio.js',
    'assets/js/projects_data.js',
    'assets/js/projekt-detail.js',
    'assets/js/modal.js',
    'assets/js/toast.js',
    'assets/js/dashboard.js',
    'assets/js/elektrocheck_overlay.js',
    'assets/js/flashcards.js',
    'assets/js/interview.js',
    'assets/js/memory.js',
    'assets/js/news.js',
    'assets/js/news_data.js',
    'assets/js/playground.js',
    'assets/js/quiz.js',
    'assets/js/skills_matrix.js',
    'assets/js/snake.js',
    'assets/js/architecture.js',
    'assets/js/git-simulator.js',
    // Modules
    'assets/js/modules/about-me-enhancements.js',
    'assets/js/modules/accent-color.js',
    'assets/js/modules/achievements.js',
    'assets/js/modules/age-calculator.js',
    'assets/js/modules/audio-pitch.js',
    'assets/js/modules/backtotop.js',
    'assets/js/modules/blog-enhancements.js',
    'assets/js/modules/c4-architecture.js',
    'assets/js/modules/challenge-lab.js',
    'assets/js/modules/command_palette.js',
    'assets/js/modules/confetti.js',
    'assets/js/modules/consent-notice.js',
    'assets/js/modules/contact-form.js',
    'assets/js/modules/countdown.js',
    'assets/js/modules/document-preview.js',
    'assets/js/modules/easter-eggs.js',
    'assets/js/modules/executive-dossier.js',
    'assets/js/modules/faq-accordion.js',
    'assets/js/modules/game-audio.js',
    'assets/js/modules/hero-section.js',
    'assets/js/modules/ical-generator.js',
    'assets/js/modules/ihk-cockpit.js',
    'assets/js/modules/ihk-exam-simulator.js',
    'assets/js/modules/impressum-enhancements.js',
    'assets/js/modules/keyboard-shortcuts.js',
    'assets/js/modules/learning-progress.js',
    'assets/js/modules/navigation.js',
    'assets/js/modules/pdf-exporter.js',
    'assets/js/modules/portfolio-copilot.js',
    'assets/js/modules/portfolio_exporter.js',
    'assets/js/modules/praktikumsbetrieb-media.js',
    'assets/js/modules/premium-effects-p2.js',
    'assets/js/modules/premium-effects.js',
    'assets/js/modules/project-enhancements.js',
    'assets/js/modules/project-slideshow.js',
    'assets/js/modules/project_compare.js',
    'assets/js/modules/pwa-installer.js',
    'assets/js/modules/qr-generator.js',
    'assets/js/modules/quick-sandbox.js',
    'assets/js/modules/recruiter-filter.js',
    'assets/js/modules/roadmap.js',
    'assets/js/modules/scroll-animations.js',
    'assets/js/modules/search-filter.js',
    'assets/js/modules/skill-bars.js',
    'assets/js/modules/skill-matchmaker.js',
    'assets/js/modules/skill-radar.js',
    'assets/js/modules/sql-playground.js',
    'assets/js/modules/theme.js',
    'assets/js/modules/timeline-scroll.js',
    'assets/js/modules/token-auth.js',
    'assets/js/modules/translation.js',
    'assets/js/modules/username-greeting.js',
    // Local Fonts & Vendor
    'assets/fonts/inter-400.woff2',
    'assets/fonts/inter-700.woff2',
    'assets/fonts/outfit-400.woff2',
    'assets/fonts/outfit-700.woff2',
    'assets/vendor/fontawesome/css/all.min.css',
    'assets/vendor/fontawesome/webfonts/fa-solid-900.woff2',
    'assets/vendor/fontawesome/webfonts/fa-brands-400.woff2',
    'assets/vendor/fontawesome/webfonts/fa-regular-400.woff2',
    // Essential Images
    'assets/images/favicon.svg',
    'assets/images/maximilian_schenk_portrait.jpg',
    'assets/images/BFW_Fahnen_Panorama.jpg',
    'assets/images/it_workspace.webp',
    'assets/images/icon-192.png',
    'assets/images/icon-512.png'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS.map(asset => {
                    return fetch(new Request(asset, { cache: 'reload' }))
                        .then(response => {
                            if (response.ok) {
                                return cache.put(asset, response);
                            }
                            throw new Error(`Response not OK for ${asset}`);
                        })
                        .catch(err => {
                            console.warn(`Failed to cache ${asset} with reload request, falling back to standard cache add:`, err);
                            return cache.add(asset).catch(e => console.error(`Standard cache fallback failed for ${asset}:`, e));
                        });
                })
            );
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (!e.request.url.startsWith(self.location.origin)) return;
    
    const url = new URL(e.request.url);

    // 1. Network-First strategy for HTML documents and navigation
    if (e.request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/') {
        e.respondWith(
            fetch(e.request)
                .then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(e.request).then((cachedResponse) => {
                    return cachedResponse || caches.match('pages/offline.html') || caches.match('offline.html');
                }))
        );
    } 
    // 2. Stale-While-Revalidate strategy for static assets (CSS, JS, fonts, images)
    else {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                const fetchPromise = fetch(e.request)
                    .then((networkResponse) => {
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed (offline, blocked, timed out) and nothing was cached yet.
                        // Never resolve to `undefined` here - respondWith() requires a real Response,
                        // otherwise the browser reports the request itself as failed, which for a
                        // script/style file breaks the page's whole JS/CSS loading silently.
                        return new Response('', {
                            status: 503,
                            statusText: 'Offline and not yet cached'
                        });
                    });

                return cachedResponse || fetchPromise;
            })
        );
    }
});
