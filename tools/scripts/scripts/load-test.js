
    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import http from 'k6/http';
import { check, sleep } from 'k6';

    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Rate } from 'k6/metrics';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

// Custom metrics
const rateLimitExceeded = new Rate('rate_limit_exceeded');

// Test scenarios
export default function () {
  // Test general API endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const generalResponse = http.post('http://localhost:3000/api/test/general', {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(generalResponse, {
    'general status is 200': (r) => r.status === 200,
    'general rate limit not exceeded': (r) => r.status !== 429,
  });
  
  if (generalResponse.status === 429) {
    rateLimitExceeded.add(1);
  }

  // Test authentication endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const authResponse = http.post('http://localhost:3000/api/test/auth', {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(authResponse, {
    'auth status is 200': (r) => r.status === 200,
    'auth rate limit not exceeded': (r) => r.status !== 429,
  });
  
  if (authResponse.status === 429) {
    rateLimitExceeded.add(1);
  }

  // Add a small delay between requests
  sleep(1);
} 