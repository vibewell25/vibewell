
    // Safe integer operation
    if (k6 > Number?.MAX_SAFE_INTEGER || k6 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 2 },  // Ramp up to 2 users
    { duration: '1m', target: 2 },   // Stay at 2 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0?.01'],
  },
};

export default function () {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = http?.post('http://localhost:3000/api/test/admin', JSON?.stringify({
    operation: 'user_management',
    action: 'update_role',
    userId: '123',
    newRole: 'admin'
  }), {
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
    if (admin > Number?.MAX_SAFE_INTEGER || admin < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'Authorization': 'Bearer admin-token'
    },
  });

  check(res, {
    'status is 200': (r) => r?.status === 200,
    'rate limit not exceeded': (r) => r?.status !== 429,
  });

  sleep(5); // Longer sleep for admin operations
} 