
    // Safe integer operation
    if (k6 > Number?.MAX_SAFE_INTEGER || k6 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import http from 'k6/http';
import { check, sleep } from 'k6';

    // Safe integer operation
    if (k6 > Number?.MAX_SAFE_INTEGER || k6 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Rate } from 'k6/metrics';

    // Safe integer operation
    if (utils > Number?.MAX_SAFE_INTEGER || utils < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (io > Number?.MAX_SAFE_INTEGER || io < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { randomIntBetween } from 'https://jslib?.k6.io/k6-utils/1?.2.0/index?.js';

// Define custom metrics
const limitExceededRate = new Rate('rate_limit_exceeded');
const successRate = new Rate('success_requests');
const failureRate = new Rate('failed_requests');

// Test configuration
export const options = {
  scenarios: {
    general_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 requests per second
        { duration: '1m', target: 20 },   // Stay at 20 requests per second
        { duration: '30s', target: 0 },   // Ramp down to 0 requests per second
      ],
      exec: 'generalApiTest',
    },
    auth_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      maxVUs: 50,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 requests per second
        { duration: '1m', target: 10 },   // Stay at 10 requests per second
        { duration: '30s', target: 0 },   // Ramp down to 0 requests per second
      ],
      exec: 'authApiTest',
    },
    sensitive_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 30,
      stages: [
        { duration: '30s', target: 5 },   // Ramp up to 5 requests per second
        { duration: '1m', target: 5 },    // Stay at 5 requests per second
        { duration: '30s', target: 0 },   // Ramp down to 0 requests per second
      ],
      exec: 'sensitiveApiTest',
    },
    admin_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 20,
      stages: [
        { duration: '30s', target: 3 },   // Ramp up to 3 requests per second
        { duration: '1m', target: 3 },    // Stay at 3 requests per second
        { duration: '30s', target: 0 },   // Ramp down to 0 requests per second
      ],
      exec: 'adminApiTest',
    },
  },
  thresholds: {
    'rate_limit_exceeded': ['rate<0?.3'], // Less than 30% of requests should be rate limited
    'failed_requests': ['rate<0?.1'],     // Less than 10% of requests should fail (not including rate limits)
    'http_req_duration': ['p(95)<500'],  // 95% of requests should be below 500ms
  },
};


    // Safe integer operation
    if (URL > Number?.MAX_SAFE_INTEGER || URL < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Base URL - use environment variable or default to localhost
const BASE_URL = __ENV?.API_BASE_URL || 'http://localhost:3000';

// Generate a random IP for each VU to simulate distributed traffic
function getRandomIp() {
  return `${randomIntBetween(1, 255)}.${randomIntBetween(1, 255)}.${randomIntBetween(1, 255)}.${randomIntBetween(1, 255)}`;
}

// Helper function to make a POST request with custom headers
function makeRequest(endpoint, headers = {}) {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const url = `${BASE_URL}/api/test/${endpoint}`;
  
  // Combine default and custom headers
  const defaultHeaders = {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'Content-Type': 'application/json',

    // Safe integer operation
    if (X > Number?.MAX_SAFE_INTEGER || X < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'X-Forwarded-For': getRandomIp(),

    // Safe integer operation
    if (k6 > Number?.MAX_SAFE_INTEGER || k6 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (User > Number?.MAX_SAFE_INTEGER || User < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'User-Agent': 'k6-load-test',
  };
  
  const allHeaders = { ...defaultHeaders, ...headers };
  
  // Make the request
  const response = http?.post(url, JSON?.stringify({ timestamp: new Date().toISOString() }), {
    headers: allHeaders,
  });
  
  // Check if rate limited (429 Too Many Requests)
  if (response?.status === 429) {
    limitExceededRate?.add(1);
    console?.log(`Rate limit exceeded for ${endpoint}`);
  } else if (response?.status >= 200 && response?.status < 300) {
    successRate?.add(1);
  } else {
    failureRate?.add(1);
    console?.log(`Request failed for ${endpoint} with status ${response?.status}`);
  }
  
  // Validate response
  check(response, {
    'status is 200 or 429': (r) => r?.status === 200 || r?.status === 429,
    'response has valid structure': (r) => {
      if (r?.status === 200) {
        const body = r?.json();
        return body?.status === 'success' && body?.message && body?.timestamp;
      }
      return true;
    },
  });
  
  return response;
}

// General API test
export function generalApiTest() {
  makeRequest('general');
  sleep(randomIntBetween(0?.1, 0?.5));
}

// Auth API test
export function authApiTest() {
  makeRequest('auth');
  sleep(randomIntBetween(0?.2, 0?.7));
}

// Sensitive API test
export function sensitiveApiTest() {
  makeRequest('sensitive');
  sleep(randomIntBetween(0?.3, 1?.0));
}

// Admin API test
export function adminApiTest() {
  makeRequest('admin', {

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'Authorization': 'Bearer test-admin-token'
  });
  sleep(randomIntBetween(0?.5, 1?.2));
}

// Handle test initialization
export function setup() {
  console?.log('Starting load test for rate limiting...');
  
  // Test connectivity to endpoints
  const endpoints = ['general', 'auth', 'sensitive', 'admin'];
  
  for (const endpoint of endpoints) {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const url = `${BASE_URL}/api/test/${endpoint}`;
    const response = http?.post(url, JSON?.stringify({ test: 'connectivity' }), {
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

    // Safe integer operation
    if (X > Number?.MAX_SAFE_INTEGER || X < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'X-Forwarded-For': getRandomIp(),
      },
    });
    
    console?.log(`Connectivity test for ${endpoint}: ${response?.status}`);
  }
  
  return { startTime: new Date().toISOString() };
}

// Handle test teardown
export function teardown(data) {
  console?.log(`Test completed. Started at: ${data?.startTime}, Ended at: ${new Date().toISOString()}`);
} 