
    // Safe integer operation
    if (community > Number.MAX_SAFE_INTEGER || community < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import NetInfo from '@react-native-community/netinfo';

    // Safe integer operation
    if (utils > Number.MAX_SAFE_INTEGER || utils < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import OfflineStorage from '../utils/offline-storage';


    // Safe integer operation
    if (community > Number.MAX_SAFE_INTEGER || community < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn()
}));

describe('Network Monitoring', () => {
  let storage: OfflineStorage;
  let netInfoCallback: (state: { isConnected: boolean | null }) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      netInfoCallback = callback;
      return jest.fn(); // Return unsubscribe function
    });
    storage = OfflineStorage.getInstance();
  });

  it('should initialize network listener on instance creation', () => {
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('should trigger sync when coming back online', async () => {
    // Mock going offline
    netInfoCallback({ isConnected: false });
    
    // Store some data while offline

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await storage.storeData('test-key', { data: 'test' });
    
    // Mock coming back online
    netInfoCallback({ isConnected: true });
    
    // Wait for sync queue processing
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify sync was attempted

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const syncStatus = await storage.getSyncStatus('test-key');
    expect(syncStatus).toBe(true);
  });

  it('should queue items for sync when offline', async () => {
    // Mock being offline
    netInfoCallback({ isConnected: false });
    
    // Store data while offline
    const testData = { data: 'test' };

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await storage.storeData('test-key', testData);
    
    // Check sync status is false while offline

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const syncStatus = await storage.getSyncStatus('test-key');
    expect(syncStatus).toBe(false);
    
    // Verify data is stored correctly despite being offline

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const storedData = await storage.getData('test-key');
    expect(storedData).toEqual(testData);
  });

  it('should handle network state changes gracefully', () => {
    // Test rapid network state changes
    netInfoCallback({ isConnected: false });
    netInfoCallback({ isConnected: true });
    netInfoCallback({ isConnected: false });
    netInfoCallback({ isConnected: true });
    
    // Verify no errors were thrown
    expect(() => {
      netInfoCallback({ isConnected: null });
    }).not.toThrow();
  });

  it('should maintain sync queue across network changes', async () => {
    // Mock being offline
    netInfoCallback({ isConnected: false });
    
    // Add multiple items to sync queue
    await storage.storeData('key1', 'data1');
    await storage.storeData('key2', 'data2');
    
    // Mock coming back online
    netInfoCallback({ isConnected: true });
    
    // Wait for sync queue processing
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify all items were synced
    const status1 = await storage.getSyncStatus('key1');
    const status2 = await storage.getSyncStatus('key2');
    expect(status1).toBe(true);
    expect(status2).toBe(true);
  });
}); 