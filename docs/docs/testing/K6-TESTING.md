# Installing k6 for Load Testing

This guide explains how to install k6, a modern load testing tool used for testing the performance of our Redis rate limiting implementation.

## macOS Installation

Using Homebrew:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install k6
brew install k6
```

## Linux Installation

### Ubuntu/Debian

```bash
# Add the k6 repository
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69

# Add the repository to your sources
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list

# Update and install
sudo apt-get update
sudo apt-get install k6
```

### CentOS/RHEL

```bash
# Create a new repo file
sudo tee /etc/yum.repos.d/k6.repo<<EOF
[k6]
name=k6 Repository
baseurl=https://dl.k6.io/rpm/stable
enabled=1
gpgcheck=1
gpgkey=https://dl.k6.io/key.gpg
EOF

# Install k6
sudo yum install k6
```

## Windows Installation

Using Chocolatey:

```powershell
# Install Chocolatey if you don't have it
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install k6
choco install k6
```

Using the installer:

1. Download the Windows installer from [k6.io/docs/getting-started/installation](https://k6.io/docs/getting-started/installation/)
2. Run the installer and follow the installation wizard
3. Verify the installation by running `k6 version` in Command Prompt or PowerShell

## Docker Installation

If you prefer to use Docker:

```bash
# Pull the k6 image
docker pull grafana/k6

# Run k6 in a container
docker run --rm -i grafana/k6 run - <script.js
```

## Verifying Installation

To verify that k6 is installed correctly, run:

```bash
k6 version
```

You should see output similar to:

```
k6 v0.40.0 (2022-12-21T12:53:32+0000/4ef80635, go1.19.4, darwin/arm64)
```

## Optional: Installing HTML Report Generator

To generate HTML reports from k6 test results:

```bash
# Install the k6-html-reporter package
npm install -g @k6-contrib/html-report
```

## Troubleshooting

If you encounter issues with the installation:

1. **Command not found**: Ensure the installation directory is in your PATH
2. **Permission errors**: Try using `sudo` for Linux installations
3. **Dependencies missing**: Check the [k6 documentation](https://k6.io/docs/getting-started/installation/) for specific dependencies for your OS

## Next Steps

After installing k6, you can run the load tests as described in the [load testing documentation](./load-testing.md):

```bash
# Make the script executable
chmod +x scripts/load-testing.sh

# Run the load tests
./scripts/load-testing.sh
``` # K6 Load Testing for Redis Rate Limiting

This document provides instructions on how to set up and run load tests for the Redis-based rate limiting system in the VibeWell application.

## Overview

The load testing suite uses [k6](https://k6.io), a modern load testing tool, to simulate traffic to our API endpoints and test the effectiveness of our rate limiting implementation. The tests target different types of API endpoints with varying load patterns to ensure our rate limiting works correctly under different scenarios.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed on your system
- Redis server running (for production mode tests)
- VibeWell application running locally

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
``` # k6 Testing Guide for Rate Limiting

This guide explains how to use k6 to test the rate limiting functionality in the VibeWell application, covering both Redis and in-memory rate limiting implementations.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed locally
- Node.js 16+ installed
- Access to the VibeWell application (local or deployed)
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