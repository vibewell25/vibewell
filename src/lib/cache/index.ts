/**
 * Consolidated Cache System
 *
 * This module provides a unified caching system for the VibeWell platform
 * with specialized caching strategies for different use cases:
 *
 * - API Cache: Local storage-based caching for API responses
 * - AR Model Cache: IndexedDB-based caching for AR models
 *
 * This unified approach simplifies importing and using the appropriate cache
 * while maintaining specialized implementations for different requirements.
 */

// Re-export everything from the specialized implementations
export * from './api-cache';
export * from './ar-cache';

// Export default instances for quick use
import { apiCache, cachedFetch } from './api-cache';
import { arModelCache } from './ar-cache';

// Create a unified cache interface
const cache = {
  // API caching
  api: apiCache,
  cachedFetch,

  // AR model caching
  ar: arModelCache,

  // Shared utilities
  clearAll: async () => {
    await apiCache.clear();
    await arModelCache.clearCache();
  },

  // Get storage usage statistics
  getStorageStats: async () => {
    const arStats = await arModelCache.getCacheStats();

    return {
      ar: {
        totalSize: arStats.totalSize,
        modelCount: arStats.modelCount,
        percentUsed: arStats.percentUsed,
      },
      // API cache stats are approximate since localStorage doesn't provide size info
      api: {
        entryCount:
          typeof localStorage !== 'undefined'
            ? Object.keys(localStorage).filter((key) => key.startsWith(apiCache.getNamespace()))
                .length
            : 0,
      },
    };
  },
};

export default cache;
