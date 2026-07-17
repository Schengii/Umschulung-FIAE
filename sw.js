const CACHE_NAME = 'umschulung-fiae-v16';
const ASSETS = [
    './',
    'index.html',
    'home.html',
    'portfolio.html',
    'ausbildungsablauf.html',
    'berufsfoerderungswerk.html',
    'kostentraeger.html',
    'praktikumsbetrieb.html',
    'links.html',
    'news.html',
    'impressum.html',
    'datenschutz.html',
    'dashboard.html',
    'ueber-mich.html',
    'lebenslauf.html',
    'architecture.html',
    'flashcards.html',
    'games.html',
    'interview-trainer.html',
    'playground.html',
    'quiz.html',
    'snake.html',
    'memory.html',
    'assets/css/style.css',
    'assets/css/skeletons.css',
    'assets/css/skills_matrix.css',
    'assets/css/lebenslauf.css',
    'assets/css/architecture.css',
    'assets/css/darkmode.css',
    'assets/css/games.css',
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
    'assets/js/modules/achievements.js',
    'assets/js/modules/age-calculator.js',
    'assets/js/modules/backtotop.js',
    'assets/js/modules/blog-enhancements.js',
    'assets/js/modules/confetti.js',
    'assets/js/modules/contact-form.js',
    'assets/js/modules/cookie-banner.js',
    'assets/js/modules/countdown.js',
    'assets/js/modules/easter-eggs.js',
    'assets/js/modules/game-audio.js',
    'assets/js/modules/hero-section.js',
    'assets/js/modules/keyboard-shortcuts.js',
    'assets/js/modules/learning-progress.js',
    'assets/js/modules/navigation.js',
    'assets/js/modules/praktikumsbetrieb-media.js',
    'assets/js/modules/project-slideshow.js',
    'assets/js/modules/pwa-installer.js',
    'assets/js/modules/qr-generator.js',
    'assets/js/modules/document-preview.js',
    'assets/js/modules/faq-accordion.js',
    'assets/js/modules/roadmap.js',
    'assets/js/modules/scroll-animations.js',
    'assets/js/modules/search-filter.js',
    'assets/js/modules/skill-bars.js',
    'assets/js/modules/skill-radar.js',
    'assets/js/modules/theme.js',
    'assets/js/modules/translation.js',
    'assets/js/modules/username-greeting.js',
    'assets/images/favicon.svg',
    'assets/images/maximilian_schenk_portrait.jpg',
    'assets/images/BFW_Fahnen_Panorama.jpg',
    'assets/images/it_workspace.png',
    'assets/images/icon-192.png',
    'assets/images/icon-512.png'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => {
                console.warn('Cache pre-addAll failed, caching assets individually:', err);
                // Attempt caching individually to prevent failure of whole installation on single missing asset
                return Promise.all(
                    ASSETS.map(asset => {
                        return cache.add(asset).catch(e => console.warn(`Failed to cache ${asset}:`, e));
                    })
                );
            });
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
                    return cachedResponse || caches.match('index.html');
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
                    .catch(() => {/* Ignore offline network failure for assets */});

                return cachedResponse || fetchPromise;
            })
        );
    }
});
