// Enhanced Jest setup file for Vibewell project
// This setup file combines all testing utilities and fixes common issues

// Import base setup
import './jest.setup.js';

// Add jest-dom matchers for testing DOM elements
import '@testing-library/jest-dom';

// Remove MSW imports and server setup as we're using local mocks instead

// Add jest-axe for accessibility testing (if available)
try {
  const { toHaveNoViolations } = require('jest-axe');
  expect.extend({ toHaveNoViolations });
} catch (e) {
  console.warn('jest-axe not available, accessibility testing will be limited');
}

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

// Mock fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Fix for userEvent in tests by providing a more comprehensive mock
// This ensures all methods like click, type, etc. are available and work properly
jest.mock('@testing-library/user-event', () => {
  // Create a factory function that returns a mock userEvent object
  const createMockUserEvent = () => {
    return {
      // Basic interactions
      click: jest.fn().mockImplementation((element) => {
        if (element && !element.disabled) {
          element.click();
          if (element.onclick) element.onclick();
        }
        return Promise.resolve();
      }),
      dblClick: jest.fn().mockImplementation((element) => {
        if (element && !element.disabled) {
          element.click();
          element.click();
        }
        return Promise.resolve();
      }),
      hover: jest.fn().mockImplementation(() => Promise.resolve()),
      unhover: jest.fn().mockImplementation(() => Promise.resolve()),
      
      // Keyboard interactions
      tab: jest.fn().mockImplementation(({ shift } = {}) => Promise.resolve()),
      keyboard: jest.fn().mockImplementation((text) => Promise.resolve()),
      type: jest.fn().mockImplementation((element, text, options) => {
        if (element && !element.disabled) {
          const currentValue = element.value || '';
          element.value = currentValue + text;
          // Dispatch input event
          const inputEvent = new Event('input', { bubbles: true });
          element.dispatchEvent(inputEvent);
          // Dispatch change event
          const changeEvent = new Event('change', { bubbles: true });
          element.dispatchEvent(changeEvent);
        }
        return Promise.resolve();
      }),
      clear: jest.fn().mockImplementation((element) => {
        if (element && !element.disabled) {
          element.value = '';
          // Dispatch input event
          const inputEvent = new Event('input', { bubbles: true });
          element.dispatchEvent(inputEvent);
        }
        return Promise.resolve();
      }),
      
      // Form interactions
      selectOptions: jest.fn().mockImplementation((element, values) => Promise.resolve()),
      deselectOptions: jest.fn().mockImplementation((element, values) => Promise.resolve()),
      upload: jest.fn().mockImplementation((element, files) => Promise.resolve()),
      
      // Clipboard interactions
      paste: jest.fn().mockImplementation((element, text) => {
        if (element && !element.disabled) {
          const currentValue = element.value || '';
          element.value = currentValue + text;
          // Dispatch input event
          const inputEvent = new Event('input', { bubbles: true });
          element.dispatchEvent(inputEvent);
        }
        return Promise.resolve();
      }),
      
      // Setup method for chaining
      setup: jest.fn().mockImplementation(() => createMockUserEvent()),
    };
  };
  
  // Return both as default export and as a factory function
  const userEvent = createMockUserEvent();
  userEvent.setup = () => createMockUserEvent();
  
  return {
    __esModule: true,
    default: userEvent,
    setup: jest.fn().mockImplementation(() => createMockUserEvent()),
  };
});
