import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RenderResult } from '@testing-library/react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Define wrapper providers if needed
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export accessibility testing utilities
export { axe, toHaveNoViolations };

// Export custom test utilities
export {};

export const mockMatchMedia = () => {
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
};

export const mockIntersectionObserver = () => {
  class IntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserver,
  });
};

export const mockResizeObserver = () => {
  class ResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserver,
  });
};

interface MockAPIOptions {
  method?: string;
  status?: number;
  delay?: number;
}

interface MockServiceOptions {
  implementation: (...args: unknown[]) => unknown;
  name: string;
}

type ErrorCallback = (message: string, ...args: unknown[]) => void;

// Override console.error to prevent React error logging during tests
const originalError = console.error;
console.error = ((message: string, ...args: unknown[]) => {
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: React.createElement: type is invalid'))
  ) {
    return;
  }
  originalError(message, ...args);
}) as ErrorCallback;

// Setup all mocks
export {};
