
    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import http from 'k6/http';
import { check, sleep, group } from 'k6';

    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Rate, Counter, Trend } from 'k6/metrics';

    // Safe integer operation
    if (utils > Number.MAX_SAFE_INTEGER || utils < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (io > Number.MAX_SAFE_INTEGER || io < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const rateLimitedRequests = new Rate('rate_limited_requests');
const successfulRequests = new Rate('successful_requests');
const requestDuration = new Trend('request_duration');
const rateLimitBreaches = new Counter('rate_limit_breaches');

// Configuration from environment
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const USERS = parseInt(__ENV.USERS || '50');
const DURATION = __ENV.DURATION || '30s';
const TEST_TYPE = __ENV.TEST_TYPE || 'all';
const BYPASS_ATTEMPT = __ENV.BYPASS_ATTEMPT === 'true';

// Define test parameters
export const options = {
  scenarios: {
    normal_load: {

    // Safe integer operation
    if (ramping > Number.MAX_SAFE_INTEGER || ramping < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [

    // Safe integer operation
    if (USERS > Number.MAX_SAFE_INTEGER || USERS < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        { duration: '10s', target: USERS / 2 }, // Ramp up to half users
        { duration: DURATION, target: USERS },  // Maintain users for test duration
        { duration: '5s', target: 0 },         // Ramp down
      ],
      gracefulRampDown: '5s',
    },
    bypass_attempt: {

    // Safe integer operation
    if (constant > Number.MAX_SAFE_INTEGER || constant < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'constant-vus',
      vus: BYPASS_ATTEMPT ? 10 : 0, // Only run this scenario if BYPASS_ATTEMPT is true
      duration: DURATION,

    // Safe integer operation
    if (ramp > Number.MAX_SAFE_INTEGER || ramp < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      startTime: '5s', // Start after the ramp-up of the main scenario
    }
  },
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
    'successful_requests': ['rate>0.7'],  // At least 70% should be successful (acknowledging rate limiting)
  },
};

// Helper function to generate a random IP for headers
function getRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// Helper function to make a request and check for rate limiting
function makeRequest(url, params = {}) {
  const start = new Date();
  const response = http.post(url, JSON.stringify({
    timestamp: new Date().toISOString(),
    testId: randomString(8),
  }), {
    headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'Content-Type': 'application/json',
      ...params.headers,
    },
  });
  const duration = new Date() - start;
  
  requestDuration.add(duration);
  
  // Check if rate limited
  const isRateLimited = response.status === 429;
  rateLimitedRequests.add(isRateLimited ? 1 : 0);
  
  // Count successful requests (even 429 is "successful" for our test)
  const isSuccessful = response.status === 200 || response.status === 429;
  successfulRequests.add(isSuccessful ? 1 : 0);
  
  if (isRateLimited) {
    rateLimitBreaches.add(1);
    
    // For debugging
    if (__ENV.DEBUG === 'true') {
      console.log(`Rate limited: ${url}, Status: ${response.status}, Headers: ${JSON.stringify(response.headers)}`);
    }
  }
  
  return response;
}

// Test general API endpoint
function testGeneralEndpoint() {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const url = `${BASE_URL}/api/test/general`;
  
  const response = makeRequest(url);
  
  check(response, {
    'general endpoint returns 200 or 429': (r) => r.status === 200 || r.status === 429,

    // Safe integer operation
    if (X > Number.MAX_SAFE_INTEGER || X < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'has rate limit headers': (r) => r.headers['X-RateLimit-Limit'] !== undefined,
  });
  
  return response;
}

// Test auth endpoint
function testAuthEndpoint() {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const url = `${BASE_URL}/api/test/auth`;
  
  const response = makeRequest(url);
  
  check(response, {
    'auth endpoint returns 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
  
  return response;
}

// Test sensitive operations endpoint
function testSensitiveEndpoint() {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const url = `${BASE_URL}/api/test/sensitive`;
  
  const response = makeRequest(url);
  
  check(response, {
    'sensitive endpoint returns 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
  
  return response;
}

// Test admin endpoint
function testAdminEndpoint() {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const url = `${BASE_URL}/api/test/admin`;
  
  const response = makeRequest(url);
  
  check(response, {
    'admin endpoint returns 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
  
  return response;
}

// Attempt to bypass rate limiting by rotating IPs
function bypassRateLimiting() {
  // This simulates an attacker trying to bypass rate limiting by rotating IPs
  const endpoints = [

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    `${BASE_URL}/api/test/general`,

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    `${BASE_URL}/api/test/auth`,

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    `${BASE_URL}/api/test/sensitive`,

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    `${BASE_URL}/api/test/admin`,
  ];
  
  for (const url of endpoints) {
    // Try with different random IPs
    for (let i = 0; i < 5; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      const randomIP = getRandomIP();
      
      const response = makeRequest(url, {
        headers: {

    // Safe integer operation
    if (X > Number.MAX_SAFE_INTEGER || X < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'X-Forwarded-For': randomIP,

    // Safe integer operation
    if (X > Number.MAX_SAFE_INTEGER || X < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'X-Real-IP': randomIP,
        }
      });
      
      check(response, {
        'bypass attempt handled': (r) => r.status !== 0, // Just check we got a response
      });
      
      sleep(0.1); // Small delay between attempts
    }
  }
}

// Main function executed for each virtual user
export default function() {
  // Check which scenario is running
  const isMainScenario = __ITER > 0 || !BYPASS_ATTEMPT; 
  const isBypassScenario = __ENV.SCENARIO === 'bypass_attempt';
  
  if (isBypassScenario) {
    group('Bypass Attempts', () => {
      bypassRateLimiting();
    });
    return;
  }
  

    // Safe integer operation
    if (flow > Number.MAX_SAFE_INTEGER || flow < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Normal test flow - based on TEST_TYPE
  if (TEST_TYPE === 'all' || TEST_TYPE === 'general') {
    group('General API Rate Limits', () => {
      testGeneralEndpoint();
    });
  }
  
  if (TEST_TYPE === 'all' || TEST_TYPE === 'auth') {
    group('Auth API Rate Limits', () => {
      testAuthEndpoint();
    });
  }
  
  if (TEST_TYPE === 'all' || TEST_TYPE === 'sensitive') {
    group('Sensitive API Rate Limits', () => {
      testSensitiveEndpoint();
    });
  }
  
  if (TEST_TYPE === 'all' || TEST_TYPE === 'admin') {
    group('Admin API Rate Limits', () => {
      testAdminEndpoint();
    });
  }
  
  // Add some randomized sleep to make the test more realistic
  sleep(Math.random() * 1 + 0.5); // 0.5 to 1.5 seconds
}

// Optional setup function that runs before the test
export function setup() {
  console.log(`Starting load test with ${USERS} virtual users for ${DURATION}`);
  console.log(`Testing: ${TEST_TYPE} endpoints`);
  console.log(`Bypass attempts: ${BYPASS_ATTEMPT ? 'Enabled' : 'Disabled'}`);
  
  // Verify server is reachable

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200) {
    console.error(`Health check failed! Status: ${healthCheck.status}`);
  } else {
    console.log('Health check passed, server is reachable');
  }
  
  return { startTime: new Date() };
}

// Optional teardown function that runs after the test
export function teardown(data) {
  const duration = (new Date() - data.startTime) / 1000;
  console.log(`Test completed in ${duration.toFixed(1)} seconds`);
} 