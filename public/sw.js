const CACHE_NAME = 'vibewell-v1';
const OFFLINE_CACHE = 'vibewell-offline-v1';

// Resources to cache
const urlsToCache = [
    '/',
    '/styles.css',
    '/main.js',
    '/manifest.json',
    '/offline.html',
    '/images/offline-icon.png'
];

// Install event - cache app shell resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/favicon.ico',
                // Add other static assets that should be cached
            ]);
        })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all clients immediately
    self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    let data;
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'New Notification',
            body: event.data.text()
        };
    }
    
    const title = data.title || 'Vibewell';
    const options = {
        body: data.body,
        icon: data.icon || '/logo192.png',
        badge: data.badge || '/badge.png',
        tag: data.tag,
        data: data.data || {},
        actions: data.actions || [],
        // Silent: false - sound will be played on notification
        silent: data.silent || false,
        // Show notification even if app is in foreground
        requireInteraction: data.requireInteraction || false
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    const data = notification.data || {};
    
    notification.close();
    
    // Handle different actions
    if (action) {
        // Custom actions can be handled here
        console.log('Action clicked:', action);
    }
    
    // Default behavior - focus or open the relevant page
    if (data.url) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // Check if there's already a window open that can navigate to the URL
                for (const client of clientList) {
                    if (client.url === data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open or the URL is different, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(data.url);
                }
            })
        );
    }
});

// Fetch event - network first with cache fallback strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response as it can only be consumed once
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    // Only cache GET requests
                    if (event.request.method === 'GET') {
                        cache.put(event.request, responseClone);
                    }
                });
                return response;
            })
            .catch(() => {
                // Network failed, try to return from cache
                return caches.match(event.request);
            })
    );
});

// Sync event - for background syncing (offline support)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notifications') {
        event.waitUntil(
            // Implement syncing logic here 
            // For example, sending stored messages when back online
            self.syncPendingNotifications()
        );
    }
});

// Helper function to sync pending notifications
self.syncPendingNotifications = async () => {
    try {
        // This is where you would fetch pending notifications from IndexedDB 
        // and send them to your API
        console.log('Syncing pending notifications');
        
        // Example implementation:
        // const db = await openDB('notifications-store', 1);
        // const pendingNotifications = await db.getAll('pending');
        // for (const notification of pendingNotifications) {
        //   try {
        //     await fetch('/api/notifications/sync', {
        //       method: 'POST',
        //       headers: { 'Content-Type': 'application/json' },
        //       body: JSON.stringify(notification)
        //     });
        //     await db.delete('pending', notification.id);
        //   } catch (error) {
        //     console.error('Failed to sync notification:', error);
        //   }
        // }
        
        return true;
    } catch (error) {
        console.error('Failed to sync notifications:', error);
        return false;
    }
};

// Periodic sync for content updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    for (const request of requests) {
        try {
            const response = await fetch(request);
            await cache.put(request, response);
        } catch (error) {
            console.error('Update failed:', error);
        }
    }
}
