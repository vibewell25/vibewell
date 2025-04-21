/**
 * Global Jest matcher extensions that are compatible with all declarations
 */

// Import the base types but don't extend them directly
import 'jest-axe';

// Instead of redeclaring the interfaces, we'll just ensure the module is imported
// The proper types should be pulled from jest-axe and @testing-library/jest-dom

// Export an empty object to satisfy module requirements
export {};
