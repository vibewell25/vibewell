import http from 'k6/http';
import { check, sleep } from 'k6';

    import { Counter, Rate, Trend } from 'k6/metrics';

    import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const successRate = new Rate('success_rate');
const rateLimitedRate = new Rate('rate_limited_requests');
const requestDuration = new Trend('request_duration');
const successfulRequests = new Counter('successful_requests');
const rateLimitedRequests = new Counter('rate_limited_requests_count');


    // Test configuration - can be overridden with environment variables
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINTS = {

    general: `${BASE_URL}/api/test/general`,

    auth: `${BASE_URL}/api/test/auth`,

    sensitive: `${BASE_URL}/api/test/sensitive`,

    admin: `${BASE_URL}/api/test/admin`,
// Default test options
export const options = {
  scenarios: {
    normal_load: {

    executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
high_load: {

    executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '20s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '10s',
thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% of requests should fail
// Helper function to make requests with consistent settings
function makeRequest(url) {
  const headers = {

    'Content-Type': 'application/json',

    'X-Test-Client-Id': `k6-load-test-${__VU}-${__ITER}`,
const response = http.post(url, JSON.stringify({ timestamp: Date.now() }), { headers });
  
  // Record request duration
  requestDuration.add(response.timings.duration);
  
  // Check if we got rate limited (HTTP 429)
  const isRateLimited = response.status === 429;
  if (isRateLimited) {
    rateLimitedRequests.add(1);
    rateLimitedRate.add(1);
else {
    successfulRequests.add(1);
    successRate.add(1);
return { response, isRateLimited };
// Main test function
export default function() {
  // Select a random endpoint to test
  const endpoints = Object.values(ENDPOINTS);

    const randomEndpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];
  
  // Make the request
  const { response, isRateLimited } = makeRequest(randomEndpoint);
  
  // Check that we got a valid response (either success or rate limited)
  check(response, {
    'status is either 200 or 429': (r) => r.status === 200 || r.status === 429,
    'rate limited requests return correct headers': (r) => {
      if (r.status === 429) {

    return r.headers['Retry-After'] !== undefined;
return true;
// Sleep between requests to simulate real user behavior
  // Add some randomness to avoid synchronized bursts
  sleep(randomIntBetween(0.1, 1));
// Summary function to output test results
export function handleSummary(data) {
  const summary = {
    testRunDuration: data.time,
    successfulRequests: successfulRequests.values,
    rateLimitedRequests: rateLimitedRequests.values,

    successRatePercentage: successRate.value * 100,

    rateLimitedRatePercentage: rateLimitedRate.value * 100,
    requestDurationAvg: requestDuration.values.avg,
    requestDurationMax: requestDuration.values.max,
    requestDurationP95: requestDuration.values.p(95),
return {
    'stdout': JSON.stringify(summary),

    'load-test-results/redis-rate-limiting-summary.json': JSON.stringify(data, null, 2),

    'load-test-results/redis-rate-limiting-custom.json': JSON.stringify(summary, null, 2),
