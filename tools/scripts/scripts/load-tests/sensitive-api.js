
    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Ramp up to 5 users
    { duration: '1m', target: 5 },   // Stay at 5 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = http.post('http://localhost:3000/api/test/sensitive', JSON.stringify({
    operation: 'payment',
    amount: 100,
    currency: 'USD'
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

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'Authorization': 'Bearer user-token'
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'rate limit not exceeded': (r) => r.status !== 429,
  });

  sleep(3); // Moderate sleep for sensitive operations
} 