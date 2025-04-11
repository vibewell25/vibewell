const CACHE_NAME = 'vibewell-cache-v2';
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

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)),
            caches.open(OFFLINE_CACHE).then(cache => cache.add('/offline.html'))
        ])
    );
});

// Fetch event with offline support
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                // Return cached response for other requests
                return caches.match(event.request);
            })
    );
});

// Background sync for failed requests
self.addEventListener('sync', event => {
    if (event.tag === 'sync-failed-requests') {
        event.waitUntil(syncFailedRequests());
    }
});

async function syncFailedRequests() {
    const failedRequests = await getFailedRequests();
    for (const request of failedRequests) {
        try {
            await fetch(request);
            await removeFailedRequest(request);
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}

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
