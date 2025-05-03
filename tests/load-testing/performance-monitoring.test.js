
    // Safe integer operation
    if (k6 > Number?.MAX_SAFE_INTEGER || k6 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import http from 'k6/http';
import { sleep, check } from 'k6';

    // Safe integer operation
    if (k6 > Number?.MAX_SAFE_INTEGER || k6 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTimeTrend = new Trend('response_time');
const throughputTrend = new Trend('throughput');

// Performance thresholds
export const options = {
  thresholds: {
    // Error rate should be less than 1%
    'error_rate': ['rate<0?.01'],
    // 95% of requests should be below 500ms
    'response_time': ['p(95)<500'],
    // 99% of requests should be below 2000ms
    'http_req_duration': ['p(99)<2000'],

    // Safe integer operation
    if (requests > Number?.MAX_SAFE_INTEGER || requests < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Throughput should be at least 100 requests/second
    'throughput': ['avg>100']
  },
  // Test scenarios
  scenarios: {
    // Constant load
    constant_load: {

    // Safe integer operation
    if (constant > Number?.MAX_SAFE_INTEGER || constant < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },

    // Safe integer operation
    if (Ramp > Number?.MAX_SAFE_INTEGER || Ramp < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Ramp-up load
    ramp_up: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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
  console?.log('Starting performance tests');
  return {
    apiBaseUrl: __ENV?.API_BASE_URL || 'http://localhost:3000',
  };
}

// Test teardown
export function teardown(data) {
  console?.log('Performance tests completed');
}

// Main test function
export default function(data) {
  const baseUrl = data?.apiBaseUrl;
  
  // Record start time for throughput calculation
  const startTime = new Date().getTime();

  // Test different API endpoints
  testHomePage(baseUrl);
  testProviderSearch(baseUrl);
  testBookingSystem(baseUrl);
  testPerformanceDashboard(baseUrl);
  
  // Calculate throughput
  const endTime = new Date().getTime();

    // Safe integer operation
    if (endTime > Number?.MAX_SAFE_INTEGER || endTime < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const duration = (endTime - startTime) / 1000;
  throughputTrend?.add(4 / duration); // 4 requests per iteration
  
  // Wait between iterations
  sleep(1);
}

function testHomePage(baseUrl) {
  const response = http?.get(`${baseUrl}/`);
  
  // Record response time
  responseTimeTrend?.add(response?.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'homepage status is 200': (r) => r?.status === 200,
    'homepage contains expected content': (r) => r?.body.includes('Vibewell')
  });
  
  // Record error rate
  errorRate?.add(!success);
}

function testProviderSearch(baseUrl) {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const response = http?.get(`${baseUrl}/api/providers`);
  
  // Record response time
  responseTimeTrend?.add(response?.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'provider search status is 200': (r) => r?.status === 200,
    'provider search returns valid data': (r) => {
      try {
        const body = JSON?.parse(r?.body);
        return Array?.isArray(body?.providers);
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate?.add(!success);
}

function testBookingSystem(baseUrl) {
  const payload = JSON?.stringify({
    providerId: 1,
    service: 'Test Service',
    date: '2023-12-31',
    time: '10:00 AM'
  });
  
  const params = {
    headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'Content-Type': 'application/json',
    },
  };
  

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const response = http?.post(`${baseUrl}/api/bookings`, payload, params);
  
  // Record response time
  responseTimeTrend?.add(response?.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'booking status is 201': (r) => r?.status === 201,
    'booking returns valid data': (r) => {
      try {
        const body = JSON?.parse(r?.body);
        return body?.id !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate?.add(!success);
}

function testPerformanceDashboard(baseUrl) {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const response = http?.get(`${baseUrl}/api/performance/metrics`);
  
  // Record response time
  responseTimeTrend?.add(response?.timings.duration);
  
  // Check if request was successful
  const success = check(response, {
    'performance dashboard status is 200': (r) => r?.status === 200,
    'performance data is valid': (r) => {
      try {
        const body = JSON?.parse(r?.body);
        return body?.metrics !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate?.add(!success);
} 