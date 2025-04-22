import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { server } from './src/mocks/server';
import { TextDecoder, TextEncoder } from 'util';

// Polyfill for encoding which isn't present globally in jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Enable API mocking before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset request handlers and mocks between tests
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  jest.clearAllTimers();
  localStorage.clear();
  sessionStorage.clear();
});

// Clean up after tests
afterAll(() => server.close());

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver;

// Mock window.scroll and related functions
global.scroll = jest.fn();
global.scrollTo = jest.fn();
global.scrollBy = jest.fn();
global.scrollIntoView = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock console.error to fail tests on prop-type errors
const originalError = console.error;
console.error = (...args) => {
  const propTypeErrors = [
    'Failed prop type',
    'Invalid prop',
    'Invalid event handler',
    'React does not recognize',
    'Unknown prop',
    'Warning: Invalid',
  ];

  if (propTypeErrors.some(err => args.join(' ').includes(err))) {
    throw new Error(args.join(' '));
  }

  originalError.call(console, ...args);
};

// Mock window.fetch
global.fetch = jest.fn();

// Set up fake timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Mock window.crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: jest.fn(),
    },
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock }); 