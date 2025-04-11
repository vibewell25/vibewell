import { renderHook, act, waitFor } from '@testing-library/react';
import { useARCache } from '@/hooks/use-ar-cache';

// Mock IndexedDB
const mockIndexedDB = {
  deleteDatabase: jest.fn(),
  open: jest.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          put: jest.fn(() => ({
            onsuccess: null,
            onerror: null
          })),
          delete: jest.fn(() => ({
            onsuccess: null,
            onerror: null
          })),
          get: jest.fn(() => ({
            onsuccess: null,
            onerror: null
          })),
          getAll: jest.fn(() => ({
            onsuccess: null,
            onerror: null
          })),
          index: jest.fn(() => ({
            openCursor: jest.fn(() => ({
              onsuccess: null,
              onerror: null
            }))
          }))
        })),
        oncomplete: null
      })),
      createObjectStore: jest.fn(),
      close: jest.fn()
    }
  }))
};

// Mock fetch
global.fetch = jest.fn();

// Mock IndexedDB implementation
Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB
});

describe('useARCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup fetch mock
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      })
    );
  });

  it('should initialize with default options', () => {
    // Act
    const { result } = renderHook(() => useARCache());

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadingProgress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.stats).toEqual({
      modelCount: 0,
      totalSize: 0,
      deviceQuota: 0,
      percentUsed: 0
    });
    expect(typeof result.current.getModel).toBe('function');
    expect(typeof result.current.prefetchModel).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
  });

  it('should initialize IndexedDB on mount', () => {
    // Arrange
    const openDBMock = mockIndexedDB.open;

    // Act
    renderHook(() => useARCache());

    // Assert
    expect(openDBMock).toHaveBeenCalled();
  });

  it('should fetch and cache a model', async () => {
    // Arrange
    const mockUrl = 'https://example.com/model.glb';
    const mockType = 'makeup';
    
    // Mock successful IndexedDB operations
    const openDBSuccess = (request: any) => {
      if (request.onupgradeneeded) request.onupgradeneeded({ target: { result: request.result } });
      if (request.onsuccess) request.onsuccess({ target: { result: request.result } });
    };
    
    const getMock = jest.fn();
    const putMock = jest.fn();
    
    mockIndexedDB.open.mockImplementation(() => {
      const request = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: getMock,
              put: putMock
            })),
            oncomplete: null
          })),
          createObjectStore: jest.fn(),
          close: jest.fn()
        }
      };
      
      // Simulate IndexedDB success
      setTimeout(() => openDBSuccess(request), 0);
      
      return request;
    });
    
    // Simulate model not in cache
    getMock.mockImplementation(() => {
      const request = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({ target: { result: null } });
      }, 0);
      return request;
    });
    
    // Simulate successful model save
    putMock.mockImplementation(() => {
      const request = {
        onsuccess: null,
        onerror: null
      };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({});
      }, 0);
      return request;
    });

    // Act
    const { result } = renderHook(() => useARCache());
    
    let modelData;
    act(() => {
      modelData = result.current.getModel(mockUrl, mockType, jest.fn());
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    });

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(putMock).toHaveBeenCalled();
    await expect(modelData).resolves.toBeInstanceOf(Uint8Array);
  });

  it('should return cached model if available', async () => {
    // Arrange
    const mockUrl = 'https://example.com/model.glb';
    const mockType = 'makeup';
    const mockCachedData = new Uint8Array(new ArrayBuffer(1024));
    
    // Mock successful IndexedDB operations
    const openDBSuccess = (request: any) => {
      if (request.onupgradeneeded) request.onupgradeneeded({ target: { result: request.result } });
      if (request.onsuccess) request.onsuccess({ target: { result: request.result } });
    };
    
    const getMock = jest.fn();
    
    mockIndexedDB.open.mockImplementation(() => {
      const request = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: getMock
            })),
            oncomplete: null
          })),
          createObjectStore: jest.fn(),
          close: jest.fn()
        }
      };
      
      // Simulate IndexedDB success
      setTimeout(() => openDBSuccess(request), 0);
      
      return request;
    });
    
    // Simulate model in cache
    getMock.mockImplementation(() => {
      const request = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({ 
          target: { 
            result: { 
              url: mockUrl, 
              type: mockType, 
              data: mockCachedData, 
              timestamp: Date.now(),
              size: mockCachedData.byteLength
            } 
          } 
        });
      }, 0);
      return request;
    });

    // Act
    const { result } = renderHook(() => useARCache());
    
    let modelData;
    act(() => {
      modelData = result.current.getModel(mockUrl, mockType, jest.fn());
    });
    
    await waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });

    // Assert
    expect(global.fetch).not.toHaveBeenCalled();
    expect(getMock).toHaveBeenCalled();
    await expect(modelData).resolves.toBe(mockCachedData);
  });

  it('should handle fetch errors', async () => {
    // Arrange
    const mockUrl = 'https://example.com/model.glb';
    const mockType = 'makeup';
    const mockError = new Error('Network error');
    
    // Mock fetch error
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.reject(mockError)
    );
    
    // Mock successful IndexedDB operations
    const openDBSuccess = (request: any) => {
      if (request.onupgradeneeded) request.onupgradeneeded({ target: { result: request.result } });
      if (request.onsuccess) request.onsuccess({ target: { result: request.result } });
    };
    
    const getMock = jest.fn();
    
    mockIndexedDB.open.mockImplementation(() => {
      const request = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: getMock
            })),
            oncomplete: null
          })),
          createObjectStore: jest.fn(),
          close: jest.fn()
        }
      };
      
      // Simulate IndexedDB success
      setTimeout(() => openDBSuccess(request), 0);
      
      return request;
    });
    
    // Simulate model not in cache
    getMock.mockImplementation(() => {
      const request = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({ target: { result: null } });
      }, 0);
      return request;
    });

    // Act
    const { result } = renderHook(() => useARCache());
    
    let modelPromise;
    act(() => {
      modelPromise = result.current.getModel(mockUrl, mockType, jest.fn());
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    });

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    await expect(modelPromise).rejects.toThrow('Network error');
  });

  it('should prefetch a model', async () => {
    // Arrange
    const mockUrl = 'https://example.com/model.glb';
    const mockType = 'makeup';
    
    // Mock successful IndexedDB operations
    const openDBSuccess = (request: any) => {
      if (request.onupgradeneeded) request.onupgradeneeded({ target: { result: request.result } });
      if (request.onsuccess) request.onsuccess({ target: { result: request.result } });
    };
    
    const getMock = jest.fn();
    const putMock = jest.fn();
    
    mockIndexedDB.open.mockImplementation(() => {
      const request = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: getMock,
              put: putMock
            })),
            oncomplete: null
          })),
          createObjectStore: jest.fn(),
          close: jest.fn()
        }
      };
      
      // Simulate IndexedDB success
      setTimeout(() => openDBSuccess(request), 0);
      
      return request;
    });
    
    // Simulate model not in cache
    getMock.mockImplementation(() => {
      const request = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({ target: { result: null } });
      }, 0);
      return request;
    });
    
    // Simulate successful model save
    putMock.mockImplementation(() => {
      const request = {
        onsuccess: null,
        onerror: null
      };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({});
      }, 0);
      return request;
    });

    // Act
    const { result } = renderHook(() => useARCache({ prefetchEnabled: true }));
    
    act(() => {
      result.current.prefetchModel(mockUrl, mockType);
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    }, { timeout: 5000 });

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
  });

  it('should clear the cache', async () => {
    // Arrange
    const deleteDBMock = mockIndexedDB.deleteDatabase;
    
    // Act
    const { result } = renderHook(() => useARCache());
    
    act(() => {
      result.current.clearCache();
    });
    
    await waitFor(() => {
      expect(deleteDBMock).toHaveBeenCalled();
    });
    
    // Assert
    expect(deleteDBMock).toHaveBeenCalled();
  });
}); 