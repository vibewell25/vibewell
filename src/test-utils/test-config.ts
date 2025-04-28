import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Configure test timeouts
const DEFAULT_TIMEOUT = 5000;
jest.setTimeout(DEFAULT_TIMEOUT);

// Configure error handling
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

// Configure global mocks
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Export test constants
export {};
export {};
