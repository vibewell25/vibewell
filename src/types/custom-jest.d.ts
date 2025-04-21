// This file extends Jest's expect interface with custom matchers

// Use module augmentation instead of global interface to avoid conflicts
declare global {
  namespace jest {
    // Keep only the Jest-axe matcher here
    interface Matchers<R> {
      // Custom matchers from jest-axe
      toHaveNoViolations(): R;
    }
  }
}

// Export empty object to satisfy module requirements
export {};
