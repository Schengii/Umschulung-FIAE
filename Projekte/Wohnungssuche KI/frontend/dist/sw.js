// Service Worker für Wohnungssuche KI

const CACHE_NAME = 'wohnungssuche-ki-v1';
const API_CACHE_NAME = 'wohnungssuche-ki-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app_icon.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Could not cache some assets on install:', err);
      });
    })
  );
  // Überspringe das Warten, um den Service Worker sofort zu aktivieren
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept fetch requests for caching
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // API Caching-Strategie für GET-Anfragen an /api/listings und /api/preferences
  if (url.pathname.includes('/api/listings') || url.pathname.includes('/api/preferences')) {
    if (event.request.method === 'GET') {
      event.respondWith(
        fetch(event.request)
          .then(function(response) {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(API_CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(function() {
            // Bei Offline-Modus aus dem Cache ausliefern
            return caches.match(event.request);
          })
      );
      return;
    }
  }

  // Cache-First mit Network-Fallback für statische App-Ressourcen
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Im Hintergrund aktualisieren für den nächsten Aufruf (Stale-While-Revalidate)
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then(function(response) {
        if (response.status === 200 && (
          url.pathname.endsWith('.js') || 
          url.pathname.endsWith('.css') || 
          url.pathname.endsWith('.png') || 
          url.pathname.endsWith('.jpg') || 
          url.pathname.endsWith('.svg') || 
          url.pathname.includes('/assets/')
        )) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function() {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Lausche auf Push-Benachrichtigungen vom Server
self.addEventListener('push', function(event) {
  let data = { title: 'Wohnungssuche KI', body: 'Neue passende Wohnung gefunden!' };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      data = payload.notification || data;
    } catch (e) {
      // Fallback falls Payload reiner Text ist
      data = { title: 'Wohnungssuche KI', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/app_icon.png',
    badge: data.badge || '/app_icon.png',
    vibrate: [100, 50, 100],
    data: data.data || {} // Enthält z.B. die listingId
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Reagiere auf Klicks auf die Benachrichtigung
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const listingId = event.notification.data?.listingId;
  let targetUrl = '/';
  if (listingId) {
    targetUrl = `/?openListingId=${listingId}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.navigate(targetUrl).then(c => c.focus());
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
