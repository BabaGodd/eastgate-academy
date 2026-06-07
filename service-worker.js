// ============================================
// EASTGATE ACADEMY — SERVICE WORKER
// ============================================

const CACHE_NAME = 'eastgate-academy-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/academics.html',
  '/admissions.html',
  '/staff.html',
  '/contact.html',
  '/gallery.html',
  '/fees.html',
  '/404.html',
  '/login.html',
  '/styles.css',
  '/script.js',
  '/login.css',
  '/login.js',
  '/supabase.js',
  '/images/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Nunito:wght@400;500;600;700&display=swap'
];

// Install event — cache all static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event — clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event — serve from cache then network
self.addEventListener('fetch', event => {
  // Skip non GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase API requests — always fetch live
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache new responses
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // If offline and page not cached show 404
            if (event.request.destination === 'document') {
              return caches.match('/404.html');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('Background sync triggered');
  }
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Eastgate Academy';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});