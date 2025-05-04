
    
    import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineData } from '../useOfflineData';

    import OfflineStorage from '../../utils/offline-storage';

    jest.mock('../../utils/offline-storage');

const mockOfflineStorage = {
  getData: jest.fn(),
  storeData: jest.fn(),
  removeData: jest.fn(),
  getSyncStatus: jest.fn(),
  getInstance: jest.fn().mockReturnValue({
    getData: jest.fn(),
    storeData: jest.fn(),
    removeData: jest.fn(),
    getSyncStatus: jest.fn()
  })
};

// Mock the default export
(OfflineStorage as unknown as jest.Mock).mockImplementation(() => mockOfflineStorage);

describe('useOfflineData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load initial data', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockOfflineStorage.getInstance().getData.mockResolvedValueOnce(mockData);
    mockOfflineStorage.getInstance().getSyncStatus.mockReturnValueOnce('synced');

    const { result, waitForNextUpdate } = renderHook(() =>

          useOfflineData({ key: 'test-key' })
    );

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.syncStatus).toBe('synced');
  });

  it('should save data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const onSync = jest.fn();
    
    const { result } = renderHook(() =>

          useOfflineData({ key: 'test-key', onSync })
    );

    await act(async () => {
      await result.current.saveData(mockData);
    });

        expect(mockOfflineStorage.getInstance().storeData).toHaveBeenCalledWith('test-key', mockData);
    expect(onSync).toHaveBeenCalledWith(mockData);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.syncStatus).toBe('synced');
  });

  it('should remove data successfully', async () => {
    const { result } = renderHook(() =>

          useOfflineData({ key: 'test-key' })
    );

    await act(async () => {
      await result.current.removeData();
    });

        expect(mockOfflineStorage.getInstance().removeData).toHaveBeenCalledWith('test-key');
    expect(result.current.data).toBeNull();
    expect(result.current.syncStatus).toBeNull();
  });

  it('should handle errors during data loading', async () => {
    const error = new Error('Failed to load');
    mockOfflineStorage.getInstance().getData.mockRejectedValueOnce(error);

    const { result, waitForNextUpdate } = renderHook(() =>

          useOfflineData({ key: 'test-key' })
    );

    await waitForNextUpdate();

    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors during data saving', async () => {
    const error = new Error('Failed to save');
    mockOfflineStorage.getInstance().storeData.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>

          useOfflineData({ key: 'test-key' })
    );

    await act(async () => {
      await result.current.saveData({ id: 1 });
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.syncStatus).toBe('failed');
  });
}); 