const CACHE_NAME = 'jobmatch-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/dashboard.css',
    '/css/kanban.css',
    '/css/comparer.css',
    '/css/copilot.css',
    '/js/app.js',
    '/js/storage.js',
    '/js/mockAi.js',
    '/js/views/dashboardView.js',
    '/js/views/kanbanView.js',
    '/js/views/comparerView.js',
    '/js/views/copilotView.js',
    '/js/views/calendarView.js',
    '/js/views/finderView.js',
    '/js/utils/db.js',
    '/js/utils/cvExport.js',
    '/js/utils/ics.js',
    '/js/utils/pdfExport.js',
    '/js/utils/taxCalculator.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).catch((err) => {
            console.warn('Caching during install failed:', err);
        })
    );
    self.skipWaiting();
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
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Skip external APIs (e.g. Gemini, Lucide icons, Chart.js) or proxy calls
    if (!e.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached asset, but fetch updated version in background (Stale-While-Revalidate)
                fetch(e.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
                    }
                }).catch(() => {/* Ignore network failures when offline */});
                return cachedResponse;
            }
            return fetch(e.request);
        })
    );
});
