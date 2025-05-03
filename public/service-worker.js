// VibeWell Service Worker
const CACHE_VERSION = 'v1';
const CACHE_NAME = `vibewell-${CACHE_VERSION}`;
const OFFLINE_CACHE = 'vibewell-offline';
const APP_SHELL_CACHE = 'vibewell-app-shell';
const DATA_CACHE = 'vibewell-data';

// App Shell Assets - Critical resources for the application to function
const APP_SHELL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Additional static assets to cache
const STATIC_ASSETS = [
  '/styles.css',
  '/main.js',
  '/images/logo.png',
  '/images/fallback-avatar.png'
];

// Offline fallback page
const OFFLINE_PAGE = '/offline';

/**
 * Helper function to clean up old caches
 */
const cleanupOldCaches = async () => {
  const cacheKeepList = [CACHE_NAME, OFFLINE_CACHE, APP_SHELL_CACHE, DATA_CACHE];
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => !cacheKeepList.includes(name));
  return Promise.all(oldCaches.map(name => caches.delete(name)));
};

/**
 * Helper function to determine if a request is for an API
 */
const isApiRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
};

/**
 * Helper function to determine if a request is for an image
 */
const isImageRequest = (request) => {
  return request.destination === 'image';
};

/**
 * Helper function to determine if a request is for a document
 */
const isDocumentRequest = (request) => {
  return request.destination === 'document';
};

/**
 * Install event handler - precaches app shell resources
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache app shell resources
      caches.open(APP_SHELL_CACHE).then((cache) => {
        console.log('Caching app shell resources');
        return cache.addAll(APP_SHELL_RESOURCES);
      }),
      
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache offline page
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('Caching offline page');
        return cache.add(OFFLINE_PAGE);
      })
    ])
    .then(() => self.skipWaiting()) // Force activation
  );
});

/**
 * Activate event handler - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim() // Take control of all clients
    ])
  );
});

/**
 * Fetch event handler - different strategies for different requests
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Don't cache cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests - Network first with cache fallback
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          // Only cache valid responses
          if (response.ok) {
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If we can't get from cache, return offline JSON for API requests
              return new Response(
                JSON.stringify({ 
                  error: 'You are offline and no cached data is available.',
                  offline: true,
                  timestamp: new Date().toISOString() 
                }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503,
                  statusText: 'Service Unavailable'
                }
              );
            });
        })
    );
    return;
  }
  
  // Handle document requests - Network first with offline fallback
  if (isDocumentRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          // Cache valid HTML responses
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not found in cache, return the offline page
              return caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }
  
  // Handle image requests - Cache first with network fallback
  if (isImageRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Not in cache, get from network
          return fetch(request)
            .then((response) => {
              // Clone the response to store in cache
              const clonedResponse = response.clone();
              
              // Cache valid responses
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, clonedResponse);
                });
              }
              
              return response;
            })
            .catch(() => {
              // If image is not found and not in cache, 
              // return a placeholder image if appropriate
              if (request.url.match(/\/user\/.*\/avatar/) || 
                  request.url.match(/\/profile\/.*\/image/)) {
                return caches.match('/images/fallback-avatar.png');
              }
              
              // Otherwise just fail
              return new Response('Image not available offline', {
                status: 404,
                statusText: 'Not Found'
              });
            });
        })
    );
    return;
  }
  
  // For all other requests - Stale-while-revalidate strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached response immediately
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Update the cache with the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            
            return networkResponse;
          })
          .catch(() => {
            // Fetch failed, just return the cached response or null
            return cachedResponse;
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

/**
 * Push event handler - display push notifications
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let notification;
  try {
    notification = event.data.json();
  } catch (e) {
    notification = {
      title: 'VibeWell',
      body: event.data.text(),
      icon: '/icons/icon-192x192.png'
    };
  }
  
  const title = notification.title || 'VibeWell Notification';
  const options = {
    body: notification.body,
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: notification.badge || '/icons/badge-96x96.png',
    data: notification.data || {},
    actions: notification.actions || [],
    vibrate: [100, 50, 100],
    requireInteraction: notification.requireInteraction || false,
    silent: notification.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification click event handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Get notification data
  const data = event.notification.data || {};
  const url = data.url || '/';
  
  // Handle action buttons if clicked
  if (event.action) {
    console.log('Action clicked:', event.action);
    // Handle specific actions here
  }
  
  // Open or focus the relevant page
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there's already a window open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open or matching, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

/**
 * Sync event handler for background syncing
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  } else if (event.tag === 'sync-userdata') {
    event.waitUntil(syncUserData());
  }
});

/**
 * Background sync for bookings
 */
async function syncBookings() {
  try {
    const db = await openIndexedDB();
    const pendingBookings = await db.getAll('pendingBookings');
    
    for (const booking of pendingBookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(booking)
        });
        
        if (response.ok) {
          // Remove from pending queue after successful sync
          await db.delete('pendingBookings', booking.id);
        }
      } catch (error) {
        console.error('Failed to sync booking:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing bookings:', error);
  }
}

/**
 * Background sync for user data
 */
async function syncUserData() {
  // Implementation would be similar to syncBookings
  console.log('Syncing user data in background');
}

/**
 * Helper to open IndexedDB
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vibewell', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pendingBookings')) {
        db.createObjectStore('pendingBookings', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('userSettings')) {
        db.createObjectStore('userSettings', { keyPath: 'id' });
      }
    };
  });
} 