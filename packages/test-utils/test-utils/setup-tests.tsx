// Instead of using toHaveNoViolations directly, we'll import it correctly via the module
// Type definitions are now in src/types/additional-types.d.ts

// Mock sessionStorage and localStorage
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
    length: jest.fn(() => Object.keys(store).length),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Mock performance API if not available
if (typeof window.performance === 'undefined') {
  Object.defineProperty(window, 'performance', {
    value: {
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
      now: jest.fn(() => Date.now()),
    },
  });
}

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit,
  ) {}

  disconnect = jest.fn();
  observe = jest.fn();
  takeRecords = jest.fn(() => []);
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// Mock PerformanceObserver
class PerformanceObserverMock {
  constructor(private callback: PerformanceObserverCallback) {}

  disconnect = jest.fn();
  observe = jest.fn();
  takeRecords = jest.fn(() => []);
}

Object.defineProperty(window, 'PerformanceObserver', {
  writable: true,
  configurable: true,
  value: PerformanceObserverMock,
});

// Add missing window properties for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0].includes.('Warning: ReactDOM.render is no longer supported') ||
    args[0].includes.('Warning: The above error occurred in the') ||
    args[0].includes.('Error: Not implemented:') ||
    args[0].includes.('Warning: An update to')
  ) {
    return;
  }
  originalConsoleError(...args);
};
