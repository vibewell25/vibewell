# End-to-End Testing Guide

This guide outlines the end-to-end (E2E) testing approach for the Vibewell application. E2E tests verify the application's critical user flows from start to finish, ensuring that all components work together as expected in real-world scenarios.

## Overview

E2E tests simulate real user interactions with the application, testing complete business processes across multiple pages and components. These tests provide confidence that the entire system functions correctly from a user's perspective.

### Test Coverage

Our E2E tests focus on critical user flows:

- **Business Profile Creation**: Testing the complete flow of creating and managing a business profile
- **Booking Flow**: Verifying the entire booking process from search to confirmation
- **Authentication**: Testing user registration, login, and account management
- **Service Management**: Testing service creation, updating, and deletion
- **Provider Discovery**: Testing search and filtering functionality

## Implementation

E2E tests are implemented using:

- **Jest**: Test runner and assertion library
- **Axios**: HTTP client for making requests to the API
- **MSW (Mock Service Worker)**: For intercepting and mocking API requests
- **Jest DOM**: For DOM-related assertions

### Test Structure

E2E tests follow this structure:

1. **Setup**: Initialize the test environment and mock necessary services
2. **Execute**: Perform the actions that make up the user flow
3. **Verify**: Assert that the expected outcomes occur
4. **Cleanup**: Reset the test environment

## Running E2E Tests

E2E tests can be run using the following commands:

```bash
# Run all E2E tests
npx jest tests/post-deploy

# Run a specific E2E test
npx jest tests/post-deploy/business-profile-creation.test.ts

# Run E2E tests with the comprehensive test suite
./scripts/run-tests.sh
```

## Writing New E2E Tests

When writing new E2E tests:

1. **Identify Critical Flows**: Focus on high-value user journeys
2. **Mock External Dependencies**: Use MSW to intercept and mock API requests
3. **Isolate Tests**: Each test should be independent and not rely on state from other tests
4. **Cover Edge Cases**: Test both happy paths and error scenarios
5. **Keep Tests Maintainable**: Use page objects or similar patterns to isolate UI changes

### Example Test

Here's a simplified example of an E2E test for business profile creation:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('Business Profile Creation Flow', () => {
  beforeEach(() => {
    // Set up mocks
    server.use(
      // Mock API responses
    );
  });

  it('Should allow a provider to create a business profile', async () => {
    // Test the complete flow
    // 1. Login as provider
    // 2. Access profile creation page
    // 3. Submit profile data
    // 4. Verify the profile was created
  });
});
```

## CI/CD Integration

E2E tests run automatically in our CI/CD pipeline:

- Tests run on pull requests before merging
- Tests run on the main branch after merging
- Failed tests prevent deployment

## Troubleshooting

Common issues with E2E tests:

- **Flaky Tests**: Tests that sometimes pass and sometimes fail
  - Solution: Review timeouts, avoid dependencies between tests, and use retries

- **Slow Tests**: Tests that take too long to run
  - Solution: Use more specific selectors, limit test scope, or parallelize tests

- **Maintenance Burden**: Tests that break due to UI changes
  - Solution: Use stable selectors, page objects, and abstract UI details 