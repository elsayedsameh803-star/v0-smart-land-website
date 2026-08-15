// Smart Land PWA - Service Worker v2.0.0
// AI Digital Audit Platform - Professional PWA

const CACHE_NAME = 'smart-land-v2';
const STATIC_CACHE = 'smart-land-static-v2';
const DYNAMIC_CACHE = 'smart-land-dynamic-v2';
const API_CACHE = 'smart-land-api-v2';
const OFFLINE_CACHE = 'smart-land-offline-v2';

// Assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/en',
  '/ar',
  '/manifest.json',
  '/offline',
  '/og-image-1200x630.png',
  '/icons/icon-48x48.png',
  '/icons/icon-96x96.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-48x48.svg',
  '/icons/icon-96x96.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, OFFLINE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if URL is an API request
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper: Check if URL is a Next.js static resource
function isNextStaticResource(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/screenshots/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.ttf');
}

// Helper: Check if URL is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Helper: Check if URL is a sitemap or robots
function isSeoResource(url) {
  return url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt';
}

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip browser-sync and other extensions
  if (url.hostname !== self.location.hostname && !url.hostname.includes('localhost')) {
    return;
  }

  // SEO resources - Network First (always fresh)
  if (isSeoResource(url)) {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
    return;
  }

  // API requests - Network First with cache fallback
  if (isApiRequest(url)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Static resources - Cache First (Fastest)
  if (isNextStaticResource(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation requests - Network First with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      networkFirstWithCache(request, DYNAMIC_CACHE)
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  // Everything else - Network First
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Network First strategy with cache fallback
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Special handling for navigation requests
    if (isNavigationRequest(request)) {
      return caches.match('/offline');
    }
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 408,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  // Notify all clients to check for updates
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'UPDATE_AVAILABLE',
      timestamp: Date.now(),
    });
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analysis') {
    event.waitUntil(syncAnalysisData());
  }
});

async function syncAnalysisData() {
  // Placeholder for offline data sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      timestamp: Date.now(),
    });
  });
}