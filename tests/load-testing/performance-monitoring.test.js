import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTimeTrend = new Trend('response_time');
const throughputTrend = new Trend('throughput');

// Performance thresholds
export const options = {
  thresholds: {
    // Error rate should be less than 1%
    'error_rate': ['rate<0.01'],
    // 95% of requests should be below 500ms
    'response_time': ['p(95)<500'],
    // 99% of requests should be below 2000ms
    'http_req_duration': ['p(99)<2000'],
    // Throughput should be at least 100 requests/second
    'throughput': ['avg>100']
  },
  // Test scenarios
  scenarios: {
    // Constant load
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
    // Ramp-up load
    ramp_up: {
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
    },
    // Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 150 },
        { duration: '1m', target: 0 },
      ],
    },
  },
};

// Test setup
export function setup() {
  console.log('Starting performance tests');
  return {
    apiBaseUrl: __ENV.API_BASE_URL || 'http://localhost:3000',
  };
}

// Test teardown
export function teardown(data) {
  console.log('Performance tests completed');
}

// Main test function
export default function(data) {
  const baseUrl = data.apiBaseUrl;
  
  // Record start time for throughput calculation
  const startTime = new Date().getTime();

  // Test different API endpoints
  testHomePage(baseUrl);
  testProviderSearch(baseUrl);
  testBookingSystem(baseUrl);
  testPerformanceDashboard(baseUrl);
  
  // Calculate throughput
  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000;
  throughputTrend.add(4 / duration); // 4 requests per iteration
  
  // Wait between iterations
  sleep(1);
}

function testHomePage(baseUrl) {
  const response = http.get(`${baseUrl}/`);
  
  // Record response time
  responseTimeTrend.add(response.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage contains expected content': (r) => r.body.includes('Vibewell')
  });
  
  // Record error rate
  errorRate.add(!success);
}

function testProviderSearch(baseUrl) {
  const response = http.get(`${baseUrl}/api/providers`);
  
  // Record response time
  responseTimeTrend.add(response.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'provider search status is 200': (r) => r.status === 200,
    'provider search returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.providers);
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate.add(!success);
}

function testBookingSystem(baseUrl) {
  const payload = JSON.stringify({
    providerId: 1,
    service: 'Test Service',
    date: '2023-12-31',
    time: '10:00 AM'
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${baseUrl}/api/bookings`, payload, params);
  
  // Record response time
  responseTimeTrend.add(response.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'booking status is 201': (r) => r.status === 201,
    'booking returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate.add(!success);
}

function testPerformanceDashboard(baseUrl) {
  const response = http.get(`${baseUrl}/api/performance/metrics`);
  
  // Record response time
  responseTimeTrend.add(response.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'performance dashboard status is 200': (r) => r.status === 200,
    'performance data is valid': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.metrics !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate.add(!success);
} 