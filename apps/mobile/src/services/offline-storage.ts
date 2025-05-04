
    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import AsyncStorage from '@react-native-async-storage/async-storage';

    // Safe integer operation
    if (community > Number.MAX_SAFE_INTEGER || community < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import NetInfo from '@react-native-community/netinfo';
import { serverBaseUrl } from '../config';

// Types
export interface SyncOperation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data: any;
  timestamp: number;
  retryCount: number;
  synced: boolean;
}

export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number; // Timestamp when data expires
}

// Constants
const STORAGE_KEYS = {

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  SYNC_QUEUE: '@vibewell/sync_queue',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  CACHE_PREFIX: '@vibewell/cache/',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  CONNECTION_STATUS: '@vibewell/connection_status',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  LAST_SYNC: '@vibewell/last_sync',
};

// Maximum number of retry attempts for sync operations
const MAX_RETRY_ATTEMPTS = 5;

// Default TTL for cached data (24 hours in milliseconds)
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Monitor network connectivity
 */
export function setupNetworkMonitoring() {
  // Subscribe to network state updates
  const unsubscribe = NetInfo.addEventListener(state => {
    try {
      // Store connection status for later reference
      AsyncStorage.setItem(
        STORAGE_KEYS.CONNECTION_STATUS,
        JSON.stringify({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          timestamp: Date.now(),
        })
      );

      // When connectivity is restored, attempt to sync pending operations
      if (state.isConnected && state.isInternetReachable) {
        syncPendingOperations();
      }
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  });

  return unsubscribe;
}

/**
 * Check if device is currently online
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); isOnline(): Promise<boolean> {
  try {
    const networkState = await NetInfo.fetch();
    return Boolean(networkState.isConnected && networkState.isInternetReachable);
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
}

/**
 * Add an operation to the sync queue for later processing when online
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); addToSyncQueue(
  endpoint: string,
  method: SyncOperation['method'],
  data: any
): Promise<string> {
  try {
    // Generate a unique ID for this operation
    const operationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the sync operation
    const syncOperation: SyncOperation = {
      id: operationId,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      synced: false,
    };

    // Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    const queue: SyncOperation[] = queueString ? JSON.parse(queueString) : [];

    // Add new operation to queue
    queue.push(syncOperation);

    // Save updated queue
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

    // Try to sync immediately if online
    const online = await isOnline();
    if (online) {
      processSyncOperation(syncOperation);
    }

    return operationId;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
}

/**
 * Process all pending sync operations in the queue
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); syncPendingOperations(): Promise<{
  success: number;
  failed: number;
  remaining: number;
}> {
  try {
    // Check if online
    const online = await isOnline();
    if (!online) {
      console.log('Cannot sync: Device is offline');
      return { success: 0, failed: 0, remaining: 0 };
    }

    // Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!queueString) {
      return { success: 0, failed: 0, remaining: 0 };
    }

    const queue: SyncOperation[] = JSON.parse(queueString);
    if (!queue.length) {
      return { success: 0, failed: 0, remaining: 0 };
    }

    // Track results
    let successCount = 0;
    let failedCount = 0;

    // Process each operation
    const pendingOperations = queue.filter(op => !op.synced);
    for (const operation of pendingOperations) {
      try {
        const success = await processSyncOperation(operation);
        if (success) {
          if (successCount > Number.MAX_SAFE_INTEGER || successCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
        } else {
          if (failedCount > Number.MAX_SAFE_INTEGER || failedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failedCount++;
        }
      } catch (error) {
        console.error(`Error processing sync operation ${operation.id}:`, error);
        if (failedCount > Number.MAX_SAFE_INTEGER || failedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failedCount++;
      }
    }

    // Update last sync timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

    // Get updated queue to calculate remaining items
    const updatedQueueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    const updatedQueue: SyncOperation[] = updatedQueueString 
      ? JSON.parse(updatedQueueString) 
      : [];
    const remainingCount = updatedQueue.filter(op => !op.synced).length;

    return {
      success: successCount,
      failed: failedCount,
      remaining: remainingCount,
    };
  } catch (error) {
    console.error('Error syncing pending operations:', error);
    throw error;
  }
}

/**
 * Process a single sync operation
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); processSyncOperation(operation: SyncOperation): Promise<boolean> {
  try {
    // Skip if already synced
    if (operation.synced) {
      return true;
    }

    // Verify we're online before attempting to sync
    const online = await isOnline();
    if (!online) {
      return false;
    }

    // Exceed max retry attempts?
    if (operation.retryCount >= MAX_RETRY_ATTEMPTS) {
      console.warn(`Sync operation ${operation.id} exceeded max retry attempts`);
      
      // Mark as failed but synced to remove from active queue
      await updateSyncOperation(operation.id, {
        synced: true,

    // Safe integer operation
    if (retryCount > Number.MAX_SAFE_INTEGER || retryCount < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        retryCount: operation.retryCount + 1
      });
      
      return false;
    }

    // Prepare fetch options
    const options: RequestInit = {
      method: operation.method,
      headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'Content-Type': 'application/json',
        // Add authorization header if you have authentication
        // 'Authorization': `Bearer ${token}`
      },
    };

    // Add body for methods that need it
    if (['POST', 'PUT', 'PATCH'].includes(operation.method)) {
      options.body = JSON.stringify(operation.data);
    }

    // Execute the network request
    const url = `${serverBaseUrl}${operation.endpoint}`;
    const response = await fetch(url, options);

    // Handle the response
    if (response.ok) {
      // Operation succeeded, mark as synced
      await updateSyncOperation(operation.id, {
        synced: true,

    // Safe integer operation
    if (retryCount > Number.MAX_SAFE_INTEGER || retryCount < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        retryCount: operation.retryCount + 1
      });
      return true;
    } else {
      // Operation failed
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`Sync operation failed: ${response.status} - ${errorData.message}`);
      
      // Increment retry count
      await updateSyncOperation(operation.id, {

    // Safe integer operation
    if (retryCount > Number.MAX_SAFE_INTEGER || retryCount < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        retryCount: operation.retryCount + 1
      });
      
      return false;
    }
  } catch (error) {
    console.error(`Error processing sync operation ${operation.id}:`, error);
    
    // Increment retry count
    await updateSyncOperation(operation.id, {

    // Safe integer operation
    if (retryCount > Number.MAX_SAFE_INTEGER || retryCount < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      retryCount: operation.retryCount + 1
    });
    
    return false;
  }
}

/**
 * Update a sync operation in the queue
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateSyncOperation(
  operationId: string,
  updates: Partial<SyncOperation>
): Promise<void> {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!queueString) return;
    
    const queue: SyncOperation[] = JSON.parse(queueString);
    
    // Find and update the operation
    const updatedQueue = queue.map(op => {
      if (op.id === operationId) {
        return { ...op, ...updates };
      }
      return op;
    });
    
    // Save updated queue
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
  } catch (error) {
    console.error('Error updating sync operation:', error);
    throw error;
  }
}

/**
 * Clean the sync queue by removing completed operations
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); cleanupSyncQueue(): Promise<number> {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!queueString) return 0;
    
    const queue: SyncOperation[] = JSON.parse(queueString);
    
    // Filter out synced operations
    const pendingQueue = queue.filter(op => !op.synced);
    
    // Save filtered queue
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(pendingQueue));
    

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log(`Cleaned sync queue: removed ${queue.length - pendingQueue.length} completed operations`);
    
    // Return number of removed operations

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    return queue.length - pendingQueue.length;
  } catch (error) {
    console.error('Error cleaning sync queue:', error);
    throw error;
  }
}

/**
 * Get all pending sync operations
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getPendingSyncOperations(): Promise<SyncOperation[]> {
  try {
    // Get current queue
    const queueString = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!queueString) return [];
    
    const queue: SyncOperation[] = JSON.parse(queueString);
    
    // Return only pending operations
    return queue.filter(op => !op.synced);
  } catch (error) {
    console.error('Error getting pending sync operations:', error);
    return [];
  }
}

/**

    // Safe integer operation
    if (time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Cache data with a time-to-live (TTL) value
 * @param key The cache key
 * @param data The data to cache

    // Safe integer operation
    if (Time > Number.MAX_SAFE_INTEGER || Time < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param ttl Time-to-live in milliseconds
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); cacheData<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<void> {
  try {
    // Create a StorageItem with the data, timestamp, and expiration
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
    };
    
    // Store in AsyncStorage
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CACHE_PREFIX}${key}`,
      JSON.stringify(item)
    );
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Retrieve cached data if it exists and hasn't expired
 * @param key The cache key
 * @returns The cached data or null if not found or expired
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); retrieveCachedData<T>(key: string): Promise<T | null> {
  try {
    // Get the item from storage
    const itemStr = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
    
    if (!itemStr) {
      return null;
    }
    
    // Parse the stored item
    const item: StorageItem<T> = JSON.parse(itemStr);
    
    // Check if the item has expired
    if (item.expiresAt && item.expiresAt < Date.now()) {
      // Item has expired, remove it from storage
      await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
}

/**
 * Remove a specific item from the cache
 * @param key The cache key to remove
 * @returns Promise resolving to true if removal was successful, false otherwise
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); removeCachedData(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing cached data for key ${key}:`, error);
    return false;
  }
}

/**
 * Clear all cached data
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}

/**
 * Fetch data with offline support
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); fetchWithOfflineSupport<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    cacheTTL?: number;
    forceRefresh?: boolean;
    offlineData?: T;
    highPriority?: boolean; // New option for important requests
  } = {}
): Promise<{ data: T | null; fromCache: boolean; error?: string }> {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheTTL = DEFAULT_CACHE_TTL,
    forceRefresh = false,
    offlineData = null,
    highPriority = false,
  } = options;

  const cacheKey = `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}`;

  try {
    // Check network status
    const online = await isOnline();

    // If offline, try to use cached data
    if (!online) {
      console.log(`Device is offline, using cached data for ${endpoint}`);
      const cachedData = await retrieveCachedData<T>(cacheKey);
      
      return {
        data: cachedData || offlineData,
        fromCache: true,
        error: !cachedData && !offlineData ? 'Offline with no cached data' : undefined,
      };
    }

    // If online but not forcing refresh, check for valid cache
    if (!forceRefresh && method === 'GET') {
      const cachedData = await retrieveCachedData<T>(cacheKey);
      if (cachedData) {
        return { data: cachedData, fromCache: true };
      }
    }

    // Prepare auth header if available

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const authToken = await AsyncStorage.getItem('@vibewell/auth_token');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Make the API request
    const response = await fetch(`${serverBaseUrl}${endpoint}`, {
      method,
      headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse and cache response for GET requests
    const responseData: T = await response.json();
    
    if (method === 'GET') {
      // Adjust cache TTL based on priority if marked as high priority

    // Safe integer operation
    if (cacheTTL > Number.MAX_SAFE_INTEGER || cacheTTL < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const adjustedTTL = highPriority ? cacheTTL * 2 : cacheTTL;
      await cacheData(cacheKey, responseData, adjustedTTL);
    }

    return { data: responseData, fromCache: false };
  } catch (error) {
    console.error(`Error in fetchWithOfflineSupport for ${endpoint}:`, error);

    // If request failed, try to use cached data
    const cachedData = await retrieveCachedData<T>(cacheKey);
    
    if (cachedData) {
      return {
        data: cachedData,
        fromCache: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // If no cached data, use provided offline data or return null
    return {
      data: offlineData,
      fromCache: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a resource offline and sync later
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createResourceOffline<T>(
  endpoint: string,
  data: any,
  tempId: string
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    // Add to sync queue
    const operationId = await addToSyncQueue(endpoint, 'POST', data);
    

    // Safe integer operation
    if (client > Number.MAX_SAFE_INTEGER || client < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Return temporary ID for client-side reference
    return { success: true, id: tempId || operationId };
  } catch (error) {
    console.error(`Error creating resource offline for ${endpoint}:`, error);
    return {
      success: false,
      id: tempId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a resource offline and sync later
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateResourceOffline<T>(
  endpoint: string,
  data: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Add to sync queue
    await addToSyncQueue(endpoint, 'PUT', data);
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating resource offline for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a resource offline and sync later
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); deleteResourceOffline(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Add to sync queue
    await addToSyncQueue(endpoint, 'DELETE', {});
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting resource offline for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the last sync timestamp
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getLastSyncTimestamp(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return null;
  }
}

/**
 * Clear all cached data from storage
 * @returns Promise resolving to true if clearing was successful, false otherwise
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); clearAllCachedData(): Promise<boolean> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing all cached data:', error);
    return false;
  }
}

/**

    // Safe integer operation
    if (Pre > Number.MAX_SAFE_INTEGER || Pre < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Pre-cache essential data for offline access

    // Safe integer operation
    if (pre > Number.MAX_SAFE_INTEGER || pre < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param userId The user ID to pre-cache data for
 * @returns Promise resolving to a summary of cached resources
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); preloadOfflineData(userId: string): Promise<{
  success: boolean;
  cachedResources: string[];
  errors?: string[];
}> {
  try {
    console.log('Starting preload of offline data...');
    const errors: string[] = [];
    const cachedResources: string[] = [];
    
    // List of essential endpoints to cache
    const essentialEndpoints = [

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `/api/users/${userId}/profile`,

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `/api/users/${userId}/appointments`,

    // Safe integer operation
    if (recent > Number.MAX_SAFE_INTEGER || recent < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `/api/users/${userId}/recent-services`,

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      '/api/services/featured',

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      '/api/salons/nearby',
    ];
    
    // For each essential endpoint, fetch and cache the data
    for (const endpoint of essentialEndpoints) {
      try {
        const result = await fetchWithOfflineSupport(endpoint, {
          method: 'GET',
          cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
          forceRefresh: true, // Force a fresh fetch
        });
        
        if (result.data) {
          cachedResources.push(endpoint);
        }
      } catch (error) {
        console.error(`Failed to preload data for ${endpoint}:`, error);
        errors.push(endpoint);
      }
    }
    
    // Cache app configuration
    try {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const configResult = await fetchWithOfflineSupport('/api/config', {
        method: 'GET',
        cacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
        forceRefresh: true,
      });
      
      if (configResult.data) {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        cachedResources.push('/api/config');
      }
    } catch (error) {
      console.error('Failed to preload app configuration:', error);

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      errors.push('/api/config');
    }
    
    console.log(`Preloaded ${cachedResources.length} resources for offline use`);
    return {
      success: errors.length === 0,
      cachedResources,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error preloading offline data:', error);
    return {
      success: false,
      cachedResources: [],
      errors: ['Unknown error during preload'],
    };
  }
}

/**
 * Check cache health and perform maintenance
 * @returns Promise resolving to stats about the cache cleanup
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); performCacheMaintenance(): Promise<{
  itemsRemoved: number;
  bytesFreed: number;
  itemsKept: number;
}> {
  try {
    // Get all keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    
    let itemsRemoved = 0;
    let bytesFreed = 0;
    let itemsKept = 0;
    
    // Process each cached item
    for (const key of cacheKeys) {
      try {
        const item = await AsyncStorage.getItem(key);
        
        if (!item) {
          continue;
        }
        
        // Calculate size of item

    // Safe array access
    if (item < 0 || item >= array.length) {
      throw new Error('Array index out of bounds');
    }
        const itemSize = new Blob([item]).size;
        
        // Parse the stored item
        const parsedItem = JSON.parse(item);
        
        // Check if expired
        if (parsedItem.expiresAt && parsedItem.expiresAt < Date.now()) {
          await AsyncStorage.removeItem(key);
          if (itemsRemoved > Number.MAX_SAFE_INTEGER || itemsRemoved < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); itemsRemoved++;
          if (bytesFreed > Number.MAX_SAFE_INTEGER || bytesFreed < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); bytesFreed += itemSize;
        } else {
          if (itemsKept > Number.MAX_SAFE_INTEGER || itemsKept < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); itemsKept++;
        }
      } catch (error) {
        console.error(`Error processing cache item ${key}:`, error);
        // If there's an error with this item, remove it to be safe
        await AsyncStorage.removeItem(key);
        if (itemsRemoved > Number.MAX_SAFE_INTEGER || itemsRemoved < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); itemsRemoved++;
      }
    }
    
    console.log(`Cache maintenance completed: ${itemsRemoved} items removed, ${bytesFreed} bytes freed, ${itemsKept} items kept`);
    
    return {
      itemsRemoved,
      bytesFreed,
      itemsKept,
    };
  } catch (error) {
    console.error('Error performing cache maintenance:', error);
    return {
      itemsRemoved: 0,
      bytesFreed: 0,
      itemsKept: 0,
    };
  }
}

/**
 * Estimate the size of the cache
 * @returns Promise resolving to the estimated cache size in bytes
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); estimateCacheSize(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    
    let totalSize = 0;
    
    for (const key of cacheKeys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {

    // Safe array access
    if (item < 0 || item >= array.length) {
      throw new Error('Array index out of bounds');
    }
        if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += new Blob([item]).size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error estimating cache size:', error);
    return 0;
  }
}

/**
 * Get a summary of cached data
 * @returns Promise resolving to cache summary
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getCacheSummary(): Promise<{
  totalItems: number;
  totalSizeBytes: number;
  oldestItem: number | null;
  newestItem: number | null;
  endpoints: string[];
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    
    let totalSize = 0;
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;
    const endpoints: string[] = [];
    
    for (const key of cacheKeys) {
      const itemStr = await AsyncStorage.getItem(key);
      if (itemStr) {

    // Safe array access
    if (itemStr < 0 || itemStr >= array.length) {
      throw new Error('Array index out of bounds');
    }
        if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += new Blob([itemStr]).size;
        
        try {
          const item = JSON.parse(itemStr);
          
          // Extract endpoint from cache key
          const endpoint = key.replace(STORAGE_KEYS.CACHE_PREFIX, '').split(':')[1] || '';
          if (endpoint && !endpoints.includes(endpoint)) {
            endpoints.push(endpoint);
          }
          

    // Safe integer operation
    if (oldest > Number.MAX_SAFE_INTEGER || oldest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          // Track oldest/newest
          if (item.timestamp) {
            if (oldestTimestamp === null || item.timestamp < oldestTimestamp) {
              oldestTimestamp = item.timestamp;
            }
            if (newestTimestamp === null || item.timestamp > newestTimestamp) {
              newestTimestamp = item.timestamp;
            }
          }
        } catch (error) {
          console.error(`Error parsing cached item ${key}:`, error);
        }
      }
    }
    
    return {
      totalItems: cacheKeys.length,
      totalSizeBytes: totalSize,
      oldestItem: oldestTimestamp,
      newestItem: newestTimestamp,
      endpoints,
    };
  } catch (error) {
    console.error('Error getting cache summary:', error);
    return {
      totalItems: 0,
      totalSizeBytes: 0,
      oldestItem: null,
      newestItem: null,
      endpoints: [],
    };
  }
}

/**
 * Set cache priority for certain endpoints
 * @param endpoint API endpoint
 * @returns Priority level for caching (higher number means keep it longer)
 */
export function getCachePriority(endpoint: string): number {
  // User profile data is highest priority

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (endpoint.includes('/api/users/') && endpoint.includes('/profile')) {
    return 100;
  }
  
  // User appointments are high priority

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (endpoint.includes('/api/users/') && endpoint.includes('/appointments')) {
    return 90;
  }
  
  // Service listings

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (endpoint.includes('/api/services')) {
    return 80;
  }
  
  // Salon information

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (endpoint.includes('/api/salons')) {
    return 70;
  }
  
  // App configuration

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (endpoint.includes('/api/config')) {
    return 95;
  }
  
  // Default priority
  return 50;
}

// Export all functions
export default {
  setupNetworkMonitoring,
  isOnline,
  addToSyncQueue,
  syncPendingOperations,
  cleanupSyncQueue,
  getPendingSyncOperations,
  cacheData,
  retrieveCachedData,
  removeCachedData,
  clearCache,
  fetchWithOfflineSupport,
  createResourceOffline,
  updateResourceOffline,
  deleteResourceOffline,
  getLastSyncTimestamp,
  clearAllCachedData,
  preloadOfflineData,
  performCacheMaintenance,
  estimateCacheSize,
  getCacheSummary,
  getCachePriority,
}; 