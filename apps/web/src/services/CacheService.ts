import { logger } from '@/lib/logger';

/**
 * Generic cache item interface with TTL support
 */
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry: number | null; // null means no expiry
}

/**
 * Cache options for configuration
 */
interface CacheOptions {
  defaultTTL?: number | null; // Time to live in milliseconds, null means no expiry
  maxSize?: number; // Maximum number of items in cache
  storageType?: 'memory' | 'localStorage' | 'sessionStorage';
  namespace?: string; // Namespace for localStorage/sessionStorage keys
}

/**
 * Storage interface for different storage backends
 */
interface StorageAdapter<T> {
  get(key: string): CacheItem<T> | undefined;
  set(key: string, item: CacheItem<T>): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
  size(): number;
}

/**
 * Memory storage adapter
 */
class MemoryStorage<T> implements StorageAdapter<T> {
  private storage = new Map<string, CacheItem<T>>();

  get(key: string): CacheItem<T> | undefined {
    return this.storage.get(key);
  }

  set(key: string, item: CacheItem<T>): void {
    this.storage.set(key, item);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): string[] {
    return Array.from(this.storage.keys());
  }

  size(): number {
    return this.storage.size;
  }
}

/**
 * Web Storage adapter (localStorage/sessionStorage)
 */
class WebStorage<T> implements StorageAdapter<T> {
  private storage: Storage;
  private namespace: string;

  constructor(storageType: 'localStorage' | 'sessionStorage', namespace: string = 'vw_cache') {
    this.storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    this.namespace = namespace;
  }

  private getNamespacedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  get(key: string): CacheItem<T> | undefined {
    try {
      const value = this.storage.getItem(this.getNamespacedKey(key));
      if (value) {
        return JSON.parse(value) as CacheItem<T>;
      }
    } catch (error) {
      logger.error('Error retrieving item from WebStorage', 'CacheService', { error, key });
    }
    return undefined;
  }

  set(key: string, item: CacheItem<T>): void {
    try {
      this.storage.setItem(this.getNamespacedKey(key), JSON.stringify(item));
    } catch (error) {
      logger.error('Error setting item in WebStorage', 'CacheService', { error, key });
      // If storage is full, evict some items
      if (error instanceof DOMException && (
        error.code === 22 || // Chrome quota error
        error.code === 1014 || // Firefox quota error
        error.name === 'QuotaExceededError'
      )) {
        this.evictOldItems();
        try {
          // Try again after eviction
          this.storage.setItem(this.getNamespacedKey(key), JSON.stringify(item));
        } catch (retryError) {
          logger.error('Failed to set item after eviction', 'CacheService', { error: retryError, key });
        }
      }
    }
  }

  delete(key: string): void {
    this.storage.removeItem(this.getNamespacedKey(key));
  }

  clear(): void {
    // Only clear keys with our namespace
    const keysToRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(`${this.namespace}:`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => this.storage.removeItem(key));
  }

  keys(): string[] {
    const result: string[] = [];
    const prefix = `${this.namespace}:`;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(prefix)) {
        result.push(key.substring(prefix.length));
      }
    }
    return result;
  }

  size(): number {
    return this.keys().length;
  }

  private evictOldItems(): void {
    const keys = this.keys();
    if (keys.length === 0) return;

    // Get items with their timestamps
    const items = keys.map(key => {
      const item = this.get(key);
      return {
        key,
        timestamp: item?.timestamp || 0
      };
    });

    // Sort by timestamp (oldest first) and remove the oldest 20%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const itemsToRemove = Math.max(1, Math.floor(items.length * 0.2));
    
    for (let i = 0; i < itemsToRemove; i++) {
      this.delete(items[i].key);
    }
    
    logger.info(`Evicted ${itemsToRemove} items from WebStorage`, 'CacheService');
  }
}

/**
 * CacheService for efficiently caching data
 * 
 * This service provides a flexible caching mechanism with:
 * - Memory and Web Storage backends
 * - TTL (Time-To-Live) support
 * - LRU (Least Recently Used) eviction
 * - Size limiting
 * - Namespacing for different application domains
 */
export class CacheService<T = any> {
  private storage: StorageAdapter<T>;
  private options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Create a new cache service instance
   */
  constructor(options: CacheOptions = {}) {
    // Default options
    this.options = {
      defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 100,
      storageType: options.storageType ?? 'memory',
      namespace: options.namespace ?? 'vw_cache'
    };

    // Initialize storage
    if (this.options.storageType === 'memory') {
      this.storage = new MemoryStorage<T>();
    } else {
      // Only create WebStorage in browser environment
      if (typeof window !== 'undefined') {
        this.storage = new WebStorage<T>(this.options.storageType, this.options.namespace);
      } else {
        // Fallback to memory storage in non-browser environments
        this.storage = new MemoryStorage<T>();
        logger.warn(
          `WebStorage not available, falling back to memory storage`,
          'CacheService'
        );
      }
    }

    // Start automatic cleanup if we have TTL
    if (this.options.defaultTTL !== null) {
      this.startCleanupInterval();
    }
  }

  /**
   * Get an item from the cache
   * 
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.storage.get(key);
    
    if (!item) return undefined;

    // Check if expired
    if (item.expiry !== null && Date.now() > item.expiry) {
      this.delete(key);
      return undefined;
    }

    // Update timestamp for LRU
    this.storage.set(key, {
      ...item,
      timestamp: Date.now()
    });

    return item.value;
  }

  /**
   * Set an item in the cache
   * 
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Optional TTL in milliseconds
   */
  set(key: string, value: T, ttl?: number | null): void {
    // Calculate expiry time
    const expiry = ttl !== undefined
      ? (ttl === null ? null : Date.now() + ttl)
      : (this.options.defaultTTL === null ? null : Date.now() + this.options.defaultTTL);

    // Check if we need to evict items due to size limit
    if (this.storage.size() >= this.options.maxSize) {
      this.evictLRU();
    }

    this.storage.set(key, {
      value,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Check if a key exists in the cache and is not expired
   * 
   * @param key The cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.storage.get(key);
    if (!item) return false;
    if (item.expiry !== null && Date.now() > item.expiry) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete an item from the cache
   * 
   * @param key The cache key
   */
  delete(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.storage.size();
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return this.storage.keys();
  }

  /**
   * Get a cached value or compute it if not present
   * 
   * @param key The cache key
   * @param factory Function to compute the value if not in cache
   * @param ttl Optional TTL for the cached value
   * @returns The cached or computed value
   */
  async getOrCompute(key: string, factory: () => Promise<T>, ttl?: number | null): Promise<T> {
    const cachedValue = this.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    try {
      const value = await factory();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error('Error computing cached value', 'CacheService', { error, key });
      throw error;
    }
  }

  /**
   * Dispose of the cache service and clean up resources
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Start the cleanup interval to remove expired items
   */
  private startCleanupInterval(): void {
    // Clean up every 5 minutes
    const CLEANUP_INTERVAL = 5 * 60 * 1000;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
    
    // Ensure the interval doesn't prevent the process from exiting
    if (this.cleanupInterval && this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Remove expired items from the cache
   */
  private cleanup(): void {
    const keys = this.storage.keys();
    let removed = 0;

    for (const key of keys) {
      const item = this.storage.get(key);
      if (item && item.expiry !== null && Date.now() > item.expiry) {
        this.storage.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.debug(`Removed ${removed} expired items from cache`, 'CacheService');
    }
  }

  /**
   * Evict least recently used items when the cache is full
   */
  private evictLRU(): void {
    const keys = this.storage.keys();
    if (keys.length === 0) return;

    // Get all items with their timestamps
    const items = keys.map(key => {
      const item = this.storage.get(key);
      return {
        key,
        timestamp: item?.timestamp || 0
      };
    });

    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest items to get below 80% capacity
    const targetSize = Math.floor(this.options.maxSize * 0.8);
    const itemsToRemove = Math.max(1, items.length - targetSize);
    
    for (let i = 0; i < itemsToRemove; i++) {
      this.storage.delete(items[i].key);
    }
    
    logger.debug(`Evicted ${itemsToRemove} LRU items from cache`, 'CacheService');
  }
}

// Create singleton instances for common use cases
export const memoryCache = new CacheService({ storageType: 'memory', namespace: 'memory' });
export const localStorageCache = new CacheService({ storageType: 'localStorage', namespace: 'local' });
export const sessionStorageCache = new CacheService({ storageType: 'sessionStorage', namespace: 'session' });

/**
 * Get a cache instance with a specific namespace
 * 
 * @param namespace The cache namespace
 * @param storageType The storage type to use
 * @returns A new CacheService instance
 */
export function getNamespacedCache<T = any>(
  namespace: string, 
  storageType: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'
): CacheService<T> {
  return new CacheService<T>({ namespace, storageType });
}

export default CacheService; 