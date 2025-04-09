/**
 * AR Model Caching System
 * 
 * Enhanced caching system for AR models with:
 * - IndexedDB storage for persistence between sessions
 * - Automatic cache invalidation for model updates
 * - Dynamic storage limits based on device capabilities
 * - Prefetching for likely-to-be-used models
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb';

// Define the database schema
interface ARModelCacheDB extends DBSchema {
  models: {
    key: string;
    value: {
      url: string;
      type: string;
      data: Uint8Array;
      timestamp: number;
      size: number;
      version: number;
      lastAccessed: number;
      accessCount: number;
    };
    indexes: {
      'by-type': string;
      'by-timestamp': number;
      'by-last-accessed': number;
      'by-access-count': number;
    };
  };
  metadata: {
    key: string;
    value: {
      totalSize: number;
      lastCleanup: number;
      deviceQuota: number;
      version: number;
      settings: {
        maxCacheSizeMB: number;
        maxCacheAge: number;
        prefetchEnabled: boolean;
        autoCleanup: boolean;
      };
    };
  };
}

// Current cache version - increment when model format changes to invalidate all previous models
const CACHE_VERSION = 1;

// Default cache settings
const DEFAULT_SETTINGS = {
  maxCacheSizeMB: 50, // 50 MB default maximum cache size
  maxCacheAge: 30 * 24 * 60 * 60 * 1000, // 30 days default maximum age
  prefetchEnabled: true,
  autoCleanup: true,
};

// Event emitter for cache events
type CacheEventType = 'hit' | 'miss' | 'add' | 'remove' | 'clear' | 'error' | 'cleanup' | 'prefetch';
type CacheEventCallback = (event: CacheEvent) => void;

interface CacheEvent {
  type: CacheEventType;
  url?: string;
  modelType?: string;
  size?: number;
  error?: Error;
  details?: any;
}

/**
 * AR Model Cache Manager
 * Enhanced caching system for AR models using IndexedDB
 */
export class ARModelCache {
  private dbPromise: Promise<IDBPDatabase<ARModelCacheDB>> | null = null;
  private DB_NAME = 'ar-model-cache';
  private DB_VERSION = 1;
  private isInitialized = false;
  private eventListeners: Record<CacheEventType, CacheEventCallback[]> = {
    hit: [],
    miss: [],
    add: [],
    remove: [],
    clear: [],
    error: [],
    cleanup: [],
    prefetch: [],
  };
  
  private memoryCache = new Map<string, Uint8Array>();
  private prefetchQueue: string[] = [];
  private isPrefetching = false;
  
  constructor() {
    this.initDB();
    this.estimateDeviceStorage();
    
    // Set up periodic cache maintenance
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onOnline.bind(this));
      
      // Use idle callback for maintenance if available
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(this.performMaintenance.bind(this));
      } else {
        setTimeout(this.performMaintenance.bind(this), 30000);
      }
    }
  }
  
  /**
   * Initialize the IndexedDB database
   */
  private async initDB(): Promise<void> {
    try {
      if (!this.dbPromise) {
        this.dbPromise = openDB<ARModelCacheDB>(this.DB_NAME, this.DB_VERSION, {
          upgrade: (db, oldVersion) => {
            // Create stores if they don't exist
            if (!db.objectStoreNames.contains('models')) {
              const modelStore = db.createObjectStore('models', { keyPath: 'url' });
              modelStore.createIndex('by-type', 'type');
              modelStore.createIndex('by-timestamp', 'timestamp');
              modelStore.createIndex('by-last-accessed', 'lastAccessed');
              modelStore.createIndex('by-access-count', 'accessCount');
            }
            
            if (!db.objectStoreNames.contains('metadata')) {
              db.createObjectStore('metadata', { keyPath: 'key' });
            }
            
            // Initialize metadata if upgrading from no previous version
            if (oldVersion === 0) {
              const metadataStore = db.transaction('metadata', 'readwrite').objectStore('metadata');
              metadataStore.put({
                key: 'cache-stats',
                totalSize: 0,
                lastCleanup: Date.now(),
                deviceQuota: 50 * 1024 * 1024, // Default 50MB until estimated
                version: CACHE_VERSION,
                settings: DEFAULT_SETTINGS,
              });
            }
          },
        });
        
        // Wait for DB to be ready
        await this.dbPromise;
        this.isInitialized = true;
        
        // Estimate device storage on initialization
        this.estimateDeviceStorage();
      }
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error initializing cache') 
      });
    }
  }
  
  /**
   * Get a model from the cache
   * @param url Model URL
   * @param type Model type
   * @param onProgress Progress callback
   * @returns Promise resolving to the model data or null if not found
   */
  async getModel(url: string, type: string, onProgress?: (progress: number) => void): Promise<Uint8Array | null> {
    if (!url) {
      throw new Error('URL is required');
    }
    
    try {
      // Check memory cache first for fastest access
      if (this.memoryCache.has(url)) {
        const data = this.memoryCache.get(url)!;
        this.emitEvent('hit', { url, modelType: type, size: data.byteLength });
        this.updateModelMetadata(url);
        return data;
      }
      
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      // Check IndexedDB cache
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const model = await db.get('models', url);
      
      // Cache hit
      if (model && model.data) {
        // Check if model version matches current version
        if (model.version !== CACHE_VERSION) {
          // Model format has changed, remove outdated entry
          await this.removeModel(url);
          this.emitEvent('miss', { url, modelType: type, details: 'version-mismatch' });
          return null;
        }
        
        // Cache hit - update metadata and return data
        this.memoryCache.set(url, model.data);
        this.updateModelMetadata(url);
        this.emitEvent('hit', { url, modelType: type, size: model.data.byteLength });
        return model.data;
      }
      
      // Cache miss
      this.emitEvent('miss', { url, modelType: type });
      return null;
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error getting model'),
        url,
        modelType: type
      });
      return null;
    }
  }
  
  /**
   * Add a model to the cache
   * @param url Model URL
   * @param type Model type
   * @param data Model data
   * @returns Promise resolving to success status
   */
  async addModel(url: string, type: string, data: Uint8Array): Promise<boolean> {
    if (!url || !data) {
      throw new Error('URL and data are required');
    }
    
    try {
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Get current cache stats
      const stats = await this.getCacheStats();
      const modelSize = data.byteLength;
      
      // Check if adding this model would exceed the cache limit
      if (stats.totalSize + modelSize > stats.settings.maxCacheSizeMB * 1024 * 1024) {
        // Need to make room - clean up older or less used models
        await this.makeRoom(modelSize);
      }
      
      // Update stats
      stats.totalSize += modelSize;
      
      // Add to memory cache
      this.memoryCache.set(url, data);
      
      // Add to IndexedDB
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      await tx.objectStore('models').put({
        url,
        type,
        data,
        timestamp: Date.now(),
        size: modelSize,
        version: CACHE_VERSION,
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      // Update metadata
      await tx.objectStore('metadata').put({
        key: 'cache-stats',
        ...stats,
        totalSize: stats.totalSize,
      });
      
      await tx.done;
      
      this.emitEvent('add', { url, modelType: type, size: modelSize });
      return true;
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error adding model'),
        url,
        modelType: type 
      });
      return false;
    }
  }
  
  /**
   * Remove a model from the cache
   * @param url Model URL
   * @returns Promise resolving to success status
   */
  async removeModel(url: string): Promise<boolean> {
    try {
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Remove from memory cache
      this.memoryCache.delete(url);
      
      // Get model to determine size
      const model = await db.get('models', url);
      if (!model) {
        return false; // Model not in cache
      }
      
      // Get current stats
      const stats = await this.getCacheStats();
      
      // Update stats
      stats.totalSize -= model.size;
      
      // Remove from IndexedDB
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      await tx.objectStore('models').delete(url);
      
      // Update metadata
      await tx.objectStore('metadata').put({
        key: 'cache-stats',
        ...stats,
        totalSize: Math.max(0, stats.totalSize),
      });
      
      await tx.done;
      
      this.emitEvent('remove', { url, modelType: model.type, size: model.size });
      return true;
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error removing model'),
        url 
      });
      return false;
    }
  }
  
  /**
   * Clear the entire cache
   * @returns Promise resolving to success status
   */
  async clearCache(): Promise<boolean> {
    try {
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Clear memory cache
      this.memoryCache.clear();
      
      // Get current stats
      const stats = await this.getCacheStats();
      
      // Reset stats
      stats.totalSize = 0;
      stats.lastCleanup = Date.now();
      
      // Clear all models
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      await tx.objectStore('models').clear();
      
      // Update metadata
      await tx.objectStore('metadata').put({
        key: 'cache-stats',
        ...stats,
        totalSize: 0,
      });
      
      await tx.done;
      
      this.emitEvent('clear', {});
      return true;
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error clearing cache') 
      });
      return false;
    }
  }
  
  /**
   * Prefetch a model for future use
   * @param url Model URL
   * @param type Model type
   * @param priority Higher values are fetched first (1-10)
   * @returns Promise resolving when prefetch is queued
   */
  async prefetchModel(url: string, type: string, priority: number = 5): Promise<void> {
    // Check settings
    const stats = await this.getCacheStats();
    if (!stats.settings.prefetchEnabled) {
      return;
    }
    
    // Check if already cached
    const cached = await this.getModel(url, type);
    if (cached) {
      return;
    }
    
    // Add to prefetch queue with priority
    const prefetchItem = { url, type, priority };
    this.prefetchQueue.push(JSON.stringify(prefetchItem));
    
    // Start prefetching if not already in progress
    if (!this.isPrefetching) {
      this.processPrefetchQueue();
    }
  }
  
  /**
   * Process the prefetch queue
   * @private
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.prefetchQueue.length === 0 || this.isPrefetching) {
      return;
    }
    
    this.isPrefetching = true;
    
    try {
      // Get next item from queue
      const itemJson = this.prefetchQueue.shift();
      if (!itemJson) {
        this.isPrefetching = false;
        return;
      }
      
      const { url, type } = JSON.parse(itemJson);
      
      // Check if already cached
      const cached = await this.getModel(url, type);
      if (cached) {
        // Already cached, skip
        this.isPrefetching = false;
        this.processPrefetchQueue();
        return;
      }
      
      // Prefetch the model
      this.emitEvent('prefetch', { url, modelType: type });
      
      try {
        // Fetch with lower priority
        const response = await fetch(url, { priority: 'low' as RequestPriority });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        // Get array buffer
        const buffer = await response.arrayBuffer();
        const data = new Uint8Array(buffer);
        
        // Store in cache
        await this.addModel(url, type, data);
      } catch (error) {
        this.emitEvent('error', { 
          error: error instanceof Error ? error : new Error('Prefetch failed'),
          url,
          modelType: type,
          details: 'prefetch' 
        });
      }
    } finally {
      this.isPrefetching = false;
      
      // Continue processing queue if items remain
      if (this.prefetchQueue.length > 0) {
        // Add a small delay to avoid overwhelming the network
        setTimeout(() => this.processPrefetchQueue(), 1000);
      }
    }
  }
  
  /**
   * Get cache statistics
   * @returns Promise resolving to cache stats
   */
  async getCacheStats(): Promise<{
    totalSize: number;
    lastCleanup: number;
    deviceQuota: number;
    version: number;
    modelCount: number;
    percentUsed: number;
    settings: typeof DEFAULT_SETTINGS;
  }> {
    try {
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Get metadata
      let metadata = await db.get('metadata', 'cache-stats');
      
      // If metadata doesn't exist, create default
      if (!metadata) {
        metadata = {
          key: 'cache-stats',
          totalSize: 0,
          lastCleanup: Date.now(),
          deviceQuota: 50 * 1024 * 1024, // Default 50MB
          version: CACHE_VERSION,
          settings: DEFAULT_SETTINGS,
        };
        
        await db.put('metadata', metadata);
      }
      
      // Get model count
      const modelCount = await db.count('models');
      
      // Calculate percentage used
      const percentUsed = metadata.deviceQuota > 0
        ? (metadata.totalSize / metadata.deviceQuota) * 100
        : 0;
      
      return {
        totalSize: metadata.totalSize,
        lastCleanup: metadata.lastCleanup,
        deviceQuota: metadata.deviceQuota,
        version: metadata.version,
        modelCount,
        percentUsed,
        settings: metadata.settings,
      };
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error getting cache stats') 
      });
      
      // Return default stats on error
      return {
        totalSize: 0,
        lastCleanup: Date.now(),
        deviceQuota: 50 * 1024 * 1024,
        version: CACHE_VERSION,
        modelCount: 0,
        percentUsed: 0,
        settings: DEFAULT_SETTINGS,
      };
    }
  }
  
  /**
   * Update cache settings
   * @param settings Partial settings to update
   * @returns Promise resolving to success status
   */
  async updateSettings(settings: Partial<typeof DEFAULT_SETTINGS>): Promise<boolean> {
    try {
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Get current stats
      const stats = await this.getCacheStats();
      
      // Update settings
      stats.settings = {
        ...stats.settings,
        ...settings,
      };
      
      // Save updated settings
      await db.put('metadata', {
        key: 'cache-stats',
        ...stats,
      });
      
      return true;
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error updating settings') 
      });
      return false;
    }
  }
  
  /**
   * Make room in the cache for a new model of specified size
   * @param requiredSize Size in bytes needed
   * @private
   */
  private async makeRoom(requiredSize: number): Promise<void> {
    try {
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Get current stats
      const stats = await this.getCacheStats();
      
      // Calculate how much space we need to free
      const maxSize = stats.settings.maxCacheSizeMB * 1024 * 1024;
      const currentSize = stats.totalSize;
      const targetSize = Math.max(0, currentSize + requiredSize - maxSize);
      
      if (targetSize <= 0) {
        // No need to free space
        return;
      }
      
      // Get all models sorted by last accessed (oldest first)
      const tx = db.transaction('models', 'readwrite');
      const store = tx.objectStore('models');
      const index = store.index('by-last-accessed');
      const models = await index.getAll();
      
      // Sort by a combination of recency and access count
      // - Least recently used models with fewest accesses are removed first
      models.sort((a, b) => {
        // Calculate a score based on recency and access count
        // Higher score = more likely to keep
        const scoreA = (a.lastAccessed / 1000) + (a.accessCount * 60);
        const scoreB = (b.lastAccessed / 1000) + (b.accessCount * 60);
        return scoreA - scoreB; // Ascending order, lowest scores first
      });
      
      let freedSpace = 0;
      const modelsToRemove: string[] = [];
      
      // Remove models until we have enough space
      for (const model of models) {
        if (freedSpace >= targetSize) {
          break;
        }
        
        freedSpace += model.size;
        modelsToRemove.push(model.url);
        
        // Also remove from memory cache
        this.memoryCache.delete(model.url);
      }
      
      // Remove the models from IndexedDB
      for (const url of modelsToRemove) {
        await store.delete(url);
      }
      
      // Update metadata
      const newTotalSize = Math.max(0, currentSize - freedSpace);
      await db.put('metadata', {
        key: 'cache-stats',
        ...stats,
        totalSize: newTotalSize,
        lastCleanup: Date.now(),
      });
      
      this.emitEvent('cleanup', { 
        details: {
          freedSpace,
          modelsRemoved: modelsToRemove.length
        } 
      });
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error making room in cache') 
      });
    }
  }
  
  /**
   * Update model metadata (last accessed, access count)
   * @param url Model URL
   * @private
   */
  private async updateModelMetadata(url: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      if (!db) {
        return;
      }
      
      const tx = db.transaction('models', 'readwrite');
      const store = tx.objectStore('models');
      const model = await store.get(url);
      
      if (model) {
        model.lastAccessed = Date.now();
        model.accessCount += 1;
        await store.put(model);
      }
      
      await tx.done;
    } catch (error) {
      // Silently fail - this is non-critical
      console.warn('Error updating model metadata:', error);
    }
  }
  
  /**
   * Perform periodic cache maintenance
   * @private
   */
  private async performMaintenance(): Promise<void> {
    try {
      // Get cache stats
      const stats = await this.getCacheStats();
      
      // Skip if automatic cleanup is disabled
      if (!stats.settings.autoCleanup) {
        return;
      }
      
      // Check if maintenance is needed
      const now = Date.now();
      const lastCleanup = stats.lastCleanup || 0;
      const cleanupInterval = 24 * 60 * 60 * 1000; // Once per day
      
      if (now - lastCleanup < cleanupInterval) {
        // Not time for maintenance yet
        return;
      }
      
      // Ensure DB is initialized
      if (!this.isInitialized) {
        await this.initDB();
      }
      
      const db = await this.dbPromise;
      if (!db) {
        return;
      }
      
      // Get models older than maxCacheAge
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      const store = tx.objectStore('models');
      const index = store.index('by-timestamp');
      const maxAge = stats.settings.maxCacheAge || (30 * 24 * 60 * 60 * 1000);
      const cutoffTimestamp = now - maxAge;
      
      // Get outdated models
      const outdatedModels = await index.getAllKeys(IDBKeyRange.upperBound(cutoffTimestamp));
      
      // Remove outdated models
      let cleanedSize = 0;
      for (const key of outdatedModels) {
        const model = await store.get(key);
        if (model) {
          cleanedSize += model.size;
          await store.delete(key);
          
          // Also remove from memory cache
          this.memoryCache.delete(model.url);
        }
      }
      
      // Update metadata
      await tx.objectStore('metadata').put({
        key: 'cache-stats',
        ...stats,
        totalSize: Math.max(0, stats.totalSize - cleanedSize),
        lastCleanup: now,
      });
      
      await tx.done;
      
      this.emitEvent('cleanup', { 
        details: {
          cleanedSize,
          modelsRemoved: outdatedModels.length,
          reason: 'age'
        } 
      });
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error during maintenance') 
      });
    }
  }
  
  /**
   * Estimate available device storage
   * @private
   */
  private async estimateDeviceStorage(): Promise<void> {
    try {
      // Skip if not in browser
      if (typeof navigator === 'undefined') {
        return;
      }
      
      // Try to use the Storage API if available
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate && estimate.quota) {
          const quota = estimate.quota;
          const usage = estimate.usage || 0;
          
          // Calculate a reasonable cache size (5% of available storage)
          const availableStorage = quota - usage;
          const recommendedCacheSize = Math.floor(availableStorage * 0.05);
          
          // Limit to a reasonable value (between 10MB and 500MB)
          const cacheSizeMB = Math.min(500, Math.max(10, Math.floor(recommendedCacheSize / (1024 * 1024))));
          
          // Update settings
          await this.updateSettings({
            maxCacheSizeMB: cacheSizeMB,
          });
          
          // Update device quota in stats
          const db = await this.dbPromise;
          if (db) {
            const stats = await this.getCacheStats();
            await db.put('metadata', {
              ...stats,
              key: 'cache-stats',
              deviceQuota: quota,
            });
          }
        }
      }
    } catch (error) {
      // Silently fail - this is non-critical
      console.warn('Error estimating device storage:', error);
    }
  }
  
  /**
   * Handle coming online - process any pending prefetch queue
   * @private
   */
  private onOnline(): void {
    if (this.prefetchQueue.length > 0 && !this.isPrefetching) {
      this.processPrefetchQueue();
    }
  }
  
  /**
   * Add an event listener
   * @param event Event type
   * @param callback Callback function
   */
  addEventListener(event: CacheEventType, callback: CacheEventCallback): void {
    if (event in this.eventListeners) {
      this.eventListeners[event].push(callback);
    }
  }
  
  /**
   * Remove an event listener
   * @param event Event type
   * @param callback Callback function
   */
  removeEventListener(event: CacheEventType, callback: CacheEventCallback): void {
    if (event in this.eventListeners) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (listener) => listener !== callback
      );
    }
  }
  
  /**
   * Emit an event
   * @param event Event type
   * @param data Event data
   * @private
   */
  private emitEvent(event: CacheEventType, data: Partial<CacheEvent>): void {
    if (event in this.eventListeners) {
      const eventData: CacheEvent = {
        type: event,
        ...data,
      };
      
      this.eventListeners[event].forEach((listener) => {
        try {
          listener(eventData);
        } catch (error) {
          console.error('Error in cache event listener:', error);
        }
      });
    }
  }
}

// Create and export a singleton instance
export const arModelCache = new ARModelCache(); 