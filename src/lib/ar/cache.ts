'use client';

import { openDB, IDBPDatabase } from 'idb';

// Database and store names
const DB_NAME = 'vibewell-ar-cache';
const DB_VERSION = 1;
const MODELS_STORE = 'models';
const METADATA_STORE = 'metadata';

// Types for the cache
export interface CachedModel {
  url: string;
  data: Uint8Array;
  size: number;
  timestamp: number;
  lastAccessed: number;
  type: string;
  hash?: string;
}

export interface CacheMetadata {
  totalSize: number;
  lastCleaned: number;
  modelCount: number;
}

export interface ARCacheOptions {
  maxCacheSize?: number; // Maximum cache size in bytes (default: 100MB)
  expirationTime?: number; // Milliseconds before a model expires (default: 30 days)
  cleanupInterval?: number; // Milliseconds between cleanup checks (default: 1 day)
}

// Default cache options
const DEFAULT_OPTIONS: ARCacheOptions = {
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  expirationTime: 30 * 24 * 60 * 60 * 1000, // 30 days
  cleanupInterval: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Initialize the IndexedDB database for AR model caching
 */
async function initDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create store for the actual model data
      if (!db.objectStoreNames.contains(MODELS_STORE)) {
        const modelStore = db.createObjectStore(MODELS_STORE, { keyPath: 'url' });
        modelStore.createIndex('timestamp', 'timestamp', { unique: false });
        modelStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        modelStore.createIndex('size', 'size', { unique: false });
        modelStore.createIndex('type', 'type', { unique: false });
      }

      // Create store for cache metadata
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Get the metadata for the cache
 */
async function getCacheMetadata(db: IDBPDatabase): Promise<CacheMetadata> {
  const metadata = await db.get(METADATA_STORE, 'cache-metadata');
  if (metadata) {
    return metadata;
  }

  // Initialize metadata if it doesn't exist
  const defaultMetadata: CacheMetadata = {
    totalSize: 0,
    lastCleaned: Date.now(),
    modelCount: 0,
  };

  await db.put(METADATA_STORE, defaultMetadata, 'cache-metadata');
  return defaultMetadata;
}

/**
 * Update the cache metadata
 */
async function updateCacheMetadata(
  db: IDBPDatabase,
  updater: (metadata: CacheMetadata) => CacheMetadata
): Promise<void> {
  const tx = db.transaction(METADATA_STORE, 'readwrite');
  const metadata = (await tx.store.get('cache-metadata')) as CacheMetadata;
  await tx.store.put(
    updater(metadata || { totalSize: 0, lastCleaned: Date.now(), modelCount: 0 }),
    'cache-metadata'
  );
  await tx.done;
}

/**
 * Main AR cache class for managing model caching
 */
export class ARModelCache {
  private db: IDBPDatabase | null = null;
  private options: ARCacheOptions;
  private initializing: Promise<void> | null = null;

  constructor(options: ARCacheOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.initializing = this.initialize();
  }

  /**
   * Initialize the cache database
   */
  private async initialize(): Promise<void> {
    try {
      this.db = await initDatabase();
      await this.performMaintenance();
      this.initializing = null;
    } catch (error) {
      console.error('Failed to initialize AR model cache:', error);
      this.initializing = null;
      throw error;
    }
  }

  /**
   * Ensure the database is initialized before performing operations
   */
  private async ensureInitialized(): Promise<IDBPDatabase> {
    if (this.initializing) {
      await this.initializing;
    }

    if (!this.db) {
      throw new Error('AR model cache not initialized');
    }

    return this.db;
  }

  /**
   * Get a model from the cache
   */
  async getModel(url: string): Promise<Uint8Array | null> {
    try {
      const db = await this.ensureInitialized();
      const cachedModel = (await db.get(MODELS_STORE, url)) as CachedModel | undefined;

      if (!cachedModel) {
        return null;
      }

      // Check if the model has expired
      const now = Date.now();
      if (now - cachedModel.timestamp > this.options.expirationTime!) {
        await this.removeModel(url);
        return null;
      }

      // Update last accessed time
      await db.put(MODELS_STORE, {
        ...cachedModel,
        lastAccessed: now,
      });

      return cachedModel.data;
    } catch (error) {
      console.error('Error retrieving cached model:', error);
      return null;
    }
  }

  /**
   * Store a model in the cache
   */
  async storeModel(url: string, data: Uint8Array, type: string, hash?: string): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      const now = Date.now();
      const size = data.byteLength;

      // Check if we need to make space in the cache
      await this.ensureSpace(size);

      // Store the model
      const model: CachedModel = {
        url,
        data,
        size,
        timestamp: now,
        lastAccessed: now,
        type,
        hash,
      };

      await db.put(MODELS_STORE, model);

      // Update cache metadata
      await updateCacheMetadata(db, metadata => ({
        ...metadata,
        totalSize: metadata.totalSize + size,
        modelCount: metadata.modelCount + 1,
      }));
    } catch (error) {
      console.error('Error storing model in cache:', error);
    }
  }

  /**
   * Remove a model from the cache
   */
  async removeModel(url: string): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      const cachedModel = (await db.get(MODELS_STORE, url)) as CachedModel | undefined;

      if (!cachedModel) {
        return;
      }

      await db.delete(MODELS_STORE, url);

      // Update cache metadata
      await updateCacheMetadata(db, metadata => ({
        ...metadata,
        totalSize: metadata.totalSize - cachedModel.size,
        modelCount: metadata.modelCount - 1,
      }));
    } catch (error) {
      console.error('Error removing model from cache:', error);
    }
  }

  /**
   * Ensure there's enough space in the cache for a new model
   */
  private async ensureSpace(requiredSize: number): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      const metadata = await getCacheMetadata(db);

      if (metadata.totalSize + requiredSize <= this.options.maxCacheSize!) {
        return; // Enough space available
      }

      // Need to free up space
      const neededSpace = metadata.totalSize + requiredSize - this.options.maxCacheSize!;
      await this.clearSpace(neededSpace);
    } catch (error) {
      console.error('Error ensuring cache space:', error);
    }
  }

  /**
   * Clear space in the cache by removing least recently used models
   */
  private async clearSpace(requiredSpace: number): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      let freedSpace = 0;

      // Get all models sorted by last accessed time (oldest first)
      const tx = db.transaction(MODELS_STORE, 'readwrite');
      const index = tx.store.index('lastAccessed');
      let cursor = await index.openCursor();

      while (cursor && freedSpace < requiredSpace) {
        const model = cursor.value as CachedModel;
        await cursor.delete();
        freedSpace += model.size;

        // Update metadata
        await updateCacheMetadata(db, metadata => ({
          ...metadata,
          totalSize: metadata.totalSize - model.size,
          modelCount: metadata.modelCount - 1,
        }));

        cursor = await cursor.continue();
      }

      await tx.done;
    } catch (error) {
      console.error('Error clearing cache space:', error);
    }
  }

  /**
   * Perform maintenance on the cache (remove expired models, etc.)
   */
  async performMaintenance(): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      const metadata = await getCacheMetadata(db);
      const now = Date.now();

      // Only perform cleanup if it's been long enough since the last one
      if (now - metadata.lastCleaned < this.options.cleanupInterval!) {
        return;
      }

      // Remove expired models
      const expirationThreshold = now - this.options.expirationTime!;
      const tx = db.transaction(MODELS_STORE, 'readwrite');
      const index = tx.store.index('timestamp');
      let cursor = await index.openCursor();

      let totalFreed = 0;
      let modelsRemoved = 0;

      while (cursor) {
        const model = cursor.value as CachedModel;
        if (model.timestamp < expirationThreshold) {
          await cursor.delete();
          totalFreed += model.size;
          modelsRemoved++;
        }
        cursor = await cursor.continue();
      }

      await tx.done;

      // Update metadata
      await updateCacheMetadata(db, metadata => ({
        ...metadata,
        totalSize: metadata.totalSize - totalFreed,
        lastCleaned: now,
        modelCount: metadata.modelCount - modelsRemoved,
      }));
    } catch (error) {
      console.error('Error performing cache maintenance:', error);
    }
  }

  /**
   * Prefetch a model (download and cache it proactively)
   */
  async prefetchModel(url: string, type: string): Promise<void> {
    try {
      const db = await this.ensureInitialized();

      // Check if model is already cached
      const existingModel = await db.get(MODELS_STORE, url);
      if (existingModel) {
        return; // Already cached
      }

      // Fetch the model
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to prefetch model: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const modelData = new Uint8Array(arrayBuffer);

      // Store in cache
      await this.storeModel(url, modelData, type);
    } catch (error) {
      console.error('Error prefetching model:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    modelCount: number;
    totalSize: number;
    averageSize: number;
    oldestModel: Date;
    newestModel: Date;
  }> {
    try {
      const db = await this.ensureInitialized();
      const metadata = await getCacheMetadata(db);

      // Get oldest and newest models
      const tx = db.transaction(MODELS_STORE, 'readonly');
      const models = await tx.store.getAll();
      await tx.done;

      if (models.length === 0) {
        return {
          modelCount: 0,
          totalSize: 0,
          averageSize: 0,
          oldestModel: new Date(),
          newestModel: new Date(),
        };
      }

      const timestamps = models.map(m => m.timestamp);
      const oldestTimestamp = Math.min(...timestamps);
      const newestTimestamp = Math.max(...timestamps);

      return {
        modelCount: metadata.modelCount,
        totalSize: metadata.totalSize,
        averageSize: metadata.modelCount > 0 ? metadata.totalSize / metadata.modelCount : 0,
        oldestModel: new Date(oldestTimestamp),
        newestModel: new Date(newestTimestamp),
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        modelCount: 0,
        totalSize: 0,
        averageSize: 0,
        oldestModel: new Date(),
        newestModel: new Date(),
      };
    }
  }

  /**
   * Clear all models from the cache
   */
  async clearCache(): Promise<void> {
    try {
      const db = await this.ensureInitialized();
      await db.clear(MODELS_STORE);

      // Reset metadata
      await updateCacheMetadata(db, () => ({
        totalSize: 0,
        lastCleaned: Date.now(),
        modelCount: 0,
      }));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Create and export a singleton instance
export const arModelCache = new ARModelCache();

/**
 * Get a model from the cache or fetch it if not available
 * @param url The URL of the model to load
 * @param forceRefresh Whether to bypass the cache and fetch from network
 * @returns The model data as a Uint8Array
 */
export async function getModelFromCache(
  url: string,
  forceRefresh = false
): Promise<Uint8Array | null> {
  if (forceRefresh) {
    // If force refresh, fetch the model directly
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const modelData = new Uint8Array(arrayBuffer);

      // Determine the model type based on URL
      const type = getModelTypeFromUrl(url);

      // Store in cache
      await arModelCache.storeModel(url, modelData, type);

      return modelData;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    }
  } else {
    // Try to get from cache first
    const cachedModel = await arModelCache.getModel(url);

    if (cachedModel) {
      return cachedModel;
    }

    // If not in cache, fetch it
    return getModelFromCache(url, true);
  }
}

/**
 * Cache a model
 * @param url The URL of the model
 * @param data The model data
 * @param type Optional model type (if not provided, will be determined from URL)
 * @param hash Optional hash for the model
 */
export async function cacheModel(
  url: string,
  data: Uint8Array,
  type?: string,
  hash?: string
): Promise<void> {
  const modelType = type || getModelTypeFromUrl(url);
  return arModelCache.storeModel(url, data, modelType, hash);
}

/**
 * Prefetch a model
 * @param url The URL of the model to prefetch
 * @param type Optional model type (if not provided, will be determined from URL)
 */
export async function prefetchModel(url: string, type?: string): Promise<void> {
  const modelType = type || getModelTypeFromUrl(url);
  return arModelCache.prefetchModel(url, modelType);
}

/**
 * Clear the entire AR model cache
 */
export async function clearCache(): Promise<void> {
  return arModelCache.clearCache();
}

/**
 * Get the model type from the URL
 * This is a helper function that tries to determine the model type based on the URL
 */
function getModelTypeFromUrl(url: string): string {
  if (url.includes('makeup')) return 'makeup';
  if (url.includes('hairstyle')) return 'hairstyle';
  if (url.includes('accessory')) return 'accessory';

  // Try to determine from file extension
  if (url.endsWith('.glb') || url.endsWith('.gltf')) return 'model';
  if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'texture';

  // Default fallback
  return 'unknown';
}

// Helper function to get the device storage capacity
export async function getDeviceStorageEstimate(): Promise<{
  quota: number;
  usage: number;
  available: number;
  percentUsed: number;
}> {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      return {
        quota: 0,
        usage: 0,
        available: 0,
        percentUsed: 0,
      };
    }

    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;
    const available = quota - usage;
    const percentUsed = (usage / quota) * 100;

    return {
      quota,
      usage,
      available,
      percentUsed,
    };
  } catch (error) {
    console.error('Error estimating device storage:', error);
    return {
      quota: 0,
      usage: 0,
      available: 0,
      percentUsed: 0,
    };
  }
}
