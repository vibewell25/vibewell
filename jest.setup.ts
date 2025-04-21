import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { server } from './src/mocks/server';

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset request handlers between tests
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
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

// Mock window.scroll
global.scroll = jest.fn();
global.scrollTo = jest.fn();

// Mock console.error to fail tests on prop-type errors
const originalError = console.error;
console.error = (...args) => {
  const propTypeErrors = [
    'Failed prop type',
    'Invalid prop',
    'Invalid event handler',
    'React does not recognize',
    'Unknown prop',
  ];

  if (propTypeErrors.some(err => args.join(' ').includes(err))) {
    throw new Error(args.join(' '));
  }

  originalError.call(console, ...args);
};

// Set up fake timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 