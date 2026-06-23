/* CAM Oposiciones — Service Worker (PWA offline) */
const CACHE = 'cam-opos-v13';
const ASSETS = [
  './',
  './index.html',
  './tema1.html',
  './tema2.html',
  './tema3.html',
  './tema4.html',
  './tests.html',
  './progreso.html',
  './404.html',
  './assets/app.js',
  './assets/tema-extras.js',
  './assets/theme.css',
  './assets/privacy.js',
  './assets/privacy.css',
  './assets/crypto.js',
  './temas-cifrados/canary.json',
  './temas-cifrados/tema1.json',
  './temas-cifrados/tema2.json',
  './temas-cifrados/tema3.json',
  './temas-cifrados/tema4.json',
  './favicon.svg',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Solo same-origin
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const respClone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, respClone));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
