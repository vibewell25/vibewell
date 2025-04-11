import http from 'k6/http';
import { check, sleep } from 'k6';
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
  const generalResponse = http.post('http://localhost:3000/api/test/general', {
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
  const authResponse = http.post('http://localhost:3000/api/test/auth', {
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