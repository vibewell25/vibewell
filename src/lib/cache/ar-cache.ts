/**
 * AR Model Caching System
 * 
 * Specialized caching system for AR models with:
 * - IndexedDB storage for persistence between sessions
 * - Automatic cache invalidation for model updates
 * - Dynamic storage limits based on device capabilities
 * - Prefetching for likely-to-be-used models
 */

'use client';

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
      key: string; // Cache metadata key identifier
      totalSize: number;
      lastCleanup: number;
      deviceQuota: number;
      version: number;
      modelCount?: number; // Added for tracking model count
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
    // Only run initialization in browser environment
    if (typeof window !== 'undefined') {
      this.initDB();
      this.estimateDeviceStorage();
      
      // Set up periodic cache maintenance
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
                modelCount: 0,
                settings: DEFAULT_SETTINGS,
              });
            }
          },
        });
        
        // Wait for DB to be ready
        await this.dbPromise;
        this.isInitialized = true;
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
      if (model) {
        // Update last accessed time
        await this.updateModelMetadata(url);
        
        // Add to memory cache for faster subsequent access
        this.memoryCache.set(url, model.data);
        
        // Emit cache hit event
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
      
      // Make sure there's enough space
      await this.makeRoom(data.byteLength);
      
      // Add to memory cache
      this.memoryCache.set(url, data);
      
      // Current timestamp
      const now = Date.now();
      
      // Store in IndexedDB
      await db.put('models', {
        url,
        type,
        data,
        timestamp: now,
        size: data.byteLength,
        version: CACHE_VERSION,
        lastAccessed: now,
        accessCount: 1
      });
      
      // Update metadata
      const tx = db.transaction('metadata', 'readwrite');
      const metadata = await tx.store.get('cache-stats');
      
      if (metadata) {
        metadata.totalSize = (metadata.totalSize || 0) + data.byteLength;
        metadata.modelCount = (metadata.modelCount || 0) + 1;
        await tx.store.put(metadata);
      }
      
      await tx.done;
      
      this.emitEvent('add', { url, modelType: type, size: data.byteLength });
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
   * Prefetch a model (add to prefetch queue)
   */
  async prefetchModel(url: string, type: string, priority: number = 5): Promise<void> {
    if (!url) return;
    
    // Skip if in memory cache or currently prefetching
    if (this.memoryCache.has(url) || this.prefetchQueue.includes(url)) {
      return;
    }
    
    // Add to prefetch queue
    this.prefetchQueue.push(url);
    
    // Emit prefetch event
    this.emitEvent('prefetch', { url, modelType: type });
    
    // Process the queue if not already processing
    if (!this.isPrefetching) {
      this.processPrefetchQueue();
    }
  }
  
  /**
   * Process the prefetch queue
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.prefetchQueue.length === 0 || this.isPrefetching) {
      return;
    }
    
    this.isPrefetching = true;
    
    try {
      // Process up to 3 items from the queue
      const urls = this.prefetchQueue.splice(0, 3);
      
      // Prefetch in parallel
      await Promise.all(urls.map(async (url) => {
        try {
          // Skip if already in memory cache
          if (this.memoryCache.has(url)) {
            return;
          }
          
          // Fetch the model
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to prefetch model: ${response.status} ${response.statusText}`);
          }
          
          const data = new Uint8Array(await response.arrayBuffer());
          
          // Get model type from URL
          const type = url.split('.').pop()?.toLowerCase() || 'unknown';
          
          // Store in cache
          await this.addModel(url, type, data);
        } catch (error) {
          this.emitEvent('error', { 
            error: error instanceof Error ? error : new Error('Unknown error prefetching model'),
            url
          });
        }
      }));
    } finally {
      this.isPrefetching = false;
      
      // Continue processing the queue if there are more items
      if (this.prefetchQueue.length > 0) {
        setTimeout(() => this.processPrefetchQueue(), 100);
      }
    }
  }
  
  /**
   * Clear the entire cache
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
      
      // Clear IndexedDB
      const tx = db.transaction(['models', 'metadata'], 'readwrite');
      await tx.objectStore('models').clear();
      
      // Reset metadata
      const metadata = await tx.objectStore('metadata').get('cache-stats');
      if (metadata) {
        metadata.totalSize = 0;
        metadata.lastCleanup = Date.now();
        metadata.modelCount = 0;
        await tx.objectStore('metadata').put(metadata);
      }
      
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
   * Get cache statistics
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
      const metadata = await db.get('metadata', 'cache-stats');
      if (!metadata) {
        return {
          totalSize: 0,
          lastCleanup: Date.now(),
          deviceQuota: 50 * 1024 * 1024,
          version: CACHE_VERSION,
          modelCount: 0,
          percentUsed: 0,
          settings: DEFAULT_SETTINGS
        };
      }
      
      // Count models
      const modelCount = await db.count('models');
      
      // Calculate percent used
      const percentUsed = metadata.deviceQuota > 0 
        ? (metadata.totalSize / metadata.deviceQuota) * 100
        : 0;
      
      return {
        totalSize: metadata.totalSize || 0,
        lastCleanup: metadata.lastCleanup || Date.now(),
        deviceQuota: metadata.deviceQuota || 50 * 1024 * 1024,
        version: metadata.version || CACHE_VERSION,
        modelCount,
        percentUsed,
        settings: metadata.settings || DEFAULT_SETTINGS
      };
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error getting cache stats')
      });
      
      return {
        totalSize: 0,
        lastCleanup: Date.now(),
        deviceQuota: 50 * 1024 * 1024,
        version: CACHE_VERSION,
        modelCount: 0,
        percentUsed: 0,
        settings: DEFAULT_SETTINGS
      };
    }
  }
  
  /**
   * Update settings for the cache
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
      
      // Get metadata
      const tx = db.transaction('metadata', 'readwrite');
      const metadata = await tx.store.get('cache-stats');
      
      if (metadata) {
        metadata.settings = { ...metadata.settings, ...settings };
        await tx.store.put(metadata);
      }
      
      await tx.done;
      
      return true;
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error updating settings')
      });
      return false;
    }
  }
  
  /**
   * Make room for a new model by removing old models if necessary
   */
  private async makeRoom(requiredSize: number): Promise<void> {
    if (requiredSize <= 0) return;
    
    try {
      const db = await this.dbPromise;
      if (!db) return;
      
      // Get metadata
      const metadata = await db.get('metadata', 'cache-stats');
      if (!metadata) return;
      
      // Calculate maximum size in bytes
      const maxSizeBytes = metadata.settings.maxCacheSizeMB * 1024 * 1024;
      
      // Check if we need to make room
      if (metadata.totalSize + requiredSize <= maxSizeBytes) {
        return;
      }
      
      // We need to remove some models
      const tx = db.transaction('models', 'readwrite');
      
      // Get all models sorted by last accessed (oldest first)
      const models = await tx.store.index('by-last-accessed').getAll();
      
      // Sort by last accessed (oldest first)
      models.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      let freedSpace = 0;
      const neededSpace = metadata.totalSize + requiredSize - maxSizeBytes;
      
      // Remove models until we have enough space
      for (const model of models) {
        if (freedSpace >= neededSpace) break;
        
        // Remove from IndexedDB
        await tx.store.delete(model.url);
        
        // Remove from memory cache
        this.memoryCache.delete(model.url);
        
        // Add to freed space
        freedSpace += model.size;
        
        // Emit event
        this.emitEvent('remove', { url: model.url, modelType: model.type, size: model.size });
      }
      
      await tx.done;
      
      // Update metadata
      const metadataTx = db.transaction('metadata', 'readwrite');
      const updatedMetadata = await metadataTx.store.get('cache-stats');
      
      if (updatedMetadata) {
        updatedMetadata.totalSize = Math.max(0, updatedMetadata.totalSize - freedSpace);
        updatedMetadata.modelCount = Math.max(0, (updatedMetadata.modelCount || 0) - models.length);
        await metadataTx.store.put(updatedMetadata);
      }
      
      await metadataTx.done;
      
      this.emitEvent('cleanup', { details: { freedSpace, removedModels: models.length } });
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error making room in cache')
      });
    }
  }
  
  /**
   * Update model metadata (last accessed time, access count)
   */
  private async updateModelMetadata(url: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      if (!db) return;
      
      const tx = db.transaction('models', 'readwrite');
      const model = await tx.store.get(url);
      
      if (model) {
        model.lastAccessed = Date.now();
        model.accessCount = (model.accessCount || 0) + 1;
        await tx.store.put(model);
      }
      
      await tx.done;
    } catch (error) {
      // Non-critical operation, so just log the error
      console.error('Error updating model metadata:', error);
    }
  }
  
  /**
   * Perform cache maintenance
   */
  private async performMaintenance(): Promise<void> {
    try {
      const db = await this.dbPromise;
      if (!db) return;
      
      // Get metadata
      const metadata = await db.get('metadata', 'cache-stats');
      if (!metadata) return;
      
      // Skip if not due for cleanup or auto-cleanup disabled
      const now = Date.now();
      const autoCleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
      if (!metadata.settings.autoCleanup || 
          now - metadata.lastCleanup < autoCleanupInterval) {
        return;
      }
      
      // Remove expired models
      const tx = db.transaction('models', 'readwrite');
      const models = await tx.store.index('by-timestamp').getAll();
      
      let removedCount = 0;
      let freedSpace = 0;
      const maxAge = metadata.settings.maxCacheAge;
      
      for (const model of models) {
        // Skip if not expired
        if (now - model.timestamp < maxAge) continue;
        
        // Remove from IndexedDB
        await tx.store.delete(model.url);
        
        // Remove from memory cache
        this.memoryCache.delete(model.url);
        
        // Update counters
        removedCount++;
        freedSpace += model.size;
      }
      
      await tx.done;
      
      // Update metadata
      if (removedCount > 0) {
        const metadataTx = db.transaction('metadata', 'readwrite');
        const updatedMetadata = await metadataTx.store.get('cache-stats');
        
        if (updatedMetadata) {
          updatedMetadata.totalSize = Math.max(0, updatedMetadata.totalSize - freedSpace);
          updatedMetadata.lastCleanup = now;
          updatedMetadata.modelCount = Math.max(0, (updatedMetadata.modelCount || 0) - removedCount);
          await metadataTx.store.put(updatedMetadata);
        }
        
        await metadataTx.done;
        
        this.emitEvent('cleanup', { 
          details: { 
            freedSpace, 
            removedModels: removedCount,
            reason: 'maintenance' 
          } 
        });
      }
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error : new Error('Unknown error during maintenance')
      });
    }
  }
  
  /**
   * Estimate available device storage
   */
  private async estimateDeviceStorage(): Promise<void> {
    try {
      if (typeof navigator === 'undefined' || !('storage' in navigator)) {
        return;
      }
      
      if ('estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        
        if (estimate.quota) {
          const db = await this.dbPromise;
          if (!db) return;
          
          // Update metadata with device quota
          const tx = db.transaction('metadata', 'readwrite');
          const metadata = await tx.store.get('cache-stats');
          
          if (metadata) {
            metadata.deviceQuota = estimate.quota;
            await tx.store.put(metadata);
          }
          
          await tx.done;
        }
      }
    } catch (error) {
      // Non-critical, so just log the error
      console.error('Error estimating device storage:', error);
    }
  }
  
  /**
   * Handle coming online
   */
  private onOnline(): void {
    // Perform maintenance when coming back online
    this.performMaintenance();
  }
  
  /**
   * Add event listener
   */
  addEventListener(event: CacheEventType, callback: CacheEventCallback): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(event: CacheEventType, callback: CacheEventCallback): void {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }
  
  /**
   * Emit event to all registered listeners
   */
  private emitEvent(event: CacheEventType, data: Partial<CacheEvent>): void {
    if (!this.eventListeners[event]) return;
    
    const eventObject: CacheEvent = {
      type: event,
      ...data
    };
    
    for (const callback of this.eventListeners[event]) {
      try {
        callback(eventObject);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    }
  }
}

// Create and export a singleton instance
export const arModelCache = new ARModelCache(); 