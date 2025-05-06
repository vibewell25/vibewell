import OfflineStorage from '@/utils/offline-storage';

    
    
    import AsyncStorage from '@react-native-async-storage/async-storage';

    
    
    jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  getAllKeys: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn()
));

describe('Sync Queue', () => {
  let storage: OfflineStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = OfflineStorage.getInstance();
it('should add items to sync queue when offline', async () => {
    // Mock storage operations
    const mockItem = { data: 'test', timestamp: Date.now(), synced: false };
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItem));

    // Store data

        await storage.storeData('test-key', 'test');

    // Verify item was added to storage with correct sync status
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(

          'test-key',
      expect.stringContaining('"synced":false')
it('should process sync queue in order', async () => {
    // Mock multiple items in storage
    const mockItems = {
      'key1': { data: 'data1', timestamp: Date.now() - 1000, synced: false },
      'key2': { data: 'data2', timestamp: Date.now(), synced: false }
(AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(['key1', 'key2']);
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue(
      Object.entries(mockItems).map(([key, value]) => [key, JSON.stringify(value)])
// Trigger sync queue processing
    await storage['processSyncQueue']();

    // Verify items were processed in order (by timestamp)
    const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    expect(setItemCalls[0][0]).toBe('key1');
    expect(setItemCalls[1][0]).toBe('key2');
it('should handle sync failures gracefully', async () => {
    // Mock a failed sync operation
    const mockItem = { data: 'test', timestamp: Date.now(), synced: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItem));
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Sync failed'));

    // Attempt to sync

        await storage.storeData('test-key', 'test');
    
    // Verify error was handled and item remains in queue

        const syncStatus = await storage.getSyncStatus('test-key');
    expect(syncStatus).toBe(false);
it('should retry failed sync operations', async () => {
    // Mock initial sync failure then success
    const mockItem = { data: 'test', timestamp: Date.now(), synced: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItem));
    (AsyncStorage.setItem as jest.Mock)
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined);

    // First attempt

        await storage.storeData('test-key', 'test');
    
    // Trigger retry
    await storage['processSyncQueue']();

    // Verify item was eventually synced
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);

        const syncStatus = await storage.getSyncStatus('test-key');
    expect(syncStatus).toBe(true);
it('should maintain data consistency during sync', async () => {
    // Mock concurrent operations
    const mockItem = { data: 'test', timestamp: Date.now(), synced: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockItem));

    // Simulate concurrent operations
    await Promise.all([
      storage.storeData('key1', 'data1'),
      storage.storeData('key2', 'data2'),
      storage.removeData('key1'),

          storage.storeData('key2', 'updated-data2')
    ]);

    // Verify final state is consistent
    const data = await storage.getData('key2');

        expect(data).toBe('updated-data2');
    const key1Exists = await storage.getData('key1');
    expect(key1Exists).toBeNull();
