const CACHE_NAME = 'jobmatch-v2';
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
    '/js/utils/taxCalculator.js',
    '/js/utils/commandPalette.js',
    '/js/utils/audioRecorder.js',
    '/js/utils/crypto.js',
    '/js/utils/speechRecognition.js',
    '/js/utils/i18n.js'
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
    if (!e.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(e.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            return fetch(e.request);
        })
    );
});

// Push & Notification Handlers
self.addEventListener('push', (e) => {
    let data = { title: 'JobMatch Erinnerung', body: 'Du hast anstehende Fristen oder Termine.' };
    if (e.data) {
        try {
            data = e.data.json();
        } catch(err) {
            data.body = e.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'https://img.icons8.com/neon/180/briefcase.png',
        badge: 'https://img.icons8.com/neon/180/briefcase.png',
        vibrate: [100, 50, 100]
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});
