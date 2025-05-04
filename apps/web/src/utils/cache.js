/**
 * Cache utility for storing and managing optimized images
 */

const CACHE_PREFIX = 'vibewell:image:';
const CACHE_VERSION = 'v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

class ImageCache {
  constructor() {
    this.cacheAvailable = typeof caches !== 'undefined';
    this.cacheName = `${CACHE_PREFIX}${CACHE_VERSION}`;
  }

  /**
   * Get cache storage
   * @returns {Promise<Cache>}
   */
  async getCacheStorage() {
    if (!this.cacheAvailable) return null;
    return await caches.open(this.cacheName);
  }

  /**
   * Get an image from cache
   * @param {string} url
   * @returns {Promise<string|null>}
   */
  async get(url) {
    try {
      const cache = await this.getCacheStorage();
      if (!cache) return null;

      const response = await cache.match(url);
      if (!response) return null;

      // Check if cache has expired

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const cachedDate = response.headers.get('x-cached-date');
      if (cachedDate) {
        const cacheAge = Date.now() - new Date(cachedDate).getTime();
        if (cacheAge > CACHE_EXPIRY) {
          await this.delete(url);
          return null;
        }
      }

      return response.url;
    } catch (error) {
      console.error('Error getting image from cache:', error);
      return null;
    }
  }

  /**
   * Store an image in cache
   * @param {string} url
   * @param {string} imageUrl
   * @returns {Promise<boolean>}
   */
  async set(url, imageUrl) {
    try {
      const cache = await this.getCacheStorage();
      if (!cache) return false;

      // Check cache size before adding
      await this.maintainCacheSize();

      // Create a response with cache metadata
      const headers = new Headers({

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'x-cached-date': new Date().toISOString(),

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'x-cache-version': CACHE_VERSION,
      });

      const response = new Response(await fetch(imageUrl), { headers });
      await cache.put(url, response);

      return true;
    } catch (error) {
      console.error('Error caching image:', error);
      return false;
    }
  }

  /**
   * Delete an image from cache
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  async delete(url) {
    try {
      const cache = await this.getCacheStorage();
      if (!cache) return false;

      await cache.delete(url);
      return true;
    } catch (error) {
      console.error('Error deleting image from cache:', error);
      return false;
    }
  }

  /**
   * Clear all cached images
   * @returns {Promise<boolean>}
   */
  async clear() {
    try {
      if (!this.cacheAvailable) return false;
      await caches.delete(this.cacheName);
      return true;
    } catch (error) {
      console.error('Error clearing image cache:', error);
      return false;
    }
  }

  /**
   * Maintain cache size within limits
   * @returns {Promise<void>}
   */
  async maintainCacheSize() {
    try {
      const cache = await this.getCacheStorage();
      if (!cache) return;

      const keys = await cache.keys();
      let totalSize = 0;

      // Calculate current cache size
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += blob.size;
        }
      }

      // If cache is too large, remove oldest items
      if (totalSize > MAX_CACHE_SIZE) {

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        const itemsToRemove = keys.slice(0, Math.ceil(keys.length * 0.2)); // Remove 20% of items
        await Promise.all(itemsToRemove.map((key) => cache.delete(key)));
      }
    } catch (error) {
      console.error('Error maintaining cache size:', error);
    }
  }
}

/**
 * Create and return a new image cache instance
 * @returns {ImageCache}
 */
export const createImageCache = () => {
  return new ImageCache();
};

export default {
  createImageCache,
};
