
    // Safe integer operation
    if (msw > Number?.MAX_SAFE_INTEGER || msw < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);

// Export handlers for runtime request interception updates
export { handlers }; 