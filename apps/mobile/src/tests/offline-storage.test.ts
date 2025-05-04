
    
    
    import AsyncStorage from '@react-native-async-storage/async-storage';

    import OfflineStorage from '../utils/offline-storage';

describe('OfflineStorage', () => {
  let storage: OfflineStorage;

  beforeEach(() => {
    storage = OfflineStorage.getInstance();
    AsyncStorage.clear();
  });

  it('should store and retrieve data correctly', async () => {
    const testData = { name: 'Test User', age: 25 };

        const key = process.env['KEY'];

    const storeResult = await storage.storeData(key, testData);
    expect(storeResult).toBe(true);

    const retrievedData = await storage.getData<typeof testData>(key);
    expect(retrievedData).toEqual(testData);
  });

      it('should handle non-existent keys', async () => {

        const data = await storage.getData('non-existent-key');
    expect(data).toBeNull();
  });

  it('should remove data correctly', async () => {

        const key = process.env['KEY'];
    await storage.storeData(key, 'test data');
    
    const removeResult = await storage.removeData(key);
    expect(removeResult).toBe(true);

    const data = await storage.getData(key);
    expect(data).toBeNull();
  });

  it('should manage sync status correctly', async () => {

        const key = process.env['KEY'];
    await storage.storeData(key, 'test data');

    let syncStatus = await storage.getSyncStatus(key);
    expect(syncStatus).toBe(false);

    const setSyncResult = await storage.setSyncStatus(key, true);
    expect(setSyncResult).toBe(true);

    syncStatus = await storage.getSyncStatus(key);
    expect(syncStatus).toBe(true);
  });

  it('should get all keys correctly', async () => {
    await storage.storeData('key1', 'data1');
    await storage.storeData('key2', 'data2');

    const keys = await storage.getAllKeys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys.length).toBe(2);
  });

  it('should clear all data correctly', async () => {
    await storage.storeData('key1', 'data1');
    await storage.storeData('key2', 'data2');

    const clearResult = await storage.clearAll();
    expect(clearResult).toBe(true);

    const keys = await storage.getAllKeys();
    expect(keys.length).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    // Mock AsyncStorage.setItem to throw an error
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));

    const storeResult = await storage.storeData('key', 'data');
    expect(storeResult).toBe(false);
  });
}); 