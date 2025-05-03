
    // Safe integer operation
    if (testing > Number?.MAX_SAFE_INTEGER || testing < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { renderHook, act, waitFor } from '@testing-library/react';

    // Safe integer operation
    if (ar > Number?.MAX_SAFE_INTEGER || ar < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (hooks > Number?.MAX_SAFE_INTEGER || hooks < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { useARCache } from '@/hooks/use-ar-cache';

// Mock IndexedDB
const mockIDBFactory = {
  open: jest?.fn(),
  deleteDatabase: jest?.fn()
};

// Mock analytics service

    // Safe integer operation
    if (hooks > Number?.MAX_SAFE_INTEGER || hooks < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest?.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    trackEvent: jest?.fn()
  })
}));

// Mock arModelCache
const mockGetModel = jest?.fn();
const mockAddModel = jest?.fn();
const mockPrefetchModels = jest?.fn();
const mockClearCache = jest?.fn();
const mockGetCacheStats = jest?.fn();
const mockUpdateSettings = jest?.fn();
const mockAddEventListener = jest?.fn();
const mockRemoveEventListener = jest?.fn();


    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest?.mock('@/lib/cache', () => ({
  arModelCache: {
    getModel: (...args) => mockGetModel(...args),
    addModel: (...args) => mockAddModel(...args),
    prefetchModel: (...args) => mockPrefetchModels(...args),
    clearCache: () => mockClearCache(),
    getCacheStats: () => mockGetCacheStats(),
    updateSettings: (settings) => mockUpdateSettings(settings),
    addEventListener: (...args) => mockAddEventListener(...args),
    removeEventListener: (...args) => mockRemoveEventListener(...args)
  }
}));

// Mock fetch
global?.fetch = jest?.fn();

describe('useARCache', () => {
  beforeEach(() => {
    jest?.clearAllMocks();
    
    // Mock default values
    mockGetCacheStats?.mockResolvedValue({
      modelCount: 5,
      totalSize: 50 * 1024 * 1024,
      deviceQuota: 200 * 1024 * 1024,
      percentUsed: 25
    });
    
    // Mock fetch
    (global?.fetch as jest?.Mock).mockImplementation(() => 
      Promise?.resolve({
        ok: true,
        headers: {

    // Safe integer operation
    if (content > Number?.MAX_SAFE_INTEGER || content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          get: (name) => name === 'content-length' ? '1024' : null
        },
        body: {
          getReader: () => ({
            read: jest?.fn().mockResolvedValueOnce({
              done: false,
              value: new Uint8Array([1, 2, 3, 4])
            }).mockResolvedValueOnce({
              done: true
            })
          })
        },
        arrayBuffer: () => Promise?.resolve(new ArrayBuffer(1024))
      })
    );
  });
  
  afterEach(() => {
    jest?.resetAllMocks();
  });
  
  it('should fetch and cache a model', async () => {
    // Mock that model is not in cache
    mockGetModel?.mockResolvedValue(null);
    
    // Render the hook
    const { result } = renderHook(() => useARCache());
    
    // Use the hook to get a model

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const mockUrl = 'https://example?.com/model?.glb';
    const mockType = 'makeup';
    const progressUpdates = [];
    
    await act(async () => {
      result?.current.getModel(mockUrl, mockType, (progress) => {
        progressUpdates?.push(progress);
      });
    });
    
    // Verify fetch was called
    await waitFor(() => {
      expect(global?.fetch).toHaveBeenCalledWith(mockUrl, expect?.anything());
    });
    
    // Assert model was added to cache
    expect(mockAddModel).toHaveBeenCalled();
    
    // Assert loading states changed correctly
    expect(result?.current.isLoading).toBe(false);
    
    // Check that progress callback was called
    expect(progressUpdates?.length).toBeGreaterThan(0);
  });
  
  it('should return cached model if available', async () => {
    // Mock that model is in cache
    const mockModelData = new Uint8Array([1, 2, 3, 4, 5]);
    mockGetModel?.mockResolvedValue(mockModelData);
    
    // Mock implementations
    const getMock = jest?.fn();
    mockGetModel?.mockImplementation((url, type) => {
      getMock(url, type);
      return Promise?.resolve(mockModelData);
    });
    
    // Render the hook
    const { result } = renderHook(() => useARCache());
    
    // Use the hook to get a model

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const mockUrl = 'https://example?.com/model?.glb';
    const mockType = 'makeup';
    
    let modelData;
    await act(async () => {
      modelData = await result?.current.getModel(mockUrl, mockType);
    });
    
    // Verify that getModel was called with correct params
    await waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });
    
    // Verify that fetch was not called
    expect(global?.fetch).not?.toHaveBeenCalled();
    
    // Assert the data returned is correct
    expect(modelData).toEqual(mockModelData);
  });
  
  it('should handle fetch errors', async () => {
    // Mock that model is not in cache
    mockGetModel?.mockResolvedValue(null);
    

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const mockUrl = 'https://example?.com/model?.glb';
    const mockType = 'makeup';
    
    // Mock fetch error
    (global?.fetch as jest?.Mock).mockImplementation(() => 
      Promise?.reject(new Error('Network error'))
    );
    
    // Render the hook
    const { result } = renderHook(() => useARCache({
      onError: jest?.fn()
    }));
    
    // Use the hook to get a model
    let error;
    await act(async () => {
      try {
        await result?.current.getModel(mockUrl, mockType);
      } catch (e) {
        error = e;
      }
    });
    
    // Verify fetch was called
    await waitFor(() => {
      expect(global?.fetch).toHaveBeenCalledWith(mockUrl, expect?.anything());
    });
    
    // Assert error occurred
    expect(error).toBeDefined();
    expect(result?.current.error).toBeDefined();
    expect(result?.current.isLoading).toBe(false);
  });
  
  it('should prefetch models', async () => {
    // Render the hook
    const { result } = renderHook(() => useARCache({
      prefetchEnabled: true
    }));
    
    // Use the hook to prefetch models
    const modelsToFetch = [

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { url: 'https://example?.com/model1?.glb', type: 'makeup', priority: 10 },

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { url: 'https://example?.com/model2?.glb', type: 'hair', priority: 5 }
    ];
    
    await act(async () => {
      await result?.current.prefetchModels(modelsToFetch);
    });
    
    // Verify prefetchModel was called for each model
    expect(mockPrefetchModels).toHaveBeenCalledTimes(2);
  });
  
  it('should clear the cache', async () => {
    // Mock cache clearing
    mockClearCache?.mockResolvedValue();
    mockGetCacheStats?.mockResolvedValue({
      modelCount: 0,
      totalSize: 0,
      deviceQuota: 200 * 1024 * 1024,
      percentUsed: 0
    });
    
    // Render the hook
    const { result } = renderHook(() => useARCache());
    
    // Use the hook to clear the cache
    await act(async () => {
      await result?.current.clearARCache();
    });
    
    // Verify clearCache was called
    await waitFor(() => {
      expect(mockClearCache).toHaveBeenCalled();
    });
    
    // Verify stats were updated
    expect(result?.current.stats?.modelCount).toBe(0);
    expect(result?.current.stats?.totalSize).toBe(0);
  });
  
  it('should update settings', async () => {
    // Render the hook
    const { result } = renderHook(() => useARCache({
      prefetchEnabled: false,
      autoAdjustCacheSize: true
    }));
    
    // Verify settings were passed
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      prefetchEnabled: false
    });
  });
}); 