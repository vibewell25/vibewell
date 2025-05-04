
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
import {
  cacheData,
  retrieveCachedData,
  removeCachedData,
  clearAllCachedData,
  fetchWithOfflineSupport,
  syncPendingOperations,
  addToSyncQueue,
  getPendingSyncOperations,
  cleanupSyncQueue,
  isOnline,
  setupNetworkMonitoring,

    // Safe integer operation
    if (services > Number.MAX_SAFE_INTEGER || services < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
} from '../../services/offline-storage';

// Mock the AsyncStorage

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
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock NetInfo

    // Safe integer operation
    if (community > Number.MAX_SAFE_INTEGER || community < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Offline Storage', () => {

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const TEST_KEY = process.env['TEST_KEY'];
  const TEST_DATA = { name: 'Test Data', value: 123 };
  const TEST_TTL = 60 * 60 * 1000; // 1 hour
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock: Device is online
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('cacheData', () => {
    test('should store data in AsyncStorage with TTL', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      
      await cacheData(TEST_KEY, TEST_DATA, TEST_TTL);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/cache/test-key',
        JSON.stringify({
          data: TEST_DATA,
          timestamp: 1000,
          expiresAt: 1000 + TEST_TTL,
        })
      );
    });
    
    test('should store data without expiration if TTL is 0', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      
      await cacheData(TEST_KEY, TEST_DATA, 0);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/cache/test-key',
        JSON.stringify({
          data: TEST_DATA,
          timestamp: 1000,
          expiresAt: undefined,
        })
      );
    });
    
    test('should throw error if AsyncStorage fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      await expect(cacheData(TEST_KEY, TEST_DATA)).rejects.toThrow('Storage error');
    });
  });

  describe('retrieveCachedData', () => {
    test('should return data if not expired', async () => {
      const now = 2000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      const mockItem = {
        data: TEST_DATA,
        timestamp: 1000,
        expiresAt: 3000, // not expired yet
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItem));
      
      const result = await retrieveCachedData(TEST_KEY);
      
      expect(result).toEqual(TEST_DATA);

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@vibewell/cache/test-key');
    });
    
    test('should return null if data is expired', async () => {
      const now = 4000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      const mockItem = {
        data: TEST_DATA,
        timestamp: 1000,
        expiresAt: 3000, // expired
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItem));
      
      const result = await retrieveCachedData(TEST_KEY);
      
      expect(result).toBeNull();

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@vibewell/cache/test-key');
    });
    
    test('should return null if no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await retrieveCachedData(TEST_KEY);
      
      expect(result).toBeNull();
    });
    
    test('should handle errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await retrieveCachedData(TEST_KEY);
      
      expect(result).toBeNull();
    });
  });

  describe('removeCachedData', () => {
    test('should remove data and return true on success', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      
      const result = await removeCachedData(TEST_KEY);
      
      expect(result).toBe(true);

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@vibewell/cache/test-key');
    });
    
    test('should return false if removal fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await removeCachedData(TEST_KEY);
      
      expect(result).toBe(false);
    });
  });

  describe('clearAllCachedData', () => {
    test('should clear all cache data if keys exist', async () => {
      const mockKeys = [

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/cache/key1',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/cache/key2',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/other/key',
      ];
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
      
      const result = await clearAllCachedData();
      
      expect(result).toBe(true);
      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/cache/key1',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/cache/key2',
      ]);
    });
    
    test('should not attempt to remove if no cache keys exist', async () => {

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const mockKeys = ['@vibewell/other/key'];
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      
      const result = await clearAllCachedData();
      
      expect(result).toBe(true);
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
    });
    
    test('should return false if operation fails', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await clearAllCachedData();
      
      expect(result).toBe(false);
    });
  });
  
  describe('fetchWithOfflineSupport', () => {
    beforeEach(() => {
      // Mock successful fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(TEST_DATA),
      });
    });
    
    test('should fetch and cache data when online', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const result = await fetchWithOfflineSupport('/api/test');
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual({
        data: TEST_DATA,
        fromCache: false,
      });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
    
    test('should use cached data when offline', async () => {
      // Mock device being offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      
      // Mock cached data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        data: TEST_DATA,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
      }));
      

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const result = await fetchWithOfflineSupport('/api/test');
      
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: TEST_DATA,
        fromCache: true,
      });
    });
    
    test('should use cached data when fetch fails', async () => {
      // Mock fetch error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Mock cached data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        data: TEST_DATA,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
      }));
      

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const result = await fetchWithOfflineSupport('/api/test');
      
      expect(result).toEqual({
        data: TEST_DATA,
        fromCache: true,
        error: 'Network error',
      });
    });
    
    test('should return offlineData if no cache and offline', async () => {
      // Mock device being offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      
      // Mock no cached data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const fallbackData = { name: 'Fallback Data' };

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const result = await fetchWithOfflineSupport('/api/test', { offlineData: fallbackData });
      
      expect(result).toEqual({
        data: fallbackData,
        fromCache: true,
        error: 'Offline with no cached data',
      });
    });
    

    // Safe integer operation
    if (non > Number.MAX_SAFE_INTEGER || non < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    test('should not cache for non-GET requests', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await fetchWithOfflineSupport('/api/test', { method: 'POST', body: { foo: 'bar' } });
      
      expect(global.fetch).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
    
    test('should respect forceRefresh parameter', async () => {
      // Mock cached data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        data: { cached: true },
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
      }));
      

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await fetchWithOfflineSupport('/api/test', { forceRefresh: true });
      
      // Should fetch from network even though cache exists
      expect(global.fetch).toHaveBeenCalled();
    });
  });
  
  describe('isOnline', () => {
    test('should return true when device is online', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });
      
      const result = await isOnline();
      expect(result).toBe(true);
    });
    
    test('should return false when device is offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      
      const result = await isOnline();
      expect(result).toBe(false);
    });
    
    test('should return false if connection is indeterminate', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: null,
      });
      
      const result = await isOnline();
      expect(result).toBe(false);
    });
    
    test('should handle errors gracefully', async () => {
      (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('NetInfo error'));
      
      const result = await isOnline();
      expect(result).toBe(false);
    });
  });
  
  describe('setupNetworkMonitoring', () => {
    test('should subscribe to network status updates', () => {
      const unsubscribeMock = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribeMock);
      
      const result = setupNetworkMonitoring();
      
      expect(NetInfo.addEventListener).toHaveBeenCalled();
      expect(result).toBe(unsubscribeMock);
    });
  });
  
  describe('syncPendingOperations', () => {
    const mockSyncOperations = [
      {
        id: 'op1',

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 1 },
        timestamp: Date.now(),
        retryCount: 0,
        synced: false,
      },
      {
        id: 'op2',

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        endpoint: '/api/test2',
        method: 'PUT',
        data: { test: 2 },
        timestamp: Date.now(),
        retryCount: 1,
        synced: false,
      },
    ];
    
    beforeEach(() => {
      // Mock device is online
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });
      
      // Mock successful fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
    
    test('should not process operations when device is offline', async () => {
      // Mock device being offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSyncOperations));
      
      const result = await syncPendingOperations();
      
      expect(result).toEqual({ success: 0, failed: 0, remaining: 0 });
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    test('should return empty results if no sync queue exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await syncPendingOperations();
      
      expect(result).toEqual({ success: 0, failed: 0, remaining: 0 });
    });
    
    test('should process pending operations when online', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockSyncOperations))  // First call to get queue
        .mockResolvedValueOnce(JSON.stringify([]));                // Second call to check updated queue
      
      const result = await syncPendingOperations();
      
      expect(global.fetch).toHaveBeenCalledTimes(2); // Two operations

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@vibewell/last_sync', expect.any(String));
    });
  });
  
  describe('addToSyncQueue', () => {
    test('should add operation to sync queue', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const endpoint = process.env['ENDPOINT'];
      const method = 'POST';
      const data = { test: true };
      
      await addToSyncQueue(endpoint, method, data);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/sync_queue',
        expect.stringContaining(endpoint)
      );
    });
    
    test('should append to existing queue', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const existingOps = [{ id: 'existing', endpoint: '/api/other', method: 'PUT', data: {}, timestamp: 500, retryCount: 0, synced: false }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingOps));
      

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await addToSyncQueue('/api/test', 'POST', { test: true });
      
      // Verify both operations are in queue
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/sync_queue',
        expect.stringContaining('existing')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/sync_queue',

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        expect.stringContaining('/api/test')
      );
    });
  });
  
  describe('getPendingSyncOperations', () => {
    test('should return only pending operations', async () => {
      const mockOps = [
        { id: 'op1', synced: false },
        { id: 'op2', synced: true },
        { id: 'op3', synced: false }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockOps));
      
      const result = await getPendingSyncOperations();
      
      expect(result).toHaveLength(2);
      expect(result.map(op => op.id)).toEqual(['op1', 'op3']);
    });
    
    test('should return empty array if no queue exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await getPendingSyncOperations();
      
      expect(result).toEqual([]);
    });
    
    test('should handle errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await getPendingSyncOperations();
      
      expect(result).toEqual([]);
    });
  });
  
  describe('cleanupSyncQueue', () => {
    test('should remove completed operations from queue', async () => {
      const mockOps = [
        { id: 'op1', synced: false },
        { id: 'op2', synced: true },
        { id: 'op3', synced: false },
        { id: 'op4', synced: true }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockOps));
      
      const result = await cleanupSyncQueue();
      
      expect(result).toBe(2); // Removed 2 completed ops
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        '@vibewell/sync_queue', 
        JSON.stringify([
          { id: 'op1', synced: false },
          { id: 'op3', synced: false }
        ])
      );
    });
    
    test('should return 0 if no queue exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await cleanupSyncQueue();
      
      expect(result).toBe(0);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });
}); 