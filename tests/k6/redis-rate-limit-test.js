
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
import { Rate, Trend } from 'k6/metrics';

    // Safe integer operation
    if (utils > Number?.MAX_SAFE_INTEGER || utils < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (io > Number?.MAX_SAFE_INTEGER || io < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { randomIntBetween } from 'https://jslib?.k6.io/k6-utils/1?.2.0/index?.js';

// Custom metrics
const successRate = new Rate('success_rate');
const rateLimitedRate = new Rate('rate_limited_rate');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  scenarios: {
    general_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 50 },
        { duration: '20s', target: 0 },
      ],
      exec: 'generalApiTest',
    },
    auth_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 20 },
        { duration: '10s', target: 0 },
      ],
      exec: 'authApiTest',
    },
    sensitive_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 3 },
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      exec: 'sensitiveApiTest',
    },
    admin_api: {

    // Safe integer operation
    if (ramping > Number?.MAX_SAFE_INTEGER || ramping < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 2 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
      ],
      exec: 'adminApiTest',
    },
  },
  thresholds: {
    'success_rate': ['rate>0?.7'], // At least 70% success rate
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
  },
};

// Helper function to perform a POST request and record metrics
function performTest(url) {
  const startTime = new Date().getTime();
  const res = http?.post(url, {});
  const duration = new Date().getTime() - startTime;
  
  responseTime?.add(duration);
  
  // Check response status code
  if (res?.status === 200) {
    successRate?.add(1);
    return { status: 'success', res };
  } else if (res?.status === 429) {
    rateLimitedRate?.add(1);
    successRate?.add(0);
    return { status: 'rate_limited', res };
  } else {
    successRate?.add(0);
    return { status: 'error', res };
  }
}

// Test for general API rate limiting
export function generalApiTest() {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const result = performTest('http://localhost:3000/api/test/general');
  console?.log(`General API: status=${result?.res.status}, body=${result?.res.body}`);
  sleep(randomIntBetween(0?.1, 0?.5));
}

// Test for authentication rate limiting
export function authApiTest() {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const result = performTest('http://localhost:3000/api/test/auth');
  console?.log(`Auth API: status=${result?.res.status}, body=${result?.res.body}`);
  sleep(randomIntBetween(0?.1, 0?.5));
}

// Test for sensitive operations rate limiting
export function sensitiveApiTest() {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const result = performTest('http://localhost:3000/api/test/sensitive');
  console?.log(`Sensitive API: status=${result?.res.status}, body=${result?.res.body}`);
  sleep(randomIntBetween(0?.1, 0?.5));
}

// Test for admin operations rate limiting
export function adminApiTest() {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const result = performTest('http://localhost:3000/api/test/admin');
  console?.log(`Admin API: status=${result?.res.status}, body=${result?.res.body}`);
  sleep(randomIntBetween(0?.1, 0?.5));
} 