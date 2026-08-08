const CACHE_NAME = 'empire-classic-cache-v2';
const urlsToCache = [
  '/',
  'index.html',
  'css/index.css',
  'js/core/main.js',
  'js/core/state.js',
  'js/core/ui.js',
  'js/core/persistence.js',
  'js/core/config.js',
  'js/core/canvas.js',
  'js/utils/i18n.js',
  'js/utils/theme.js',
  'js/utils/analytics.js',
  'js/features/achievements.js',
  'js/features/ai_bot.js',
  'js/features/tutorial.js',
  'js/features/sound.js',
  'js/features/marketplace.js',
  'js/features/heroes.js',
  'js/features/outposts.js',
  'js/features/raids.js',
  'js/features/seasons.js',
  'js/features/dungeons.js',
  'js/features/daily_quests.js',
  'js/features/leaderboard.js',
  'js/features/night_cycle.js',
  'js/features/espionage.js',
  'js/features/regions.js',
  'js/features/tournament.js',
  'manifest.webmanifest'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList => Promise.all(
      keyList.map(key => {
        if (!cacheWhitelist.includes(key)) {
          return caches.delete(key);
        }
      })
    ))
  );
});
