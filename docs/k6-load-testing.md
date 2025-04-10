# K6 Load Testing for Redis Rate Limiting

This document outlines how to perform load testing on the rate limiting implementation using k6.

## Overview

The load testing setup includes:

1. Test API routes for simulating various endpoints
2. k6 scripts for generating load
3. Shell scripts for running tests with different parameters
4. Reporting tools for analyzing results

## Prerequisites

Before running load tests, ensure you have the following installed:

- [k6](https://k6.io/docs/getting-started/installation/) - The load testing tool
- Redis server (for production-mode tests)
- Node.js 14+ and npm

## Test API Routes

The following test routes have been implemented to simulate different types of rate-limited endpoints:

- `/api/test/general` - General API operations with standard rate limits
- `/api/test/auth` - Authentication operations with stricter rate limits
- `/api/test/sensitive` - Sensitive operations with very strict rate limits
- `/api/test/admin` - Admin operations with moderate rate limits

Each route applies the appropriate rate limiter from our rate limiting middleware.

## Running Load Tests

### Basic Usage

To run a load test with default settings:

```bash
./scripts/load-testing.sh
```

This will use the default configuration:
- 50 virtual users
- 30 seconds test duration
- Test all endpoint types
- Use the local development server (http://localhost:3000)

### Advanced Options

The script supports several command-line options:

```bash
./scripts/load-testing.sh [options]
```

Options:
- `-h, --help` - Show help message
- `-u, --url URL` - Base URL to test (default: http://localhost:3000)
- `-c, --users COUNT` - Number of concurrent users (default: 50)
- `-d, --duration DURATION` - Test duration (default: 30s)
- `-t, --type TYPE` - Test type: all, general, auth, sensitive, admin (default: all)
- `-b, --bypass` - Enable bypass attempt mode to test rate limit evasion tactics

Examples:

Test only authentication endpoints with 100 users for 1 minute:
```bash
./scripts/load-testing.sh --type auth --users 100 --duration 1m
```

Test all endpoints with bypass attempts enabled:
```bash
./scripts/load-testing.sh --bypass
```

## Environment Configuration

You can configure the environment variables for testing:

```bash
# Use Redis for rate limiting
export REDIS_ENABLED=true
export REDIS_URL=redis://localhost:6379

# Run in production mode
export NODE_ENV=production

# Then run the test
./scripts/load-testing.sh
```

## Test Scenarios

The load tests cover several scenarios:

1. **Normal Load** - Gradually increasing load to test how the system behaves under normal conditions
2. **Sudden Spike** - A rapid increase in traffic to test how quickly rate limiting kicks in
3. **Sustained High Load** - Maintaining high traffic to test the stability of the rate limiting system
4. **Bypass Attempts** - Simulating attempts to bypass rate limiting by rotating IPs or other techniques

## Analyzing Results

Test results are stored in the `load-test-results` directory with JSON and HTML reports.

HTML reports include:
- Overall success rate
- Rate limiting effectiveness
- Response time analysis
- HTTP status code distribution
- Charts showing request rates and response times

## Custom Test Scripts

You can modify the k6 test scripts in `scripts/load-testing.js` to create custom testing scenarios.

Key metrics measured:
- `rate_limited_requests` - Percentage of requests that were rate limited
- `successful_requests` - Percentage of requests that received a valid response (including rate limits)
- `request_duration` - Response time for all requests
- `rate_limit_breaches` - Counter for rate limit breaches

## Troubleshooting

### Redis Connection Issues

If you encounter Redis connection issues:

1. Verify Redis is running: `redis-cli ping`
2. Check the Redis URL: `echo $REDIS_URL`
3. Make sure Redis is accessible from your environment

### High Error Rates

If you see high error rates (not 429 responses):

1. Check if the development server is running
2. Verify the API routes are properly implemented
3. Check the logs for any server-side errors

## Best Practices

1. **Start Small**: Begin with a small number of users and gradually increase
2. **Monitor Systems**: Watch server resources during tests to identify bottlenecks
3. **Isolate Tests**: Run tests in isolation to prevent interference with other systems
4. **Analyze Patterns**: Look for patterns in rate limiting behavior to optimize settings
5. **Test Production-Like**: Use production-like environment settings for the most accurate results

## References

- [K6 Documentation](https://k6.io/docs/)
- [Redis Rate Limiting Patterns](https://redis.io/commands/incr#pattern-rate-limiter)
- [Rate Limiting Best Practices](https://www.nginx.com/blog/rate-limiting-nginx/) 