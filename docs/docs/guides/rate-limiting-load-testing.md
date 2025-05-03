# K6 Load Testing for Redis Rate Limiting

This document provides instructions for setting up and running [k6](https://k6.io/) load tests to evaluate the Redis rate limiting implementation in the Vibewell API.

## Overview

The load testing framework is designed to:

1. Simulate high traffic scenarios to test rate limiting functionality
2. Validate proper enforcement of rate limits across different API endpoints
3. Test both in-memory and Redis-based rate limiting implementations
4. Collect performance metrics and generate reports

## Setup Instructions

### Prerequisites

- Node.js and npm (for running the API server)
- Redis server (for production-mode tests)
- [k6](https://k6.io/docs/getting-started/installation/) load testing tool

### Installation Steps

1. **Install k6**:
   - macOS: `brew install k6`
   - Windows: [Download the installer](https://k6.io/docs/getting-started/installation/#windows)
   - Linux: Follow the [installation guide](https://k6.io/docs/getting-started/installation/#linux)

2. **Install Redis**:
   - macOS: `brew install redis`
   - Windows: Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
   - Linux: `sudo apt install redis-server`

3. **Setup the environment**:
   ```bash
   # Run the setup script
   ./tests/rate-limiting/setup-env.sh
   ```

4. **Start the API server**:
   ```bash
   npm run dev
   ```

5. **Start Redis** (if not already running):
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis-server
   
   # Windows
   # Start via the Redis service or executable
   ```

## Running Load Tests

### Run All Tests

To run all load tests with default settings:

```bash
./scripts/load-testing.sh
```

### Run Individual Tests

You can run tests for specific endpoints:

```bash
# Test general API rate limiting
k6 run ./tests/rate-limiting/k6-scripts/general.js

# Test authentication API rate limiting
k6 run ./tests/rate-limiting/k6-scripts/auth.js

# Test sensitive operations rate limiting
k6 run ./tests/rate-limiting/k6-scripts/sensitive.js

# Test admin operations rate limiting
k6 run ./tests/rate-limiting/k6-scripts/admin.js
```

### Customizing Tests

You can customize test parameters using environment variables:

```bash
k6 run ./tests/rate-limiting/k6-scripts/auth.js \
  -e USERS=10 \
  -e DURATION="30s" \
  -e BASE_URL="http://localhost:3000/api/test"
```

## Viewing Results

### Check Test Results

Test results are stored in the `./load-test-results/` directory:

- JSON files with detailed metrics
- HTML reports for visual analysis

### View Results in the Application

You can view load test results in the Vibewell admin dashboard at `/api/load-test-results` or programmatically via:

```bash
curl http://localhost:3000/api/load-test-results
```

### Analyzing Redis Rate Limiting Logs

To check rate limiting events in Redis:

```bash
# Connect to Redis
redis-cli

# List all rate limiting keys
keys ratelimit:*

# Check specific rate limit counters
get ratelimit:auth:127.0.0.1
```

## Production Considerations

When running load tests against production-like environments:

1. Use a separate Redis instance dedicated to testing
2. Monitor Redis memory usage during tests
3. Configure lower rate limits during testing to avoid overwhelming services
4. Use the `NODE_ENV=production` environment variable to enable Redis-based rate limiting

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**:
   - Ensure Redis is running: `redis-cli ping`
   - Check your `.env.local` has the correct Redis URL

2. **Rate Limiting Not Working**:
   - Verify `REDIS_ENABLED=true` in environment variables
   - Check Redis logs for connection errors

3. **k6 Errors**:
   - Ensure the API server is running before starting tests
   - Check for JavaScript errors in the test scripts

### Getting Help

For additional assistance:

- Consult the [k6 documentation](https://k6.io/docs/)
- Check the Redis dashboard in the Vibewell admin interface
- Review Redis logs for any connection issues
- See additional logging in the API server console output 