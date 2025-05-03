# VibeWell Load Testing Tools

This directory contains tools for load testing the VibeWell application API endpoints, with a focus on security rate limiting and authentication flows.

## Prerequisites

- Node.js 18+
- npm 
- Artillery (`npm install -g artillery`)

## Getting Started

1. Install dependencies:
   ```bash
   cd scripts
   npm install
   ```

2. Make sure the API server is running (for local testing)

## Available Scripts

The following npm scripts are available:

- `npm run load-test` - Run the general load test CLI tool
- `npm run security-test` - Run the security-focused load test CLI tool
- `npm run report` - Generate HTML reports from JSON result files

## Security Load Testing

The security load tests focus on testing the application's rate limiting, authentication, and authorization mechanisms. They simulate various attack patterns to ensure the API correctly limits traffic from potential bad actors.

To run the security load tests:

```bash
npm run security-test
```

You will be prompted to select:
1. Environment (development, staging, production)
2. Duration preset (quick, standard, extended)

The test will then run and generate both JSON and HTML reports in the `load-tests/security` directory.

### Security Test Scenarios

The following scenarios are included in the security load tests:

1. **Authentication Rate Limiting** - Tests if login endpoints correctly limit repeated failed login attempts.
2. **User Verification** - Tests token verification endpoints for security.
3. **Payment Processing** - Tests payment processing endpoints for security and rate limiting.
4. **Web3 Payment** - Tests cryptocurrency payment flows.
5. **Sensitive Data** - Tests access controls for sensitive data endpoints.
6. **API Rate Limiting** - Tests general API rate limiting across endpoints.

## Custom Load Testing

For more customized load testing, you can use the general load test runner:

```bash
npm run load-test
```

This tool allows you to:
1. Select test scenario or create custom ones
2. Configure environment settings
3. Set duration and user concurrency
4. Generate detailed reports

## Reports

After running tests, HTML reports are automatically generated. You can also generate reports from existing JSON result files:

```bash
npm run report
```

Reports include:
- Response time statistics
- Request throughput
- Success/failure rates
- Rate limiting events
- Error distribution

## Configuration

The core configuration files are:

- `security-load-test.yaml` - Artillery configuration for security tests
- `load-test-functions.js` - Helper functions for the load tests
- `run-security-load-test.js` - CLI runner for security tests
- `run-load-test.js` - General purpose load test runner

## Redis Configuration

Some tests use Redis for distributed metrics collection. Set the `REDIS_URL` environment variable to configure Redis connection:

```bash
REDIS_URL=redis://localhost:6379 npm run security-test
```

## Troubleshooting

- If you encounter connection errors, ensure the API server is running
- For rate limiting tests, ensure Redis is running if used by your rate limiter
- Check out detailed logs in the generated JSON files 