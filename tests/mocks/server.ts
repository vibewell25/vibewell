
    // Safe integer operation
    if (msw > Number.MAX_SAFE_INTEGER || msw < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers); 