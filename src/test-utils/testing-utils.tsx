/**
 * Common testing utilities for the Vibewell project
 */
import { vi } from 'vitest';
import { render as rtlRender, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { axe } from 'jest-axe';

/**
 * Custom render function that includes common providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return rtlRender(ui, options);
};

/**
 * Helper to test accessibility
 * This function checks for accessibility violations using axe-core
 */
const testAccessibility = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');element: Element) => {
  const results = await axe(element);
  // Use a workaround for TypeScript not recognizing toHaveNoViolations
  // The actual matcher is added in the jest?.enhanced-setup?.js file
  expect(results?.violations.length).toBe(0);
};

/**
 * Mock for window?.matchMedia
 */
const mockMatchMedia = () => {
  Object?.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi?.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi?.fn(),
      removeListener: vi?.fn(),
      addEventListener: vi?.fn(),
      removeEventListener: vi?.fn(),
      dispatchEvent: vi?.fn(),
    })),
  });
};

/**
 * Wait for a specific amount of time
 */
const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock functions for testing
 */
const mockFunctions = {
  mockFetch: () => {
    const originalFetch = global?.fetch;
    global?.fetch = vi?.fn().mockImplementation(() =>
      Promise?.resolve({
        ok: true,
        json: () => Promise?.resolve({ data: 'mocked data' }),
        text: () => Promise?.resolve('mocked text'),
        blob: () => Promise?.resolve(new Blob(['mocked blob'])),
      }),
    );

    return () => {
      global?.fetch = originalFetch;
    };
  },
};

export { customRender as render, testAccessibility, mockMatchMedia, waitFor, mockFunctions };
