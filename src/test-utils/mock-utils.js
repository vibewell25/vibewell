/**
 * Mock utilities for testing
 *
 * This file provides utilities for mocking various parts of the application
 * including API responses, services, localStorage, and more.
 */
import { vi } from 'vitest';

/**
 * Create a mock API response
 * @param {Object} data - The data to include in the response
 * @param {number} status - HTTP status code
 * @param {Object} headers - HTTP headers
 * @returns {Object} - Mock API response
 */
export function mockApiResponse(data, status = 200, headers = {}) {
  return {
    data,
    status,
    headers,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

/**
 * Mock fetch for API testing
 * @param {*} response - The response to return from fetch
 * @returns {Function} - Mocked fetch function
 */
export function mockFetch(response) {
  return vi.fn().mockResolvedValue(typeof response === 'function' ? response() : response);
}

/**
 * Setup mock for localStorage
 */
export function setupLocalStorageMock() {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length;
      },
      // For testing purposes, access to the store
      _getStore: () => store,
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
}

/**
 * Setup mock for sessionStorage
 */
export function setupSessionStorageMock() {
  const sessionStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length;
      },
      // For testing purposes, access to the store
      _getStore: () => store,
    };
  })();

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  return sessionStorageMock;
}

/**
 * Mock window.matchMedia
 */
export function setupMatchMediaMock() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Mock IntersectionObserver
 */
export function setupIntersectionObserverMock() {
  const mockIntersectionObserver = vi.fn().mockImplementation(function (callback, options) {
    return {
      root: options?.root || null,
      rootMargin: options?.rootMargin || '',
      thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0],
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn().mockReturnValue([]),
    };
  });

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  });

  return mockIntersectionObserver;
}

/**
 * Mock ResizeObserver
 */
export function setupResizeObserverMock() {
  const mockResizeObserver = vi.fn().mockImplementation(function () {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: mockResizeObserver,
  });

  return mockResizeObserver;
}

/**
 * Setup all common browser mocks
 * @returns {Object} - All mock objects
 */
export function setupAllBrowserMocks() {
  return {
    localStorage: setupLocalStorageMock(),
    sessionStorage: setupSessionStorageMock(),
    matchMedia: setupMatchMediaMock(),
    intersectionObserver: setupIntersectionObserverMock(),
    resizeObserver: setupResizeObserverMock(),
  };
}

/**
 * Create a mock service with all methods stubbed
 * @param {Object} methods - Methods to implement
 * @returns {Object} - Mocked service
 */
export function createMockService(methods = {}) {
  return {
    ...Object.keys(methods).reduce((acc, key) => {
      acc[key] = vi.fn(methods[key]);
      return acc;
    }, {}),
  };
}

/**
 * Mock window.location
 * @param {Object} properties - Properties to override
 */
export function mockWindowLocation(properties = {}) {
  const originalLocation = window.location;
  delete window.location;

  window.location = {
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
    toString: vi.fn(),
    hash: '',
    host: 'localhost:3000',
    hostname: 'localhost',
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    port: '3000',
    protocol: 'http:',
    search: '',
    ...properties,
  };

  return () => {
    window.location = originalLocation;
  };
}

/**
 * Mock console methods for testing errors or warnings
 * @param {Array} methods - Methods to mock (e.g., ['error', 'warn'])
 */
export function mockConsole(methods = ['error', 'warn', 'log', 'info', 'debug']) {
  const originalMethods = {};

  methods.forEach((method) => {
    originalMethods[method] = console[method];
    console[method] = vi.fn();
  });

  return () => {
    methods.forEach((method) => {
      console[method] = originalMethods[method];
    });
  };
}

/**
 * Mock global Date object
 * @param {string|number|Date} mockDate - Date to mock
 */
export function mockDate(mockDate) {
  const realDate = global.Date;
  const mockDateObj = new realDate(mockDate);

  global.Date = class extends realDate {
    constructor(...args) {
      return args.length ? new realDate(...args) : mockDateObj;
    }

    static now() {
      return mockDateObj.getTime();
    }
  };

  return () => {
    global.Date = realDate;
  };
}
