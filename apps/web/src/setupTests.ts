import { TextEncoder, TextDecoder } from 'util';

import { axe } from 'jest-axe';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Add axe to global scope
(global as any).axe = axe;

// Mock global Request and Headers for use with Next.js
(global as any).Request = class MockRequest {
  url: string;
  constructor(input: string, init: any) {
    Object.assign(this, init);
    this.url = input;
  }
} as any;

(global as any).Headers = class MockHeaders {
  private headers: Record<string, string> = {};
  constructor(init?: Record<string, string>) {
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  get(name: string): string | null {
    return this.headers[name.toLowerCase()] || null;
  }

  set(name: string, value: string): void {
    this.headers[name.toLowerCase()] = value;
  }

  has(name: string): boolean {
    return name.toLowerCase() in this.headers;
  }

  append(name: string, value: string): void {
    if (this.has(name)) {
      this.set(name, `${this.get(name)}, ${value}`);
    } else {
      this.set(name, value);
    }
  }

  delete(name: string): void {
    delete this.headers[name.toLowerCase()];
  }
} as any;

// Mock URL
(global as any).URL = class MockURL {
  pathname: string;
  searchParams: URLSearchParams;
  href: string;
  origin: string;
  search: string;
  host: string;
  hostname: string;
  port: string;
  protocol: string;

  constructor(url: string, base?: string) {
    this.href = url;
    this.pathname = '/' + url.split('/').slice(3).join('/');
    this.searchParams = new URLSearchParams('');
    this.origin = 'http://localhost:3000';
    this.search = '';
    this.host = 'localhost:3000';
    this.hostname = 'localhost';
    this.port = '3000';
    this.protocol = 'http:';
  }
} as any;

// Suppress React act() warnings

// This is helpful for third-party components like Radix UI that cause act() warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    (args[0].includes('Warning: An update to') &&
      args[0].includes('inside a test was not wrapped in act(...)')) ||
    args[0].includes('was not wrapped in act(...)')
  ) {
    return; // Suppress act() warnings
  }
  originalConsoleError(...args);
};

// Polyfill fetch for Node environments and browsers
import 'cross-fetch/polyfill';

// Only run browser-specific mocks when window is available
if (typeof window !== 'undefined') {
  // Set up localStorage mock
  class LocalStorageMock {
    private store: Record<string, string> = {};

    getItem(key: string): string | null {
      return this.store[key] || null;
    }

    setItem(key: string, value: string): void {
      this.store[key] = value;
    }

    removeItem(key: string): void {
      delete this.store[key];
    }

    clear(): void {
      this.store = {};
    }
  }
  Object.defineProperty(window, 'localStorage', {
    value: new LocalStorageMock(),
  });

  // Mock ResizeObserver
  (global as any).ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock next/router
  jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn(), query: {} }),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock performance
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(),
      memory: { jsHeapSizeLimit: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 },
      getEntriesByName: jest.fn(),
      getEntriesByType: jest.fn(),
      mark: jest.fn(),
      measure: jest.fn(),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
    },
  });

  // Mock requestAnimationFrame
  window.requestAnimationFrame = (callback: FrameRequestCallback): number =>
    setTimeout(() => callback(performance.now()), 16) as unknown as number;

  // Mock PerformanceObserver
  class MockPerformanceObserver {
    private callback: (entries: PerformanceObserverEntryList) => void;
    constructor(callback: (entries: PerformanceObserverEntryList) => void) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  (global as any).PerformanceObserver = MockPerformanceObserver;
}

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
