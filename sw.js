const CACHE_NAME = 'umschulung-fiae-v9';
const ASSETS = [
    '/',
    '/index.html',
    '/home.html',
    '/portfolio.html',
    '/ausbildungsablauf.html',
    '/berufsfoerderungswerk.html',
    '/kostentraeger.html',
    '/praktikumsbetrieb.html',
    '/links.html',
    '/news.html',
    '/impressum.html',
    '/datenschutz.html',
    '/dashboard.html',
    '/assets/css/style.css',
    '/assets/css/skeletons.css',
    '/assets/js/components.js',
    '/assets/js/main.js',
    '/assets/js/portfolio.js',
    '/assets/js/projects_data.js',
    '/assets/js/modal.js',
    '/assets/js/toast.js',
    '/assets/images/favicon.svg',
    '/assets/images/academy_campus.png'
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
    
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (e.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
