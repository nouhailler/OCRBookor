// ==============================================================================
// Service Worker pour la Landing Page PWA OCRBookor
// ==============================================================================
const CACHE_NAME = 'ocrbookor-landing-v1.2.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/en',
  '/en.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/images/screenshot.jpg',
  '/docs/images/screenshot.jpg'
];

// Installation : Mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pré-cache partiel :', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception réseau : Stratégie hybride respectant les liens externes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ne JAMAIS intercepter ni bloquer les requêtes externes (GitHub, Releases, Téléchargements .deb)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Pour les navigations HTML : Stratégie Network-First avec fallback cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => {
          if (res) return res;
          if (event.request.url.includes('/en')) return caches.match('/en.html');
          return caches.match('/index.html');
        }))
    );
    return;
  }

  // 3. Pour les assets statiques (images, styles, polices) : Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Si le réseau échoue et aucun cache, pas d'erreur critique
        });

      return cachedResponse || fetchPromise;
    })
  );
});
