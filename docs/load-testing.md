# Load Testing Guide for Redis Rate Limiting

This guide covers the approach to load testing the rate limiting functionality in the Vibewell application, with a focus on Redis-based rate limiting.

## Overview

Load testing is essential to verify that our rate limiting mechanisms work correctly under various traffic conditions. We use [k6](https://k6.io/) to simulate different traffic patterns and measure how our rate limiting responds.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed on your machine
- Redis server running (for production-mode tests)
- Node.js environment with the Vibewell application

## Environment Setup

1. **Redis Configuration**

   Ensure your `.env.local` file includes the following settings:

   ```
   NODE_ENV=production
   REDIS_URL=redis://localhost:6379
   REDIS_ENABLED=true
   ```

2. **Running Redis Locally**

   For local testing, you can run Redis using Docker:

   ```bash
   docker run --name redis -p 6379:6379 -d redis
   ```

   Or install and run Redis directly on your machine.

## Test Endpoints

We've created dedicated test endpoints that implement various rate limiting strategies:

1. **General API** (`/api/test/general`): Standard API rate limits (100 requests per minute)
2. **Authentication** (`/api/test/auth`): Stricter limits for authentication attempts (20 requests per minute)
3. **Sensitive Operations** (`/api/test/sensitive`): Very strict limits for sensitive operations (10 requests per minute)
4. **Admin Operations** (`/api/test/admin`): Limits for admin-only operations (50 requests per minute)

## Running the Tests

1. **Start the Application**

   ```bash
   npm run dev
   ```

2. **Execute Load Tests**

   ```bash
   ./scripts/load-testing.sh
   ```

   This script will:
   - Create a results directory if it doesn't exist
   - Run k6 with the Redis rate limiting test script
   - Save results in JSON, text summary, and HTML dashboard formats
   - Display a summary after completion

## Test Scenarios

The k6 test script (`tests/k6/redis-rate-limit-test.js`) includes several scenarios:

1. **General API Test**: Ramps up to 50 virtual users over 60 seconds
2. **Auth API Test**: Ramps up to 20 virtual users over 50 seconds
3. **Sensitive API Test**: Ramps up to 10 virtual users over 40 seconds
4. **Admin API Test**: Ramps up to 5 virtual users over 40 seconds

Each scenario sends POST requests to the corresponding endpoint and records:
- Success rate
- Rate-limited responses (HTTP 429)
- Response times

## Analyzing Results

After running the tests, you can analyze the results in several ways:

1. **Text Summary**: Basic metrics showing request counts, response codes, and timing
2. **HTML Dashboard**: Interactive visualization of test metrics
3. **JSON Data**: Raw data for custom analysis

Look for:
- Percentage of rate-limited responses (should increase as traffic exceeds limits)
- Response time patterns (should remain consistent even under load)
- Error rates (should be minimal outside of expected rate limiting)

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**
   - Check that Redis is running: `docker ps` or `redis-cli ping`
   - Verify the REDIS_URL in your .env.local file

2. **Inconsistent Rate Limiting**
   - In a distributed environment, ensure all nodes use the same Redis instance
   - Check that clocks are synchronized if using time-based rate limiting

3. **k6 Errors**
   - Ensure k6 is correctly installed: `k6 version`
   - Check for JavaScript syntax errors in the test script

## Best Practices

1. **Regular Testing**
   - Run load tests before major deployments
   - Periodically test in production-like environments

2. **Realistic Scenarios**
   - Simulate actual user behavior patterns
   - Test both sudden traffic spikes and gradual increases

3. **Monitoring During Tests**
   - Watch Redis memory usage during tests
   - Monitor application logs for unexpected errors

## Extended Testing

For more comprehensive testing:

1. **Distributed Testing**: Use k6 in distributed mode to generate higher loads
2. **Long-Running Tests**: Extend test duration to detect memory leaks or degradation
3. **Mixed Workloads**: Combine different endpoint tests to simulate realistic traffic

---

For more information on k6, see the [official documentation](https://k6.io/docs/).
For details on Redis rate limiting implementation, see our [Rate Limiting Guide](./rate-limiting.md).