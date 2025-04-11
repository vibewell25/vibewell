import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Test configuration
export const options = {
  scenarios: {
    general_api: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 20 },
        { duration: '30s', target: 20 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
    auth_api: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
      startTime: '10s',
    },
    sensitive_api: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
      startTime: '20s',
    },
    admin_api: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 2 },
        { duration: '30s', target: 2 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
      startTime: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// Custom metrics
const rateLimitExceeded = new Rate('rate_limit_exceeded');

// General API test
export function generalApiTest() {
  const res = http.post('http://localhost:3000/api/test/general', JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'general status is 200': (r) => r.status === 200,
    'general rate limit not exceeded': (r) => r.status !== 429,
  });

  if (res.status === 429) {
    rateLimitExceeded.add(1);
    console.log(`General API rate limited: ${res.body}`);
  }

  sleep(1);
}

// Auth API test
export function authApiTest() {
  const res = http.post('http://localhost:3000/api/test/auth', JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'auth status is 200': (r) => r.status === 200,
    'auth rate limit not exceeded': (r) => r.status !== 429,
  });

  if (res.status === 429) {
    rateLimitExceeded.add(1);
    console.log(`Auth API rate limited: ${res.body}`);
  }

  sleep(2);
}

// Sensitive API test
export function sensitiveApiTest() {
  const res = http.post('http://localhost:3000/api/test/sensitive', JSON.stringify({
    operation: 'payment',
    amount: 100,
    currency: 'USD'
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer user-token'
    },
  });

  check(res, {
    'sensitive status is 200': (r) => r.status === 200,
    'sensitive rate limit not exceeded': (r) => r.status !== 429,
  });

  if (res.status === 429) {
    rateLimitExceeded.add(1);
    console.log(`Sensitive API rate limited: ${res.body}`);
  }

  sleep(3);
}

// Admin API test
export function adminApiTest() {
  const res = http.post('http://localhost:3000/api/test/admin', JSON.stringify({
    operation: 'user_management',
    action: 'update_role',
    userId: '123',
    newRole: 'admin'
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer admin-token'
    },
  });

  check(res, {
    'admin status is 200': (r) => r.status === 200,
    'admin rate limit not exceeded': (r) => r.status !== 429,
  });

  if (res.status === 429) {
    rateLimitExceeded.add(1);
    console.log(`Admin API rate limited: ${res.body}`);
  }

  sleep(5);
} 