# Load Testing Example

This example demonstrates how to run load tests against our rate limiting implementation and analyze the results.

## Basic Load Test

To run a basic load test against all the rate limiting endpoints:

```bash
# Make sure the script is executable
chmod +x scripts/load-testing.sh

# Run the tests with default settings
./scripts/load-testing.sh
```

## Testing Redis Rate Limiting in Production Mode

To test Redis-based rate limiting (recommended for production):

```bash
# First ensure Redis is running
redis-server --daemonize yes

# Run the tests with Redis enabled
NODE_ENV=production REDIS_URL=redis://localhost:6379 ./scripts/load-testing.sh
```

## Sample Results Analysis

After running the tests, you'll get output files in the `load-test-results` directory. Here's how to interpret them:

### 1. Rate Limiting Effectiveness

From the JSON summary, you can see how many requests were rate limited:

```json
{
  "metrics": {
    "rate_limit_exceeded": {
      "count": 243,
      "rate": 0.28723404255319146
    },
    "success_requests": {
      "count": 603,
      "rate": 0.7127659574468085
    }
  }
}
```

This shows that approximately 28.7% of requests were rate limited, which means our rate limiting is working as expected.

### 2. Response Time Analysis

Look at the HTTP request duration metrics:

```json
{
  "metrics": {
    "http_req_duration": {
      "avg": 45.23,
      "min": 12.34,
      "med": 38.21,
      "max": 187.52,
      "p(90)": 92.45,
      "p(95)": 123.67
    }
  }
}
```

This indicates that:
- Average response time: 45.23ms
- Median response time: 38.21ms
- 95% of requests completed in under 123.67ms

### 3. Visual Analysis

Open the HTML report in a browser for visual analysis:

```bash
open ./load-test-results/report_20240801_120000.html
```

The report includes:
- Response time graphs
- Request rate visualizations
- Rate limiting percentage charts
- Error rate analysis

## Comparing In-Memory vs Redis Rate Limiting

To compare the performance of in-memory vs. Redis-based rate limiting:

```bash
# Run tests with in-memory rate limiting
REDIS_ENABLED=false ./scripts/load-testing.sh

# Run tests with Redis rate limiting
REDIS_ENABLED=true ./scripts/load-testing.sh

# Compare the summary files
```

Key differences to look for:
1. **Consistency**: Redis-based rate limiting should show more consistent rate limiting across test runs
2. **Scalability**: Redis-based rate limiting maintains effectiveness under higher loads
3. **Response Time**: Redis might add slight latency compared to in-memory solutions

## Testing Against Specific Endpoints

To test only specific rate limiting endpoints:

```bash
# Test only the general API rate limiter
API_BASE_URL=http://localhost:3000 k6 run scripts/load-tests/rate-limit-test.js --env TEST_TYPE=general

# Test only the authentication rate limiter
API_BASE_URL=http://localhost:3000 k6 run scripts/load-tests/rate-limit-test.js --env TEST_TYPE=auth
```

## Real-World Testing Scenario

Here's a realistic example of a testing workflow:

1. **Start Redis and the application server**:
   ```bash
   redis-server --daemonize yes
   npm run dev
   ```

2. **Run baseline tests in development mode**:
   ```bash
   ./scripts/load-testing.sh
   ```

3. **Enable Redis rate limiting and run production tests**:
   ```bash
   NODE_ENV=production ./scripts/load-testing.sh
   ```

4. **Test high-load scenario**:
   ```bash
   NODE_ENV=production MAX_VUS=200 DURATION=2m ./scripts/load-testing.sh
   ```

5. **Analyze results**:
   ```bash
   # Compare summary files
   jq -s '.[0].metrics.rate_limit_exceeded, .[1].metrics.rate_limit_exceeded' \
      ./load-test-results/summary_*_dev.json ./load-test-results/summary_*_prod.json
   ```

By following this workflow, you can verify that your rate limiting works properly in both development and production environments, and under various load conditions. 