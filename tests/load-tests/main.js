import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 20 }, // Stay at 20 users
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'],    // Less than 1% of requests can fail
    'errors': ['rate<0.01'],             // Less than 1% error rate
  },
};

const BASE_URL = __ENV.TEST_URL || 'http://localhost:3001';

export default function () {
  const endpoints = {
    home: `${BASE_URL}/`,
    health: `${BASE_URL}/api/health`,
    profile: `${BASE_URL}/api/profile`,
  };

  // Test homepage load
  const homeRes = http.get(endpoints.home);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads under 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(homeRes.status !== 200);

  sleep(1);

  // Test health endpoint
  const healthRes = http.get(endpoints.health);
  check(healthRes, {
    'health check returns 200': (r) => r.status === 200,
    'health check response is valid': (r) => {
      try {
        if (!r.body) return false;
        const body = JSON.parse(r.body);
        return body && body.status === 'healthy';
      } catch (e) {
        console.error('Failed to parse health check response:', e);
        return false;
      }
    },
  });
  errorRate.add(healthRes.status !== 200);

  sleep(1);

  // Test authenticated endpoint (will fail without auth)
  const profileRes = http.get(endpoints.profile);
  check(profileRes, {
    'unauthorized access returns 401': (r) => r.status === 401 || r.status === 403,
  });
  errorRate.add(![401, 403].includes(profileRes.status));

  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      ...data,
      metrics: {
        ...data.metrics,
        errors: {
          ...data.metrics.errors,
          details: 'Check the test output for detailed error information'
        }
      }
    }, null, 2),
    'summary.json': JSON.stringify(data),
  };
} 