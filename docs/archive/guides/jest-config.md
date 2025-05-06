# Jest Configuration Structure

This directory contains the modular Jest configuration for the project's test suite. The configuration is split into logical modules for better maintainability and clarity.

## Directory Structure

```
jest-config/
├── smoke.config.js       # Main configuration for smoke tests
├── transforms.js         # Transform configurations
├── moduleMappers.js      # Module mapping configurations
├── setup/
│   └── node.setup.js    # Node environment setup
└── README.md            # This file
```

## Configuration Files

### smoke.config.js
Main configuration file for smoke tests and rate-limiting tests. It:
- Sets up the Node.js test environment
- Configures test patterns
- Imports transforms and module mappings
- Sets up coverage reporting
- Configures test timeouts and other global settings

### transforms.js
Contains TypeScript transform configurations:
- Handles TypeScript file transformations using ts-jest
- Configures TypeScript compiler options
- Ensures proper source map handling

### moduleMappers.js
Contains module name mappings for:
- Three.js mocks and 3D rendering components
- Style and asset mocks (CSS, images, etc.)
- Module aliases for cleaner imports
- File mock configurations

### setup/node.setup.js
Node environment setup including:
- Global polyfills (TextEncoder, TextDecoder)
- Test cleanup and mock reset functions
- Default timeouts
- Network request handling

## Test Categories

The test suite includes several types of tests:

1. **Smoke Tests** (`tests/smoke/`)
   - Basic functionality tests
   - API endpoint availability
   - Core feature verification
   - Error handling checks

2. **Rate Limiting Tests** (`tests/rate-limiting/`)
   - API rate limit verification
   - Throttling behavior
   - Retry mechanism testing

## Usage

### Running Tests

Update your package.json with these scripts:

```json
{
  "scripts": {
    "test:smoke": "jest -c jest-config/smoke.config.js",
    "test:smoke:watch": "jest -c jest-config/smoke.config.js --watch",
    "test:smoke:coverage": "jest -c jest-config/smoke.config.js --coverage"
  }
}
```

### Running Specific Tests

To run specific test files:
```bash
npm run test:smoke -- tests/smoke/home.test.ts
```

To run tests matching a pattern:
```bash
npm run test:smoke -- -t "health endpoint"
```

### Coverage Reports

Coverage reports are generated in the `coverage` directory when running tests with the `--coverage` flag.

## Best Practices

1. **Test Organization**
   - Group related tests using `describe` blocks
   - Use clear, descriptive test names
   - Follow the AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Use Jest's built-in mocking capabilities
   - Mock external dependencies consistently
   - Reset mocks between tests

3. **Error Handling**
   - Test both success and error scenarios
   - Verify error messages and status codes
   - Check rate limiting and throttling behavior

4. **Maintenance**
   - Keep test files focused and organized
   - Update mocks when API contracts change
   - Maintain test data fixtures separately

## Troubleshooting

Common issues and solutions:

1. **Test Timeouts**
   - Increase timeout in jest.config.js
   - Check for hanging promises
   - Verify async/await usage

2. **Mock Issues**
   - Clear mock state between tests
   - Verify mock implementation
   - Check mock return values

3. **Network Errors**
   - Verify base URL configuration
   - Check mock axios setup
   - Ensure proper error handling

## Contributing

When adding new tests:
1. Follow the existing file structure
2. Add appropriate mocks and fixtures
3. Update documentation as needed
4. Verify coverage reports 