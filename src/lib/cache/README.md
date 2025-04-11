# VibeWell Cache System

This directory contains a consolidated cache implementation for the VibeWell platform, providing specialized caching strategies for different needs:

- **API Cache**: Lightweight localStorage-based caching for API responses
- **AR Model Cache**: Heavy-duty IndexedDB-based caching for AR models

## Architecture

The caching system is designed with a modular architecture:

```
cache/
├── index.ts         # Main exports and unified interface
├── api-cache.ts     # API response caching implementation 
├── ar-cache.ts      # AR model caching implementation
└── README.md        # This documentation
```

## Usage Examples

### Using the unified cache interface

```typescript
import cache from '@/lib/cache';

// Access API cache functionality
const userData = cache.api.get('user/profile');

// Use cachedFetch for automatic API response caching
const posts = await cache.cachedFetch('/api/posts');

// Access AR model cache
const modelData = await cache.ar.getModel('https://example.com/models/chair.glb', 'glb');

// Clear all caches
await cache.clearAll();

// Get storage statistics
const stats = await cache.getStorageStats();
console.log(`AR cache: ${stats.ar.modelCount} models, ${Math.round(stats.ar.totalSize / 1024 / 1024)}MB`);
console.log(`API cache: ${stats.api.entryCount} entries`);
```

### API Cache Usage

```typescript
import { apiCache, cachedFetch } from '@/lib/cache';

// Manually get/set items
const userData = apiCache.get('user/profile');
apiCache.set('user/profile', { name: 'John', role: 'admin' }, { ttl: 60 * 1000 });

// Use wrapper for fetch with automatic caching
const posts = await cachedFetch('/api/posts', { 
  ttl: 5 * 60 * 1000,  // 5 minute cache
  params: { limit: 10 } // Parameters for cache key generation
});

// Clear all cached items for a specific URL pattern
apiCache.clearPattern('/api/posts');

// Clear entire cache
apiCache.clear();
```

### AR Cache Usage

```typescript
import { arModelCache } from '@/lib/cache';

// Get a model from cache
const modelData = await arModelCache.getModel(modelUrl, 'glb');

// Add a model to cache
await arModelCache.addModel(modelUrl, 'glb', modelArrayBuffer);

// Prefetch models for better user experience
await arModelCache.prefetchModel('https://example.com/models/chair.glb', 'glb');

// Get cache statistics
const stats = await arModelCache.getCacheStats();
console.log(`Using ${stats.percentUsed.toFixed(2)}% of available storage`);

// Clear the entire cache
await arModelCache.clearCache();

// Update cache settings
await arModelCache.updateSettings({
  maxCacheSizeMB: 100, // Increase cache size to 100MB
  maxCacheAge: 7 * 24 * 60 * 60 * 1000 // Reduce max age to 7 days
});
```

## Storage Mechanisms

The cache implementations use different storage mechanisms based on their requirements:

- **API Cache**: Uses `localStorage` for small, frequently accessed data with simple string key-value storage
- **AR Model Cache**: Uses `IndexedDB` for large binary data (3D models) with complex querying and metadata

## Browser Compatibility

Both cache implementations include fallbacks for environments where storage may not be available (e.g., server-side rendering). 