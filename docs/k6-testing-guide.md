# k6 Testing Guide for Rate Limiting

This guide explains how to use k6 to test the rate limiting functionality in the Vibewell application, covering both Redis and in-memory rate limiting implementations.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed locally
- Node.js 16+ installed
- Access to the Vibewell application (local or deployed)
- Redis server (for Redis-based rate limiting tests)

## Overview

Our k6 tests are designed to validate the rate limiting functionality by simulating high-volume traffic to various API endpoints. The tests cover different scenarios:

1. **General API endpoints** - Public content, search, health checks
2. **Authentication endpoints** - Login, registration, password reset, MFA
3. **Sensitive operations** - Payments, profile updates, subscription changes
4. **Admin operations** - User management, system configuration, analytics

## Running the Tests

### Basic Usage

```bash
# Run tests with in-memory rate limiting (default)
k6 run scripts/k6-test.js

# Run tests with Redis rate limiting
k6 run -e REDIS=true scripts/k6-test.js

# Run a specific scenario
k6 run -e SCENARIO=auth scripts/k6-test.js

# Run with higher load (20 virtual users)
k6 run -e VUS=20 scripts/k6-test.js

# Enable debug output
k6 run -e DEBUG=true scripts/k6-test.js
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Base URL for the API | `http://localhost:3000/api` |
| `REDIS` | Enable Redis-based rate limiting | `false` |
| `SCENARIO` | Test scenario to run (general, auth, sensitive, admin) | `general` |
| `VUS` | Maximum number of virtual users | `10` |
| `DEBUG` | Enable debug logging | `false` |

### Helper Scripts

We provide convenience scripts for common testing scenarios:

```bash
# Run all scenarios with in-memory rate limiting
./scripts/run-load-tests.sh

# Run all scenarios with Redis rate limiting
./scripts/run-load-tests.sh --redis

# Run all scenarios with both implementations and compare
./scripts/run-load-tests.sh --both

# Export results to JSON for analysis
./scripts/run-load-tests.sh --export
```

## Test Scenarios

### General API Endpoints

Tests basic API functionality with moderate rate limiting:

- Content retrieval
- Search API
- Health check (typically not rate-limited)

```bash
k6 run -e SCENARIO=general scripts/k6-test.js
```

### Authentication Endpoints

Tests authentication services with stricter rate limiting:

- Login
- Registration
- Password reset
- MFA enrollment and verification

```bash
k6 run -e SCENARIO=auth scripts/k6-test.js
```

### Sensitive Operations

Tests endpoints with financial and sensitive data operations:

- Payment processing
- Profile updates
- Subscription changes

```bash
k6 run -e SCENARIO=sensitive scripts/k6-test.js
```

### Admin Operations

Tests administrative endpoints that require special privileges:

- User management
- System configuration
- Analytics data
- User actions (ban/unban)

```bash
k6 run -e SCENARIO=admin scripts/k6-test.js
```

## Rate Limiting Implementations

### In-Memory Rate Limiting

The in-memory implementation uses a Map-based approach for tracking request counts per IP address or user ID. This is suitable for development and single-instance deployments.

Key aspects tested:
- Correct enforcement of rate limits
- Proper HTTP 429 responses
- Reset of counters after window expiration

### Redis Rate Limiting

The Redis implementation provides distributed rate limiting suitable for production and multi-instance deployments. It uses Redis for storing and incrementing counters across instances.

Key aspects tested:
- Consistent rate limit enforcement across multiple requests
- Proper counter expiration
- Resilience during high-load scenarios

## Test Analysis

### Key Metrics

The test script collects several important metrics:

- **Total Requests**: Number of requests made
- **Rate Limited Requests**: Number and percentage of rate limited responses (HTTP 429)
- **Request Duration**: Average and 95th percentile of request times
- **Latency by Endpoint Type**: Performance metrics for different endpoint categories

### Success Criteria

Tests should validate the following aspects of rate limiting:

1. Requests beyond the limit receive a 429 status code
2. Rate limited responses include proper headers:
   - `Retry-After`: Time in seconds until the limit resets
   - `X-RateLimit-Limit`: Maximum requests allowed
   - `X-RateLimit-Remaining`: Remaining requests in the current window
3. Different endpoint types enforce appropriate limits
4. Performance impact of rate limiting is acceptable

### Interpreting Results

After running tests, you'll see output similar to:

```json
{
  "scenarioType": "auth",
  "totalRequests": 500,
  "rateLimitedRequests": 175,
  "rateLimitedPercentage": 35.0,
  "averageRequestDuration": 157.23,
  "p95RequestDuration": 298.45,
  "failedRequests": 175,
  "successfulRequests": 325,
  "authAvgLatency": 142.67,
  "authP95Latency": 278.12
}
```

This tells you that:
- 35% of authentication requests were rate limited
- The average request took ~157ms, with 95% completing in under ~298ms
- Authentication endpoints specifically had slightly better performance

## Troubleshooting

### Common Issues

**Redis Connection Failures:**
- Check Redis server is running and accessible
- Verify connection string in environment variables
- Check Redis logs for memory or connection issues

**Inconsistent Rate Limiting:**
- Verify time synchronization between test machine and server
- Check that test VUs (virtual users) aren't sharing IP addresses unexpectedly
- Ensure Redis is properly configured for persistence if needed

**High Latency:**
- Check server resource usage during tests
- Reduce the number of concurrent VUs
- Verify Redis connection pool settings

## Advanced Testing

### Testing Rate Limit Recovery

To test the recovery of rate limits after the time window expires:

```bash
k6 run -e SCENARIO=auth -e RECOVERY_TEST=true scripts/k6-test.js
```

This runs a test that:
1. Issues requests until rate limited
2. Waits for the rate limit window to expire
3. Verifies that new requests succeed

### Testing Suspicious Activity Detection

Our rate limiting includes protection against suspicious activity:

```bash
k6 run -e SCENARIO=auth -e SUSPICIOUS=true scripts/k6-test.js
```

This test attempts to trigger suspicious activity detection by:
1. Making rapid requests from a single IP
2. Switching between different user credentials
3. Targeting sensitive endpoints

### Load Testing During Rate Limit Events

To understand system behavior during high rate limiting:

```bash
k6 run -e SCENARIO=all -e VUS=50 scripts/k6-test.js
```

This test generates significant load to:
1. Measure system resource usage during heavy rate limiting
2. Verify overall system stability
3. Ensure non-rate-limited endpoints remain accessible

## Integrating with CI/CD

In CI/CD pipelines, rate limit tests can be run with:

```yaml
# GitHub Actions example
jobs:
  rate-limit-test:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v2
      - name: Install k6
        run: |
          curl -L https://github.com/grafana/k6/releases/download/v0.39.0/k6-v0.39.0-linux-amd64.tar.gz | tar xz
          sudo mv k6-v0.39.0-linux-amd64/k6 /usr/local/bin/
      - name: Run rate limit tests
        run: |
          k6 run -e REDIS=true -e SCENARIO=all scripts/k6-test.js
          ./scripts/analyze-results.sh --threshold
```

## Best Practices

1. **Start with low VU counts** and increase gradually
2. **Test each scenario separately** before running combined tests
3. **Compare Redis vs. in-memory** results to verify consistent behavior
4. **Monitor server resources** during tests to identify bottlenecks
5. **Automate test runs** as part of your CI/CD pipeline
6. **Review rate limit logs** after testing to verify correct operation
7. **Update tests** when rate limit configurations change 