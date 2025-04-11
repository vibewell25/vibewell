# Post-Deployment Tests

These tests are designed to run after deploying the application to verify that critical paths are working correctly.

## Tests Included

1. **Critical Paths** (`critical-paths.test.ts`)
   - Verifies that the login page loads
   - Checks that the services page is accessible
   - Tests the providers API endpoint
   - Tests booking retrieval and creation

2. **API Endpoints** (`api-endpoints.test.ts`)
   - Tests various API endpoints including users, auth, and bookings
   - Demonstrates how to override default handlers for specific tests

## Running the Tests

```bash
# From the project root
npm run test:post-deploy

# Or use the shell script
./tests/run-post-deploy-tests.sh
```

## Implementation Details

- These tests use MSW (Mock Service Worker) to mock API responses
- The tests are configured in `jest.e2e.config.js`
- The mock server setup is located in `tests/mocks/`
- All tests use axios for making HTTP requests

## Adding New Tests

To add a new post-deployment test:

1. Create a new file in the `tests/post-deploy/` directory
2. Import the necessary functions from `@jest/globals` and other required libraries
3. Use MSW to mock any API responses needed for the test
4. Use axios to make requests to the API
5. Add appropriate assertions to verify expected behavior

Example:

```typescript
import { describe, it, expect } from '@jest/globals';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('New Feature Test', () => {
  it('should work as expected', async () => {
    // Test implementation here
  });
});
``` 