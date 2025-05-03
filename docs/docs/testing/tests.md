# VibeWell Testing Suite

This directory contains various tests for the VibeWell application. The test suite has been updated to use the latest technologies and best practices for web application testing.

## Test Structure

- `/tests/smoke`: Basic smoke tests to verify essential functionality
- `/tests/rate-limiting`: Tests for rate limiting functionality
- `/tests/post-deploy`: Tests that run after deployment to verify critical paths
- `/tests/security`: Security-focused tests
- `/tests/load-testing`: Load testing scripts 

## Test Types

### Unit Tests

Located in `/src/**/__tests__` directories alongside the components they test. These focus on testing individual components and functions in isolation.

```bash
npm run test:unit
```

### Smoke Tests

Located in `/tests/smoke`. These are basic tests to verify that critical paths are working. They use MSW to mock API responses.

```bash
npm run test:smoke
```

### Rate Limiting Tests

Located in `/tests/rate-limiting`. These tests verify that rate limiting is properly implemented.

```bash
npm run test:rate-limiting
```

### AR Component Tests

Tests for AR components are run with a separate script due to their complex dependencies.

```bash
npm run test:ar
```

### Post-Deploy Tests

Tests that run after deployment to verify critical paths are working.

```bash
npm run test:post-deploy
```

### Running All Tests

To run all tests with detailed reporting:

```bash
npm run test:all
```

## Testing Technology

- **Jest**: Test runner and assertion library
- **MSW (Mock Service Worker)**: Used to mock API responses without modifying code or intercepting network requests
- **Testing Library**: Used for component testing
- **Redis Mock**: Used to mock Redis for testing Redis-dependent functionality
- **Typescript**: All tests are written in TypeScript for better type safety

## Configuration Files

- `jest.config.js`: Main Jest configuration for component and unit tests
- `jest.smoke.config.js`: Configuration for Node.js environment tests (smoke, rate-limiting)
- `jest.e2e.config.js`: Configuration for E2E and post-deploy tests
- `jest.setup.js`: Setup file for Jest with browser environment
- `jest.node.setup.js`: Setup file for Jest with Node.js environment

## Mocks

The testing suite uses several mocks to avoid external dependencies:

- **API Responses**: Using MSW to mock API responses
- **Redis**: Using ioredis-mock for Redis functionality
- **Three.js**: Comprehensive mocks for 3D rendering
- **AR Components**: Mocks for AR-related functionality
- **Authentication**: Mocks for auth providers

## Best Practices

1. **Isolation**: Tests should be isolated and not depend on external services
2. **Mocking**: Use mocks for external dependencies
3. **Coverage**: Maintain high test coverage
4. **Readability**: Tests should be readable and maintainable
5. **Security**: Include security testing in the test suite

## Adding New Tests

When adding new tests:

1. Unit tests should be placed in `__tests__` directories next to the files they test
2. Integration and E2E tests should be placed in the appropriate directory under `/tests`
3. Use the appropriate configuration for the test type
4. Follow the pattern of existing tests for consistency

## Troubleshooting

If tests are failing, check:

1. Are you using the right configuration for your test type?
2. Are all dependencies properly mocked?
3. Has the API changed but mocks have not been updated?
4. Are there timing issues in asynchronous tests? 