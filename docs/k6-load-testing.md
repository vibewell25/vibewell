# K6 Load Testing for Redis Rate Limiting

This document provides instructions on how to set up and run load tests for the Redis-based rate limiting system in the Vibewell application.

## Overview

The load testing suite uses [k6](https://k6.io), a modern load testing tool, to simulate traffic to our API endpoints and test the effectiveness of our rate limiting implementation. The tests target different types of API endpoints with varying load patterns to ensure our rate limiting works correctly under different scenarios.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed on your system
- Redis server running (for production mode tests)
- Vibewell application running locally

## Installation

### Installing k6

**macOS:**
```bash
brew install k6
```

**Alternative for macOS (if Homebrew is not available):**
```bash
# Download the latest version
curl -L https://github.com/grafana/k6/releases/download/v0.44.1/k6-v0.44.1-macos-amd64.zip -o k6.zip

# Extract the archive
unzip k6.zip

# Move binary to a directory in your PATH
sudo mv k6-v0.44.1-macos-amd64/k6 /usr/local/bin/

# Verify installation
k6 version
```

**Linux:**
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Alternative for Linux (binary installation):**
```bash
# Download the latest version
curl -L https://github.com/grafana/k6/releases/download/v0.44.1/k6-v0.44.1-linux-amd64.tar.gz -o k6.tar.gz

# Extract the archive
tar xzf k6.tar.gz

# Move binary to a directory in your PATH
sudo mv k6-v0.44.1-linux-amd64/k6 /usr/local/bin/

# Verify installation
k6 version
```

**Windows:**
```bash
winget install k6
```

### Installing Redis

If Redis is not already installed, you can install it using the following methods:

**Using Homebrew (macOS):**
```bash
brew install redis && brew services start redis
```

**Compiling from source:**
```bash
# Download and extract Redis
curl -O http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable

# Compile Redis
make

# Start Redis server
src/redis-server --daemonize yes

# Verify Redis is running
src/redis-cli ping
```

## Test Structure

The load testing suite consists of:

1. **Individual Test Scripts**: Separate scripts for testing different API endpoints
   - `scripts/load-tests/general-api.js` - Tests general API endpoints
   - `scripts/load-tests/auth-api.js` - Tests authentication endpoints
   - `scripts/load-tests/sensitive-api.js` - Tests sensitive operations endpoints
   - `scripts/load-tests/admin-api.js` - Tests admin operations endpoints
   - `scripts/load-tests/all-tests.js` - Runs all tests together in coordinated scenarios

2. **Test API Routes**: API endpoints specifically designed for load testing
   - `/api/test/general` - Simulates general API operations
   - `/api/test/auth` - Simulates authentication operations
   - `/api/test/sensitive` - Simulates sensitive operations
   - `/api/test/admin` - Simulates admin operations

3. **Load Testing Shell Script**: `scripts/load-testing.sh` - Automates running all tests and generating reports

## Configuration

### Environment Variables

Configure the application to use Redis for rate limiting by setting the following environment variables in your `.env.local` file:

```
NODE_ENV=production
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

### Test Scenarios

Each test script is configured with specific load patterns:

1. **General API Endpoints**: Tests with 20 virtual users, suitable for endpoints with higher limits
2. **Authentication Endpoints**: Tests with 10 virtual users, simulating login/registration attempts
3. **Sensitive Operations**: Tests with 5 virtual users, simulating payment operations
4. **Admin Operations**: Tests with 2 virtual users, simulating admin panel actions

## Running the Tests

### Running All Tests

To run all tests with the shell script:

```bash
./scripts/load-testing.sh
```

### Running Individual Tests

To run a specific test:

```bash
k6 run scripts/load-tests/general-api.js
```

### Running with Output Options

To save test results to a file:

```bash
k6 run --out json=results.json scripts/load-tests/all-tests.js
```

## Interpreting Results

The test results will show:

1. **Request Metrics**:
   - Total requests
   - Request rate
   - Response time percentiles
   - Failed requests

2. **Rate Limiting Metrics**:
   - Number of rate-limited requests (status code 429)
   - Rate limit exceeded percentage

3. **System Metrics**:
   - CPU usage
   - Memory usage
   - Network I/O

## Reports

After running the tests, reports are generated in the `./load-test-results` directory:

1. **JSON Reports**: Detailed metrics in machine-readable format
2. **HTML Report**: Visual representation of test results

## Best Practices

1. **Test in Isolation**: Run tests in a controlled environment to get accurate results
2. **Gradual Scaling**: Start with low user counts and gradually increase
3. **Use Production-Like Data**: Test with realistic payload sizes and patterns
4. **Monitor Redis**: Watch Redis memory usage and performance during tests
5. **Analyze Results**: Look for patterns in rate-limited requests to fine-tune limits

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**:
   - Ensure Redis is running and accessible
   - Check REDIS_URL environment variable

2. **Rate Limits Too Strict/Loose**:
   - Adjust rate limit configurations in `src/app/api/auth/rate-limit-middleware.ts`

3. **High CPU/Memory Usage**:
   - Reduce the number of virtual users or increase test machine resources

## Advanced Customization

### Custom Test Scenarios

To create custom test scenarios, modify the existing scripts or create new ones following the same pattern:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Customize your load pattern
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  // Your test logic here
}
```

### Simulating Different User Behaviors

To simulate different user behaviors, modify the request payload, headers, and sleep times.

## Integration with CI/CD

You can integrate these load tests with your CI/CD pipeline by:

1. Running the tests as part of your deployment process
2. Setting thresholds for test success/failure
3. Incorporating test results into deployment decisions

---

For more information on k6, see the [official documentation](https://k6.io/docs/). 

To stop the Redis server when you're done, you can use the following command:

```bash
./redis-stable/src/redis-cli shutdown
``` 