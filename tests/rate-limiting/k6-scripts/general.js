import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const successRate = new Rate('success_rate');
const requestsPerSecond = new Rate('requests_per_second');
const responseTime = new Trend('response_time');
const rateLimitHits = new Counter('rate_limit_hits');

export const options = {
  vus: __ENV.USERS || 10,
  duration: __ENV.DURATION || '10s',
  thresholds: {
    success_rate: ['rate>0.7'], // 70% success rate
    response_time: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

// URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/test';
const ENDPOINT = __ENV.ENDPOINT || 'general';
const URL = `${BASE_URL}/${ENDPOINT}`;

export default function () {
  // Send POST request to the test endpoint
  const payload = JSON.stringify({
    timestamp: Date.now(),
    testId: `k6-load-test-${__VU}-${__ITER}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Client': 'k6-load-test',
    },
  };

  const startTime = new Date().getTime();
  const response = http.post(URL, payload, params);
  const endTime = new Date().getTime();

  // Record metrics
  responseTime.add(endTime - startTime);
  requestsPerSecond.add(1);
  
  // Check if request was successful (200) or hit rate limit (429)
  const isSuccess = response.status === 200;
  const isRateLimit = response.status === 429;
  
  // Record success/failure
  successRate.add(isSuccess);
  
  // Count rate limit hits
  if (isRateLimit) {
    rateLimitHits.add(1);
    console.log(`Rate limit hit: ${response.status} ${response.body}`);
  }
  
  // Verify response structure
  check(response, {
    'is status 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has correct headers': (r) => r.headers['content-type'].includes('application/json'),
  });

  if (isSuccess) {
    check(response, {
      'has success status': (r) => JSON.parse(r.body).status === 'success',
    });
  } else if (isRateLimit) {
    check(response, {
      'has rate limit error': (r) => JSON.parse(r.body).error !== undefined,
      'has retry-after header': (r) => r.headers['retry-after'] !== undefined,
    });
  }

  // Add some randomness to avoid synchronized requests
  sleep(Math.random() * 1);
} 