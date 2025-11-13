// Simple offline cache for Ordkort
const CACHE_NAME = 'ordkort-cache-v1';
const ASSETS = [
  './russisk_ordkort_v4_pwa.html',
  './ordkort-manifest.webmanifest',
  './ordkort-icon-192.png',
  './ordkort-icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match('./russisk_ordkort_v4_pwa.html')))
  );
});
