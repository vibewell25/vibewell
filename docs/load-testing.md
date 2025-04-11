# Load Testing with k6 for Redis Rate Limiting

This document explains how to perform load testing on the rate limiting functionality using k6, with a focus on testing Redis-based rate limiting in production environments.

## Overview

Our load testing setup allows you to:

1. Test the performance of rate limiting under various loads
2. Verify that rate limits are correctly enforced
3. Measure response times under load
4. Compare Redis-based vs in-memory rate limiting

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed on your system
- Redis server running (for production-mode testing)
- The Vibewell application running locally or deployed to a test environment

## Test Endpoints

We've created dedicated test endpoints for load testing various rate limiters:

- `/api/test/general` - General API rate limiting (higher limits)
- `/api/test/auth` - Authentication rate limiting (moderate limits)
- `/api/test/sensitive` - Sensitive operations rate limiting (strict limits)
- `/api/test/admin` - Admin operations rate limiting (balanced limits)

Each endpoint applies the appropriate rate limiter middleware to simulate real-world usage.

## Running Tests

### Basic Usage

```bash
# Make the script executable (first time only)
chmod +x scripts/load-testing.sh

# Run the load tests with default settings
./scripts/load-testing.sh
```

The script will:
1. Check if k6 is installed
2. Verify Redis connection (if in production mode)
3. Run tests against all endpoints
4. Generate JSON, CSV, and HTML reports

### Configuration Options

You can customize the test parameters using environment variables:

```bash
# Run with custom settings
NODE_ENV=production REDIS_URL=redis://localhost:6379 ./scripts/load-testing.sh
```

Key environment variables:

- `NODE_ENV`: Set to "production" to use Redis for rate limiting (default: "development")
- `REDIS_URL`: Redis connection URL (default: "redis://localhost:6379")
- `REDIS_ENABLED`: Force enable/disable Redis (default: auto-detect based on NODE_ENV)

## Test Scenarios

The k6 test script (`scripts/load-tests/rate-limit-test.js`) includes several test scenarios:

1. **General API Test**: Higher throughput, testing the general API rate limiter
   - Ramps up to 20 requests per second
   - Uses multiple virtual users to generate load

2. **Authentication Test**: Moderate load, testing the auth API rate limiter
   - Ramps up to 10 requests per second
   - Uses a different set of virtual users

3. **Sensitive Operations Test**: Lower throughput, testing stricter rate limits
   - Ramps up to 5 requests per second
   - Uses longer sleeps between requests

4. **Admin Operations Test**: Balanced load with longer duration
   - Ramps up to 3 requests per second
   - Includes authorization headers

## Understanding Results

The test generates several output files in the `load-test-results` directory:

- **JSON Results**: Raw metrics and data points from the test run
- **CSV Metrics**: Detailed metrics in CSV format for further analysis
- **JSON Summary**: Overview of the test results
- **HTML Report**: Visual representation of the test results

Key metrics to look for:

- **Rate Limit Exceeded Rate**: Percentage of requests that exceeded rate limits (429 responses)
- **Success Rate**: Percentage of successful requests (200 responses)
- **HTTP Request Duration**: Response time statistics

## Analyzing Redis Rate Limiting Performance

When running in production mode, you can analyze Redis performance metrics:

1. Check the rate of 429 responses vs. successful responses
2. Verify that rate limits are properly enforced across endpoints
3. Analyze response times under heavy load
4. Monitor Redis memory usage and command throughput

Redis-specific metrics to monitor:
- Redis memory usage
- Redis command latency
- Redis connection count

## Troubleshooting

### Common Issues

1. **Test fails immediately**
   - Ensure Redis is running (if in production mode)
   - Check that the application server is running
   - Verify k6 is correctly installed

2. **All requests are rate limited**
   - Rate limits may be set too low for load testing
   - Increase the time between requests in the test script
   - Verify rate limiter configuration

3. **No rate limiting occurs**
   - Ensure rate limiting is correctly configured
   - Check Redis connection (if using Redis for rate limiting)
   - Verify the correct rate limiters are applied to endpoints

### Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Redis Rate Limiting Guide](https://redis.io/commands/incr#pattern-rate-limiter)
- [Vibewell Rate Limiting Documentation](./rate-limiting.md)

## Extending the Tests

You can extend the load tests by:

1. Adding new endpoints to test
2. Creating custom scenarios with different traffic patterns
3. Implementing specialized test cases (e.g., testing blocked IPs)
4. Adding integration with monitoring systems

To add a new endpoint to test:
1. Create a new test API route
2. Add a new test function in `rate-limit-test.js`
3. Add a new scenario in the options configuration