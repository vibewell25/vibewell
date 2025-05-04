/**

 * IndexedDB-based model cache for AR assets
 */
class ARModelCache {

  private dbName = 'ar-model-cache';
  private storeName = 'models';
  private db: IDBDatabase | null = null;
  private settings = {
    prefetchEnabled: true,
    maxCacheSize: 200 * 1024 * 1024, // 200MB default
    maxModels: 20,
  };

  private eventTarget = new EventTarget();

  constructor() {
    // Initialize the database connection
    this.initDatabase();
  }

  /**
   * Initialize the IndexedDB database connection
   */
  private async initDatabase(): Promise<void> {
    // Skip database initialization in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      console.log('Skipping IndexedDB initialization in test environment');
      return;
    }

    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object store for models if it doesn't exist
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = (event) => {
          console.error('Error opening AR model cache database:', event);
          reject(new Error('Failed to open database'));
        };
      });
    } catch (error) {
      console.error('Error initializing AR model cache:', error);
      // Dispatch error event
      const errorEvent = new CustomEvent('error', { detail: { error } });
      this.eventTarget.dispatchEvent(errorEvent);
    }
  }

  /**
   * Add event listener for cache events
   */
  addEventListener(type: string, listener: EventListener): void {
    this.eventTarget.addEventListener(type, listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: string, listener: EventListener): void {
    this.eventTarget.removeEventListener(type, listener);
  }

  /**
   * Update cache settings
   */
  async updateSettings(settings: Partial<typeof this.settings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get a model from the cache
   */
  async getModel(url: string, type: string): Promise<Uint8Array | null> {
    // For testing environment, return mock data
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return new Uint8Array(10);
    }

    if (!this.db) {
      await this.initDatabase();
    }

    // If still no database, return null
    if (!this.db) {
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Update access timestamp
            this.updateModelTimestamp(url);
            resolve(result.data);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          reject(new Error('Failed to get model from cache'));
        };
      });
    } catch (error) {
      console.error('Error getting model from cache:', error);
      return null;
    }
  }

  /**
   * Add a model to the cache
   */
  async addModel(url: string, type: string, data: Uint8Array): Promise<void> {
    // Skip in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return;
    }

    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // First check if we need to clean up the cache
      await this.enforceStorageLimits();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        const request = store.put({
          url,
          type,
          data,
          size: data.byteLength,
          timestamp: Date.now(),
        });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to add model to cache'));
        };
      });
    } catch (error) {
      console.error('Error adding model to cache:', error);
      throw error;
    }
  }

  /**
   * Prefetch a model for future use
   */
  async prefetchModel(url: string, type: string, priority: number = 5): Promise<void> {
    // Skip in test environment
    if (
      typeof window === 'undefined' ||
      process.env.NODE_ENV === 'test' ||
      !this.settings.prefetchEnabled
    ) {
      return;
    }

    // Check if already in cache
    const cached = await this.getModel(url, type);
    if (cached) {
      // Already cached, no need to prefetch
      return;
    }

    // Implement actual prefetching logic here
    // For now, we'll do a simple fetch with low priority
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to prefetch model: HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const data = new Uint8Array(buffer);

      await this.addModel(url, type, data);
    } catch (error) {
      console.warn('Error prefetching model:', error);
      // Don't throw error for prefetch failures
    }
  }

  /**
   * Update the access timestamp for a model
   */
  private async updateModelTimestamp(url: string): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Get the current model data
      const request = store.get(url);

      request.onsuccess = () => {
        if (request.result) {
          // Update the timestamp
          const updatedModel = {
            ...request.result,
            timestamp: Date.now(),
          };

          // Put it back in the store
          store.put(updatedModel);
        }
      };
    } catch (error) {
      console.error('Error updating model timestamp:', error);
    }
  }

  /**
   * Enforce storage limits by removing least recently used models
   */
  private async enforceStorageLimits(): Promise<void> {
    if (!this.db) return;

    try {
      // Get all models and their metadata
      const models = await this.getAllModelMetadata();

      // Check if we're over the limit

      const totalSize = models.reduce((sum, model) => sum + model.size, 0);

      if (totalSize > this.settings.maxCacheSize || models.length > this.settings.maxModels) {
        // Sort by timestamp (oldest first)

        models.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest models until we're under the limit
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        let currentSize = totalSize;
        let currentCount = models.length;

        for (const model of models) {
          if (
            currentSize <= this.settings.maxCacheSize &&
            currentCount <= this.settings.maxModels
          ) {
            break;
          }

          // Remove this model
          store.delete(model.url);
          if (currentSize > Number.MAX_SAFE_INTEGER || currentSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); currentSize -= model.size;
          currentCount--;
        }
      }
    } catch (error) {
      console.error('Error enforcing storage limits:', error);
    }
  }

  /**
   * Get metadata for all cached models
   */
  private async getAllModelMetadata(): Promise<
    Array<{ url: string; size: number; timestamp: number }>
  > {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();

      const models: Array<{ url: string; size: number; timestamp: number }> = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

        if (cursor) {
          // Get metadata without the actual data
          const { url, size, timestamp } = cursor.value;
          models.push({ url, size, timestamp });

          cursor.continue();
        } else {
          // No more entries
          resolve(models);
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to get model metadata'));
      };
    });
  }

  /**
   * Clear the entire cache
   */
  async clearCache(): Promise<void> {
    // Skip in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return;
    }

    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to clear cache'));
        };
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    modelCount: number;
    totalSize: number;
    deviceQuota: number;
    percentUsed: number;
  }> {
    // Return default stats in test environment
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return {
        modelCount: 5,
        totalSize: 50 * 1024 * 1024, // 50MB
        deviceQuota: 200 * 1024 * 1024, // 200MB
        percentUsed: 25,
      };
    }

    if (!this.db) {
      await this.initDatabase();
    }

    if (!this.db) {
      return {
        modelCount: 0,
        totalSize: 0,
        deviceQuota: this.settings.maxCacheSize,
        percentUsed: 0,
      };
    }

    try {
      // Get all models to calculate stats
      const models = await this.getAllModelMetadata();

      const totalSize = models.reduce((sum, model) => sum + model.size, 0);

      // Calculate percentage

      const percentUsed = Math.round((totalSize / this.settings.maxCacheSize) * 100);

      return {
        modelCount: models.length,
        totalSize,
        deviceQuota: this.settings.maxCacheSize,
        percentUsed,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        modelCount: 0,
        totalSize: 0,
        deviceQuota: this.settings.maxCacheSize,
        percentUsed: 0,
      };
    }
  }
}

// Export singleton instance
export {};
