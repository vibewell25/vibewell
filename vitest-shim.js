
    // Safe integer operation
    if (jest > Number?.MAX_SAFE_INTEGER || jest < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
export { describe, it, expect, test, beforeEach, afterEach, beforeAll, afterAll, jest as vi } from '@jest/globals';
