import '@testing-library/jest-dom';
import 'jest-webgl-canvas-mock';
import { toHaveNoViolations } from 'jest-axe';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Configure userEvent
global.userEvent = userEvent;

// Mock WebGL context
const mockWebGLContext = {
  createShader: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  getProgramParameter: jest.fn(),
  useProgram: jest.fn(),
  getUniformLocation: jest.fn(),
  uniform1f: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
};

// Mock canvas and WebGL
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext;
  }
  return null;
});

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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
};

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    jsHeapSizeLimit: 2172649472,
    totalJSHeapSize: 2172649472,
    usedJSHeapSize: 2172649472
  },
  configurable: true,
  writable: true
});

// Setup MSW server with improved handlers
export const server = setupServer(
  // Add default handlers
  http.get('/api/*', () => {
    return HttpResponse.json({ success: true });
  }),
  
  // Add fallback handler for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled GET request to ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  
  http.post('*', ({ request }) => {
    console.warn(`Unhandled POST request to ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  
  http.put('*', ({ request }) => {
    console.warn(`Unhandled PUT request to ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  
  http.delete('*', ({ request }) => {
    console.warn(`Unhandled DELETE request to ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  })
);

beforeAll(() => {
  // Start MSW server
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset MSW handlers and clear all mocks
  server.resetHandlers();
  jest.clearAllMocks();
});

afterAll(() => {
  // Close MSW server
  server.close();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Add missing fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    statusText: 'OK',
  })
);

// Mock WebXR
global.navigator.xr = {
  isSessionSupported: jest.fn().mockResolvedValue(true),
  requestSession: jest.fn().mockResolvedValue({}),
};

// Cleanup function to ensure no memory leaks
afterEach(() => {
  // Clean up any mounted components
  document.body.innerHTML = '';
  
  // Clear any pending timers
  jest.clearAllTimers();
  
  // Reset any global mocks
  jest.clearAllMocks();
});
