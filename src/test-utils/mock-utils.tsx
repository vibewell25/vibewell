/**
 * Mock utilities for testing
 * 
 * This file provides utilities for mocking various parts of the application
 * including API responses, services, localStorage, and more.
 */
import { jest } from '@jest/globals';

/**
 * Interface for mock API response
 */
export interface MockApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  ok: boolean;
  json: jest.Mock;
  text: jest.Mock;
}

/**
 * Create a mock API response
 * @param data - The data to include in the response
 * @param status - HTTP status code
 * @param headers - HTTP headers
 * @returns Mock API response
 */
export function mockApiResponse<T = any>(
  data: T, 
  status: number = 200, 
  headers: Record<string, string> = {}
): MockApiResponse<T> {
  return {
    data,
    status,
    headers,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

/**
 * Mock fetch for API testing
 * @param response - The response to return from fetch
 * @returns Mocked fetch function
 */
export function mockFetch<T = any>(
  response: MockApiResponse<T> | (() => MockApiResponse<T>)
): jest.Mock {
  return jest.fn().mockResolvedValue(
    typeof response === 'function' 
      ? response() 
      : response
  );
}

/**
 * Interface for mock storage
 */
export interface MockStorage {
  getItem: jest.Mock<string | null, [key: string]>;
  setItem: jest.Mock<void, [key: string, value: string]>;
  removeItem: jest.Mock<void, [key: string]>;
  clear: jest.Mock<void, []>;
  key: jest.Mock<string | null, [index: number]>;
  length: number;
  _getStore: () => Record<string, string>;
}

/**
 * Setup mock for localStorage
 */
export function setupLocalStorageMock(): MockStorage {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = String(value);
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
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
export function setupSessionStorageMock(): MockStorage {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = String(value);
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
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
 * Interface for mock media query list
 */
export interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

/**
 * Mock window.matchMedia
 */
export function setupMatchMediaMock(): jest.Mock<MockMediaQueryList, [query: string]> {
  const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });
  
  return matchMediaMock;
}

/**
 * Interface for mock IntersectionObserver
 */
export interface MockIntersectionObserver {
  root: Element | null;
  rootMargin: string;
  thresholds: ReadonlyArray<number>;
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
  takeRecords: jest.Mock;
}

/**
 * Mock IntersectionObserver
 */
export function setupIntersectionObserverMock(): jest.Mock<MockIntersectionObserver, [callback: IntersectionObserverCallback, options?: IntersectionObserverInit]> {
  const mockIntersectionObserver = jest.fn().mockImplementation(function(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): MockIntersectionObserver {
    return {
      root: options?.root || null,
      rootMargin: options?.rootMargin || '',
      thresholds: Array.isArray(options?.threshold)
        ? options.threshold
        : [options?.threshold || 0],
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn().mockReturnValue([]),
    };
  });

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  });
  
  return mockIntersectionObserver;
}

/**
 * Interface for mock ResizeObserver
 */
export interface MockResizeObserver {
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
}

/**
 * Mock ResizeObserver
 */
export function setupResizeObserverMock(): jest.Mock<MockResizeObserver, []> {
  const mockResizeObserver = jest.fn().mockImplementation(function(): MockResizeObserver {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: mockResizeObserver,
  });
  
  return mockResizeObserver;
}

/**
 * Interface for all browser mocks
 */
export interface BrowserMocks {
  localStorage: MockStorage;
  sessionStorage: MockStorage;
  matchMedia: jest.Mock<MockMediaQueryList, [query: string]>;
  intersectionObserver: jest.Mock<MockIntersectionObserver, [callback: IntersectionObserverCallback, options?: IntersectionObserverInit]>;
  resizeObserver: jest.Mock<MockResizeObserver, []>;
}

/**
 * Setup all common browser mocks
 * @returns All mock objects
 */
export function setupAllBrowserMocks(): BrowserMocks {
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
 * @param methods - Methods to implement
 * @returns Mocked service
 */
export function createMockService<T extends Record<string, any>>(methods: Partial<T> = {}): T {
  return {
    ...Object.keys(methods).reduce((acc, key) => {
      acc[key] = jest.fn(methods[key]);
      return acc;
    }, {} as Record<string, jest.Mock>),
  } as T;
}

/**
 * Mock window.location
 * @param {Object} properties - Properties to override
 */
export function mockWindowLocation(properties = {}) {
  const originalLocation = window.location;
  delete window.location;
  
  window.location = {
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    toString: jest.fn(),
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
  
  methods.forEach(method => {
    originalMethods[method] = console[method];
    console[method] = jest.fn();
  });
  
  return () => {
    methods.forEach(method => {
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