/**
 * Mock utilities for testing
 *
 * This file provides utilities for mocking various parts of the application
 * including API responses, services, localStorage, and more.
 */
import { vi, type Mock, type SpyInstance } from 'vitest';
import type { Procedure } from '@trpc/server';

/**
 * Interface for mock API response
 */
export interface MockApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  ok: boolean;
  json: Mock;
  text: Mock;
}

/**
 * Create a mock API response
 */
export function mockApiResponse<T>(data: T): Mock {
  return vi.fn().mockResolvedValue({ data });
}

/**
 * Mock fetch for API testing
 * @param response - The response to return from fetch
 * @returns Mocked fetch function
 */
export function mockFetch<T = any>(
  response: MockApiResponse<T> | (() => MockApiResponse<T>)
): vi.Mock {
  return vi.fn().mockResolvedValue(typeof response === 'function' ? response() : response);
}

/**
 * Mock storage interface
 */
export interface MockStorage {
  getItem: Mock;
  setItem: Mock;
  removeItem: Mock;
  clear: Mock;
  key: Mock;
  length: number;
  _getStore: () => Record<string, string>;
}

/**
 * Create a mock storage object (localStorage/sessionStorage)
 */
export function createMockStorage(): MockStorage {
  const store: Record<string, string | undefined> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      store[key] = undefined;
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => {
        store[key] = undefined;
      });
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
    _getStore: () =>
      Object.fromEntries(Object.entries(store).filter(([_, v]) => v !== undefined)) as Record<
        string,
        string
      >,
  };
}

/**
 * Mock MediaQueryList interface
 */
export interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: Mock;
  removeListener: Mock;
  addEventListener: Mock;
  removeEventListener: Mock;
  dispatchEvent: Mock;
}

/**
 * Mock window.matchMedia
 */
export function setupMatchMediaMock(): Mock {
  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });

  return matchMediaMock;
}

/**
 * Mock IntersectionObserver interface
 */
export interface MockIntersectionObserver {
  root: Element | null;
  rootMargin: string;
  thresholds: ReadonlyArray<number>;
  observe: Mock;
  unobserve: Mock;
  disconnect: Mock;
  takeRecords: Mock;
}

/**
 * Mock IntersectionObserver
 */
export function setupIntersectionObserverMock(): Mock {
  const mockIntersectionObserver = vi.fn().mockImplementation(function (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    return {
      root: options?.root || null,
      rootMargin: options?.rootMargin || '0px',
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
 * Mock ResizeObserver interface
 */
export interface MockResizeObserver {
  observe: Mock;
  unobserve: Mock;
  disconnect: Mock;
}

/**
 * Mock ResizeObserver
 */
export function setupResizeObserverMock(): Mock {
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
 * Interface for all browser mocks
 */
export interface BrowserMocks {
  localStorage: MockStorage;
  sessionStorage: MockStorage;
  matchMedia: vi.Mock<MockMediaQueryList, [query: string]>;
  intersectionObserver: vi.Mock<
    MockIntersectionObserver,
    [callback: IntersectionObserverCallback, options?: IntersectionObserverInit]
  >;
  resizeObserver: vi.Mock<MockResizeObserver, []>;
}

/**
 * Setup all common browser mocks
 * @returns All mock objects
 */
export function setupAllBrowserMocks(): BrowserMocks {
  return {
    localStorage: createMockStorage(),
    sessionStorage: createMockStorage(),
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
    ...Object.keys(methods).reduce(
      (acc, key) => {
        acc[key] = vi.fn(methods[key]);
        return acc;
      },
      {} as Record<string, vi.Mock>
    ),
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
 * Mock console methods
 */
export function mockConsole(
  methods: (keyof Console)[] = ['log', 'error', 'warn', 'info', 'debug']
): () => void {
  const originalMethods: Partial<Record<keyof Console, any>> = {};

  methods.forEach(method => {
    if (console[method]) {
      originalMethods[method] = console[method];
      (console[method] as any) = vi.fn();
    }
  });

  return () => {
    methods.forEach(method => {
      if (originalMethods[method]) {
        console[method] = originalMethods[method];
      }
    });
  };
}

/**
 * Mock global Date object
 */
export function mockDate(mockDate: string | number | Date): () => void {
  const RealDate = Date;
  const mockDateObj = new RealDate(mockDate);

  class MockDate extends RealDate {
    constructor(...args: ConstructorParameters<typeof Date>) {
      super();
      if (args.length) {
        return new RealDate(...args);
      }
      return mockDateObj;
    }

    static override now() {
      return mockDateObj.getTime();
    }
  }

  global.Date = MockDate as DateConstructor;

  return () => {
    global.Date = RealDate;
  };
}

export function mockLocation(): void {
  const mockLocation = {
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
    toString: vi.fn(),
    hash: '',
    host: '',
    hostname: '',
    href: '',
    origin: '',
    pathname: '',
    port: '',
    protocol: '',
    search: '',
  } as unknown as Location;

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: mockLocation,
    writable: true,
  });
}

export function mockProcedure<T>(data: T): Procedure<any, any, any, any> {
  return {
    _def: {
      query: vi.fn().mockResolvedValue(data),
    },
  } as unknown as Procedure<any, any, any, any>;
}
