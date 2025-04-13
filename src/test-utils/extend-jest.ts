/**
 * Jest Extension Utility
 * 
 * This file provides a consistent way to extend Jest with custom matchers
 * across the entire project. This helps prevent TypeScript errors and ensures
 * that matchers are properly registered.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expect } = require('@jest/globals');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestAxe = require('jest-axe');

/**
 * Extends Jest with all custom matchers used in the project
 * Call this function in test setup files or directly in test files
 */
export function extendJestWithCustomMatchers(): void {
  // Get the toHaveNoViolations matcher from jest-axe
  const toHaveNoViolations = jestAxe.toHaveNoViolations;

  // Create an object with all our custom matchers
  const customMatchers = {
    toHaveNoViolations,
    // Add other custom matchers here as needed
  };

  // Apply the matchers to Jest
  expect.extend(customMatchers);
}

// Export default for easy importing
export default extendJestWithCustomMatchers; 