/**
 * Type declarations specifically for jest-dom matchers
 * This helps resolve conflicts between different testing libraries
 */

// Type definitions for jest-dom and jest-axe
// Project: https://github.com/testing-library/jest-dom

// Extend Jest's Matchers interface with our custom matchers
declare namespace jest {
  interface Matchers<R> {
    // Add just the matchers causing the linter errors
    toBeInTheDocument(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveNoViolations(): R;
  }
}

export {};
