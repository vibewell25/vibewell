#!/bin/bash

# Offline Support and Advanced Gestures Implementation Script

# Configuration
SERVICE_WORKER_FILE="public/sw.js"
MANIFEST_FILE="public/manifest.json"
GESTURES_FILE="src/lib/gestures.ts"

# Function to enhance service worker
enhance_service_worker() {
    echo "Enhancing service worker for offline support..."
    
    cat > $SERVICE_WORKER_FILE << 'EOL'
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
EOL
}

# Function to update manifest
update_manifest() {
    echo "Updating web app manifest..."
    
    cat > $MANIFEST_FILE << 'EOL'
{
    "name": "Vibewell",
    "short_name": "Vibewell",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "prefer_related_applications": false,
    "offline_enabled": true,
    "background_sync": {
        "periodic_sync": {
            "min_period": 3600
        }
    }
}
EOL
}

# Function to implement advanced gestures
implement_gestures() {
    echo "Implementing advanced gestures..."
    
    cat > $GESTURES_FILE << 'EOL'
import { useCallback, useEffect, useRef } from 'react';

interface GestureConfig {
    threshold?: number;
    timeout?: number;
    preventDefault?: boolean;
}

export const useSwipeGesture = (
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
    config: GestureConfig = {}
) => {
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const { threshold = 50, timeout = 300, preventDefault = true } = config;

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }, [preventDefault]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        if (!touchStart.current) return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const diffX = touchEnd.x - touchStart.current.x;
        const diffY = touchEnd.y - touchStart.current.y;

        if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
            if (Math.abs(diffX) > Math.abs(diffY)) {
                onSwipe(diffX > 0 ? 'right' : 'left');
            } else {
                onSwipe(diffY > 0 ? 'down' : 'up');
            }
        }

        touchStart.current = null;
    }, [onSwipe, threshold, preventDefault]);

    useEffect(() => {
        const element = document.documentElement;
        element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
        element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd, preventDefault]);
};

export const usePinchGesture = (
    onPinch: (scale: number) => void,
    config: GestureConfig = {}
) => {
    const initialDistance = useRef<number | null>(null);
    const { threshold = 0.1, preventDefault = true } = config;

    const getDistance = (touches: TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        if (e.touches.length === 2) {
            initialDistance.current = getDistance(e.touches);
        }
    }, [preventDefault]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        if (e.touches.length === 2 && initialDistance.current) {
            const currentDistance = getDistance(e.touches);
            const scale = currentDistance / initialDistance.current;
            if (Math.abs(scale - 1) > threshold) {
                onPinch(scale);
            }
        }
    }, [onPinch, threshold, preventDefault]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (preventDefault) e.preventDefault();
        initialDistance.current = null;
    }, [preventDefault]);

    useEffect(() => {
        const element = document.documentElement;
        element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
        element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
        element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);
};
EOL
}

# Main execution
echo "Starting offline support and gestures implementation..."

# Enhance service worker
enhance_service_worker

# Update manifest
update_manifest

# Implement gestures
implement_gestures

echo "Implementation completed"
echo "Offline support and advanced gestures are now available" 