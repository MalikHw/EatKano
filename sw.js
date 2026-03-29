const CACHE_NAME = 'eatkano-v1';
const ASSETS = [
  './',
  './index.html',
  './static/index.css',
  './static/index.js',
  './static/image/ClickBefore.png',
  './static/image/ClickAfter.png',
  './static/music/tap.mp3',
  './static/music/end.mp3',
  './static/music/err.mp3',
  './static/i18n/en.json',
  './static/i18n/zh.json',
  './static/i18n/ja.json',
  'https://code.createjs.com/1.0.0/createjs.min.js',
  'https://passport.cnblogs.com/scripts/jsencrypt.min.js',
  'https://cdn.staticfile.org/twitter-bootstrap/5.1.1/css/bootstrap.min.css',
  'https://cdn.staticfile.org/twitter-bootstrap/5.1.1/js/bootstrap.bundle.min.js',
  'https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', event => {
  // Skip non-GET and cross-origin POST (e.g. SubmitResults.php)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses for same-origin or CDN assets
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
