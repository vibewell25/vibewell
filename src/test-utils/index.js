/**
 * Test utilities index
 * This file exports all testing utilities for the Vibewell project
 */

// Export testing libraries for direct use in tests
export * from './testing-lib-adapter';
export { axe, toHaveNoViolations } from 'jest-axe';

// Export our custom test runner
export { createTestRunner } from './test-runner';

// Export mock utilities
export * from './mock-utils';

// Export component testing helpers
export * from './component-testing';

// Export API testing helpers
export * from './api-testing';

// Export performance testing helpers
export * from './performance-testing';

// Export accessibility testing helpers
export * from './accessibility-testing';

// Export hook testing utilities
export * from './hook-testing';

// Export test data and fixtures
export * from './test-data';

// Export security testing helpers
export * from './security-testing';
