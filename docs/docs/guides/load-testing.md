# Load Testing Guide

This guide covers load testing for the Vibewell application, with a focus on performance monitoring. Load tests help ensure the application can handle expected traffic and identify performance bottlenecks before they impact users.

## Overview

Load testing simulates high traffic and usage patterns to:
- Measure application performance under load
- Identify performance bottlenecks
- Ensure system stability under stress
- Validate performance monitoring capabilities
- Establish performance baselines

## Performance Testing Focus

Our load tests focus on several key areas:

- **API Endpoints**: Testing response times and throughput of critical API endpoints
- **Database Performance**: Measuring database query performance under load
- **Rate Limiting**: Validating rate limiting effectiveness and configuration
- **Performance Monitoring**: Testing our monitoring systems under load
- **Resource Utilization**: Tracking CPU, memory, and network usage

## Implementation with k6

We use [k6](https://k6.io/) for load testing, a modern load testing tool that's developer-friendly and powerful:

- **JavaScript API**: Write tests in JavaScript
- **Configurable Virtual Users**: Simulate many concurrent users
- **Metrics Collection**: Detailed performance metrics
- **Threshold Validation**: Set pass/fail criteria based on metrics
- **Test Scenarios**: Run different test patterns (constant load, ramp-up, stress)

### Key Metrics

Our load tests collect and analyze:

- **Response Time**: Time to serve requests (p50, p95, p99 percentiles)
- **Throughput**: Requests per second the system can handle
- **Error Rate**: Percentage of failed requests
- **Virtual Users**: Number of concurrent users
- **Resource Utilization**: CPU, memory, and network usage

## Getting Started with Load Testing

### Installation

To run load tests, you need to install k6:

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Running Load Tests

To run load tests:

```bash
# Run performance monitoring load test
k6 run tests/load-testing/performance-monitoring.test.js

# Run with custom environment variables
k6 run -e API_BASE_URL=http://localhost:3000 tests/load-testing/performance-monitoring.test.js

# Run with output to JSON for further analysis
k6 run --out json=test-results/load-test-results.json tests/load-testing/performance-monitoring.test.js

# Run via the test script
./scripts/run-tests.sh
```

## Test Scenarios

Our load tests include different scenarios:

### Constant Load

Tests system performance under steady traffic:

```javascript
{
  executor: 'constant-arrival-rate',
  rate: 50,          // 50 requests per timeUnit
  timeUnit: '1s',    // 1 second
  duration: '1m',    // Run for 1 minute
  preAllocatedVUs: 20,
  maxVUs: 50,
}
```

### Ramp-Up Load

Tests how the system performs as traffic gradually increases:

```javascript
{
  executor: 'ramping-arrival-rate',
  startRate: 10,
  timeUnit: '1s',
  preAllocatedVUs: 10,
  maxVUs: 100,
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 10 },
  ],
}
```

### Stress Test

Pushes the system to its limits to find breaking points:

```javascript
{
  executor: 'ramping-vus',
  startVUs: 1,
  stages: [
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 0 },
  ],
}
```

## Writing Custom Load Tests

To create a new load test:

1. **Define Test Goals**: Determine what you want to measure
2. **Create Test Script**: Write a k6 test script
3. **Configure Thresholds**: Set pass/fail criteria
4. **Run and Analyze**: Execute the test and analyze results

### Example Test Script

Here's a simplified example of a load test script:

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');

export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must finish within 500ms
    'error_rate': ['rate<0.01'],        // Error rate must be less than 1%
  },
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
    },
  },
};

export default function() {
  const res = http.get('http://localhost:3000/api/some-endpoint');
  
  // Check if request was successful
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // Add to error rate if check failed
  errorRate.add(!success);
  
  sleep(1);
}
```

## Interpreting Results

After running a load test, you'll get detailed metrics including:

- **Response times** (min, max, average, p90, p95, p99)
- **Request rate** (requests per second)
- **Error rate** (percentage of failed requests)
- **Iteration duration** (how long each test iteration takes)
- **Data received/sent** (throughput)

### Example Output

```
  execution: local
     script: load-tests/api-performance.js
     output: json=test-results/load-test-results.json

  scenarios: (100.00%) 1 scenario, 50 max VUs, 1m30s max duration (incl. graceful stop):
           * constant_load: 30.00 iterations/s for 1m0s (maxVUs: 50)

running (1m00.0s), 50/50 VUs, 1800 complete and 0 interrupted iterations
constant_load ✓ [======================================] 50 VUs  1m0s

     data_received..................: 8.4 MB 139 kB/s
     data_sent......................: 160 kB 2.7 kB/s
     http_req_blocked...............: avg=0.75ms   min=0s      med=0s      max=85.27ms  p(90)=0s      p(95)=0s
     http_req_connecting............: avg=0.38ms   min=0s      med=0s      max=42.64ms  p(90)=0s      p(95)=0s
     http_req_duration..............: avg=15.3ms   min=8.43ms  med=12.64ms max=189.91ms p(90)=19.76ms p(95)=25.86ms
       { expected_response:true }...: avg=15.3ms   min=8.43ms  med=12.64ms max=189.91ms p(90)=19.76ms p(95)=25.86ms
     http_req_failed................: 0.00%  ✓ 0   ✗ 1800
     http_req_receiving.............: avg=0.2ms    min=0.02ms  med=0.11ms  max=9.11ms   p(90)=0.3ms   p(95)=0.52ms
     http_req_sending...............: avg=0.08ms   min=0.01ms  med=0.04ms  max=9.35ms   p(90)=0.11ms  p(95)=0.19ms
     http_req_tls_handshaking.......: avg=0ms      min=0s      med=0s      max=0s       p(90)=0s      p(95)=0s
     http_req_waiting...............: avg=15.02ms  min=8.33ms  med=12.41ms max=189.54ms p(90)=19.37ms p(95)=25.47ms
     http_reqs......................: 1800   29.997004/s
     iteration_duration.............: avg=1.01s    min=1s      med=1.01s   max=1.19s    p(90)=1.02s   p(95)=1.03s
     iterations.....................: 1800   29.997004/s
     vus............................: 50     min=50 max=50
     vus_max........................: 50     min=50 max=50
```

## Best Practices

- **Start Small**: Begin with low load and gradually increase
- **Test in Isolation**: Use a dedicated environment
- **Monitor System Resources**: Track CPU, memory, disk I/O during tests
- **Test Regularly**: Run load tests after major changes
- **Set Realistic Thresholds**: Base thresholds on business requirements
- **Include Data Variety**: Test with realistic data variations

## Troubleshooting

Common load testing issues:

- **Resource Constraints on Test Machine**: The machine running k6 becomes a bottleneck
  - Solution: Run distributed tests or use a more powerful machine

- **Network Bottlenecks**: Network limitations affect test results
  - Solution: Run tests closer to the application or use multiple test sources

- **Unrealistic Test Scenarios**: Tests don't reflect real-world usage
  - Solution: Analyze production traffic patterns and model tests accordingly