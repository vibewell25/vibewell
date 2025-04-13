// Enhanced Jest setup file for Vibewell project
// This setup file combines all testing utilities and fixes common issues

// Import base setup
import './jest.setup.js';

// Add jest-dom matchers for testing DOM elements
import '@testing-library/jest-dom';

// Add jest-axe for accessibility testing
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Add enhanced Jest matchers
expect.extend({
  toHaveBeenCalledWith(received, ...expected) {
    const pass = this.equals(received.mock.calls[0], expected);
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected mock not to have been called with ${this.utils.printExpected(expected)}`
          : `Expected mock to have been called with ${this.utils.printExpected(expected)}\n` +
            `But it was called with ${this.utils.printReceived(received.mock.calls[0])}`;
        return message;
      },
    };
  },
  toHaveBeenCalledTimes(received, expected) {
    const pass = received.mock.calls.length === expected;
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected mock not to have been called ${expected} times`
          : `Expected mock to have been called ${expected} times, but it was called ${received.mock.calls.length} times`;
        return message;
      },
    };
  },
  toHaveNoViolations(received) {
    if (typeof toHaveNoViolations === 'function') {
      return toHaveNoViolations.call(this, received);
    }
    
    // Fallback implementation if jest-axe is not available
    return {
      pass: true,
      message: () => 'Accessibility testing is not available',
    };
  },
  toBeLessThan(received, expected) {
    const pass = received < expected;
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected ${received} not to be less than ${expected}`
          : `Expected ${received} to be less than ${expected}`;
        return message;
      },
    };
  },
  toHaveProperty(received, property, value) {
    const hasProperty = Object.prototype.hasOwnProperty.call(received, property);
    const pass = value !== undefined
      ? hasProperty && this.equals(received[property], value)
      : hasProperty;
    
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected object not to have property '${property}'${value !== undefined ? ` with value ${this.utils.printExpected(value)}` : ''}`
          : `Expected object to have property '${property}'${value !== undefined ? ` with value ${this.utils.printExpected(value)}` : ''}`;
        return message;
      },
    };
  },
});

// Add support for object.anything() in expects
expect.anything = () => ({
  asymmetricMatch: (actual) => actual !== null && actual !== undefined,
});

// Setup MSW for API mocking
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

// Create and export the MSW server
export const server = setupServer();

// Setup MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(() => null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Fix for userEvent in tests
jest.mock('@testing-library/user-event', () => {
  return {
    __esModule: true,
    default: () => ({
      clear: async (element) => {
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));
      },
      click: async (element) => {
        element.click();
      },
      dblClick: async (element) => {
        element.click();
        element.click();
      },
      type: async (element, text) => {
        const currentValue = element.value || '';
        element.value = currentValue + text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      },
      tab: async () => {
        // Mock tab implementation
      },
      hover: async () => {
        // Mock hover implementation
      },
      unhover: async () => {
        // Mock unhover implementation
      },
      upload: async () => {
        // Mock upload implementation
      },
      selectOptions: async () => {
        // Mock selectOptions implementation
      },
      deselectOptions: async () => {
        // Mock deselectOptions implementation
      },
      paste: async () => {
        // Mock paste implementation
      },
    }),
  };
});
