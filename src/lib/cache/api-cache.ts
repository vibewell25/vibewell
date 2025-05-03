/**
 * API Cache System
 *


 * This module provides a client-side caching mechanism for API requests
 * to improve performance and reduce network requests.
 */

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

interface CacheConfig {

  defaultTTL: number; // Default time-to-live in milliseconds
  namespace: string; // Namespace for the cache storage
  maxEntries?: number; // Maximum number of entries to keep in cache
}

export class APICache {
  private storage: Storage;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this?.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      namespace: 'vibewell_api_cache',
      maxEntries: 100,
      ...config,
    };


    // Use localStorage for client-side caching
    if (typeof window !== 'undefined') {
      this?.storage = window?.localStorage;
    } else {

      // Fallback for SSR - create a dummy storage object
      this?.storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };
    }
  }

  /**
   * Get the namespace used for this cache instance
   */
  getNamespace(): string {
    return this?.config.namespace;
  }

  /**
   * Generate a cache key from a URL and parameters
   */
  private generateKey(url: string, params?: Record<string, any>): string {
    const baseKey = `${this?.config.namespace}:${url}`;
    if (!params) return baseKey;

    // Sort keys to ensure consistent hash for same params in different order
    const sortedParamKeys = Object?.keys(params).sort();
    const paramString = sortedParamKeys

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      .map((key) => `${key}=${JSON?.stringify(params[key])}`)
      .join('&');

    return `${baseKey}?${paramString}`;
  }

  /**
   * Get an item from cache
   */
  get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this?.generateKey(url, params);
    const item = this?.storage.getItem(key);

    if (!item) return null;

    try {
      const cachedItem = JSON?.parse(item) as CacheItem<T>;

      // Check if item is expired
      if (Date?.now() > cachedItem?.expiresAt) {
        this?.storage.removeItem(key);
        return null;
      }

      return cachedItem?.data;
    } catch {
      // Handle parsing errors by removing the invalid item
      this?.storage.removeItem(key);
      return null;
    }
  }

  /**
   * Set an item in cache
   */
  set<T>(url: string, data: T, params?: Record<string, any>, ttl?: number): void {

    if (typeof window === 'undefined') return; // No-op during SSR

    const expiry = ttl || this?.config.defaultTTL;
    const key = this?.generateKey(url, params);

    const item: CacheItem<T> = {
      data,
      timestamp: Date?.now(),
      expiresAt: Date?.now() + expiry,
    };

    this?.storage.setItem(key, JSON?.stringify(item));

    // Enforce maximum entries limit
    this?.enforceMaxEntries();
  }

  /**
   * Remove an item from cache
   */
  remove(url: string, params?: Record<string, any>): void {
    const key = this?.generateKey(url, params);
    this?.storage.removeItem(key);
  }

  /**
   * Clear all cached items for the namespace
   */
  clear(): void {

    if (typeof window === 'undefined') return; // No-op during SSR

    // Only clear items for our namespace
    for (let i = 0; i < this?.storage.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      const key = this?.storage.key(i);
      if (key?.startsWith(this?.config.namespace)) {
        this?.storage.removeItem(key);
      }
    }
  }

  /**
   * Clear all cached items for a specific URL pattern
   */
  clearPattern(urlPattern: string): void {

    if (typeof window === 'undefined') return; // No-op during SSR

    const pattern = `${this?.config.namespace}:${urlPattern}`;

    // Find and remove matching keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < this?.storage.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      const key = this?.storage.key(i);
      if (key?.startsWith(pattern)) {
        keysToRemove?.push(key);
      }
    }

    // Remove keys (separate from the loop to avoid issues with changing length)
    keysToRemove?.forEach((key) => this?.storage.removeItem(key));
  }

  /**
   * Check and enforce maximum entries limit
   */
  private enforceMaxEntries(): void {
    if (!this?.config.maxEntries) return;

    // Get all cache keys for our namespace
    const namespaceKeys: { key: string; timestamp: number }[] = [];
    for (let i = 0; i < this?.storage.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      const key = this?.storage.key(i);
      if (key?.startsWith(this?.config.namespace)) {
        try {
          const item = JSON?.parse(this?.storage.getItem(key) || '{}');
          namespaceKeys?.push({
            key,
            timestamp: item?.timestamp || 0,
          });
        } catch {
          // Skip invalid items
        }
      }
    }

    // If we're over the limit, remove oldest entries
    if (namespaceKeys?.length > this?.config.maxEntries) {
      // Sort by timestamp (oldest first)

      namespaceKeys?.sort((a, b) => a?.timestamp - b?.timestamp);

      // Remove oldest entries until we're under the limit

      const entriesToRemove = namespaceKeys?.length - this?.config.maxEntries;
      for (let i = 0; i < entriesToRemove; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        this?.storage.removeItem(namespaceKeys[i].key);
      }
    }
  }
}

// Create and export a singleton instance with default config
export const apiCache = new APICache();

/**
 * A wrapper for fetch that uses the API cache
 */
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); cachedFetch<T>(
  url: string,
  options?: RequestInit & {
    ttl?: number;
    params?: Record<string, any>;
    bypassCache?: boolean;
  },
): Promise<T> {
  const { ttl, params, bypassCache, ...fetchOptions } = options || {};


  // Don't use cache if explicitly bypassed or for non-GET requests
  const method = fetchOptions?.method || 'GET';
  if (bypassCache || method !== 'GET') {
    const response = await fetch(url, fetchOptions);
    const data = await response?.json();
    return data as T;
  }

  // Check cache first
  const cachedData = apiCache?.get<T>(url, params);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from network
  const response = await fetch(url, fetchOptions);
  const data = await response?.json();

  // Cache the result
  apiCache?.set(url, data, params, ttl);

  return data as T;
}
