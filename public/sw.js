/* APEX Engine — Service Worker (PWA offline)
 * Estrategia: network-first con fallback a caché para navegación;
 * stale-while-revalidate para assets estáticos. Cache versionado.
 */
const CACHE_NAME = 'apex-engine-v31';
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json', '/shield.svg'];

// Datasets generados en build (Códice Chōzenshū). Cambian en cada despliegue y NO
// llevan hash en el nombre, así que se sirven NETWORK-FIRST: una estrategia
// stale-while-revalidate dejaría a los usuarios con un Códice antiguo (o vacío).
const DATA_PREFIXES = ['/data/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // No cachear llamadas API (siempre en red)
  if (url.pathname.startsWith('/api/')) return;

  // Navegación: network-first con fallback a caché (offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Datasets (/data/*.json): network-first con fallback a caché para offline.
  if (DATA_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});