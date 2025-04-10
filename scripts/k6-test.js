import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const rateLimitedRate = new Rate('rate_limited_requests');
const successRate = new Rate('successful_requests');
const authRequestTrend = new Trend('auth_request_duration');
const sensitiveRequestTrend = new Trend('sensitive_request_duration');
const generalRequestTrend = new Trend('general_request_duration');
const adminRequestTrend = new Trend('admin_request_duration');

// Configuration from environment variables
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';
const SCENARIO = __ENV.SCENARIO || 'all';
const REDIS = __ENV.REDIS === 'true';
const DEBUG = __ENV.DEBUG === 'true';

// Test users
const TEST_USERS = [
  { email: 'test1@example.com', password: 'Password123!' },
  { email: 'test2@example.com', password: 'Password123!' },
  { email: 'test3@example.com', password: 'Password123!' },
  { email: 'admin1@example.com', password: 'AdminPassword123!' },
];

// Test data for requests
const TEST_PAYMENT = {
  amount: 100,
  currency: 'USD',
  description: 'Test payment',
  cardToken: 'tok_visa',
};

export const options = {
  thresholds: {
    'successful_requests': ['rate>0.7'], // At least 70% of requests should succeed
    'http_req_duration': ['p(95)<1500'], // 95% of requests should be below 1.5s
    'http_req_failed': ['rate<0.3'],     // Less than 30% of requests should fail
  },
  // These will be overridden by CLI parameters
  vus: 10,
  duration: '30s',
};

// Helper function to log with DEBUG control
function debugLog(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

// Main setup function
export function setup() {
  const redisMode = REDIS ? 'Redis' : 'In-memory';
  console.log(`Starting load test with ${redisMode} rate limiting`);
  console.log(`Testing scenario: ${SCENARIO}`);
  console.log(`Target API: ${BASE_URL}`);
  
  return {
    tokens: [],
    rateLimited: 0,
    startTime: new Date().toISOString(),
  };
}

// Test for general API endpoints
function testGeneralEndpoints(authToken) {
  group('General API Endpoints', () => {
    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    // Test public endpoints (no auth required)
    const publicEndpoints = [
      `${BASE_URL}/health`,
      `${BASE_URL}/info`,
    ];
    
    for (const url of publicEndpoints) {
      const response = checkRateLimiting(() => {
        return http.get(url, { headers });
      }, generalRequestTrend);
      
      check(response, {
        'status is 200': (r) => r.status === 200,
        'response has valid JSON': (r) => {
          try {
            JSON.parse(r.body);
            return true;
          } catch (e) {
            return false;
          }
        },
      });
    }
    
    // Test protected endpoints (auth required)
    if (authToken) {
      const protectedEndpoints = [
        `${BASE_URL}/user/profile`,
        `${BASE_URL}/content?limit=10`,
      ];
      
      for (const url of protectedEndpoints) {
        const response = checkRateLimiting(() => {
          return http.get(url, { headers });
        }, generalRequestTrend);
        
        check(response, {
          'status is 200 for protected endpoint': (r) => r.status === 200,
        });
      }
    }
    
    sleep(0.5);
  });
}

// Test for authentication endpoints
function testAuthEndpoints() {
  group('Authentication Endpoints', () => {
    // Test login with random credentials (will likely fail but good for testing rate limiting)
    const randomEmail = `user-${randomString(8)}@example.com`;
    const randomPassword = `pw-${randomString(8)}`;
    
    const loginResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email: randomEmail,
        password: randomPassword,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }, authRequestTrend);
    
    // Sometimes use real test user credentials to get successful auth
    if (Math.random() > 0.7) {
      const testUser = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
      
      const validLoginResponse = checkRateLimiting(() => {
        return http.post(`${BASE_URL}/auth/login`, JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }, authRequestTrend);
      
      check(validLoginResponse, {
        'successful login returns 200': (r) => r.status === 200,
        'login response has token': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.token !== undefined;
          } catch (e) {
            return false;
          }
        },
      });
      
      // Test token refresh if login was successful
      if (validLoginResponse.status === 200) {
        try {
          const body = JSON.parse(validLoginResponse.body);
          if (body.token) {
            const refreshResponse = checkRateLimiting(() => {
              return http.post(`${BASE_URL}/auth/refresh`, JSON.stringify({
                refreshToken: body.refreshToken,
              }), {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${body.token}`,
                },
              });
            }, authRequestTrend);
            
            check(refreshResponse, {
              'refresh token returns 200': (r) => r.status === 200,
            });
          }
        } catch (e) {
          debugLog('Error parsing login response:', e);
        }
      }
    }
    
    // Test registration (will likely be rate limited)
    const registerResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/auth/register`, JSON.stringify({
        email: `new-${randomString(8)}@example.com`,
        password: `NewPass${randomString(4)}!`,
        name: `Test User ${randomString(4)}`,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }, authRequestTrend);
    
    // Test forgot password
    const forgotResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/auth/forgot-password`, JSON.stringify({
        email: `forgot-${randomString(8)}@example.com`,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }, authRequestTrend);
    
    sleep(1);
  });
}

// Test for sensitive operations (payment, MFA)
function testSensitiveEndpoints(authToken) {
  if (!authToken) return; // Skip if no auth token
  
  group('Sensitive Operations', () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };
    
    // Test payment endpoint
    const paymentResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/payments`, JSON.stringify(TEST_PAYMENT), { headers });
    }, sensitiveRequestTrend);
    
    check(paymentResponse, {
      'payment request handled': (r) => r.status < 500, // Not checking for 200 as it might be rate limited
    });
    
    // Test MFA enrollment
    const mfaEnrollResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/auth/mfa/enroll`, JSON.stringify({
        method: 'totp',
      }), { headers });
    }, sensitiveRequestTrend);
    
    check(mfaEnrollResponse, {
      'MFA enrollment request handled': (r) => r.status < 500,
    });
    
    sleep(0.5);
    
    // Test MFA verification (with fake code)
    const mfaVerifyResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/auth/mfa/verify`, JSON.stringify({
        method: 'totp',
        code: `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0'),
      }), { headers });
    }, sensitiveRequestTrend);
    
    check(mfaVerifyResponse, {
      'MFA verification request handled': (r) => r.status < 500,
    });
    
    sleep(1);
  });
}

// Test for admin operations
function testAdminEndpoints(authToken) {
  if (!authToken) return; // Skip if no auth token
  
  group('Admin Operations', () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };
    
    // Try to access admin endpoints (these will likely be rejected for non-admin users)
    const adminEndpoints = [
      `${BASE_URL}/admin/users`,
      `${BASE_URL}/admin/settings`,
      `${BASE_URL}/admin/logs`,
    ];
    
    for (const url of adminEndpoints) {
      const response = checkRateLimiting(() => {
        return http.get(url, { headers });
      }, adminRequestTrend);
      
      // We're testing rate limiting, so we don't necessarily expect 200 responses
      check(response, {
        'admin request handled': (r) => r.status !== 0, // Just checking that we got a response
      });
    }
    
    // Try admin user creation (will likely be rejected for non-admin users)
    const createUserResponse = checkRateLimiting(() => {
      return http.post(`${BASE_URL}/admin/users`, JSON.stringify({
        email: `admin-created-${randomString(8)}@example.com`,
        password: `AdminCreated${randomString(4)}!`,
        name: `Admin Created User ${randomString(4)}`,
        role: 'user',
      }), { headers });
    }, adminRequestTrend);
    
    sleep(1);
  });
}

// Helper function to check for rate limiting and track metrics
function checkRateLimiting(requestFn, trendMetric) {
  const startTime = new Date();
  const response = requestFn();
  const duration = new Date() - startTime;
  
  if (trendMetric) {
    trendMetric.add(duration);
  }
  
  // Check if we got rate limited
  const rateLimited = response.status === 429 || 
                      (response.headers && response.headers['X-RateLimit-Remaining'] === '0');
  
  rateLimitedRate.add(rateLimited ? 1 : 0);
  successRate.add(response.status >= 200 && response.status < 300 ? 1 : 0);
  
  if (rateLimited) {
    debugLog(`Rate limited response: ${response.status} ${response.url}`);
    if (response.headers['Retry-After']) {
      debugLog(`Retry-After: ${response.headers['Retry-After']}`);
    }
  }
  
  return response;
}

// Main function that runs for each virtual user
export default function() {
  // Start with no token
  let authToken = null;
  
  // Try to login to get an auth token for some of the requests
  if (Math.random() > 0.3) { // 70% of the time try to log in
    const testUser = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
    
    const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginResponse.status === 200) {
      try {
        const body = JSON.parse(loginResponse.body);
        authToken = body.token;
        debugLog(`Successfully logged in as ${testUser.email}`);
      } catch (e) {
        debugLog('Failed to parse login response');
      }
    }
  }
  
  // Run the appropriate scenario(s)
  if (SCENARIO === 'all' || SCENARIO === 'general') {
    testGeneralEndpoints(authToken);
  }
  
  if (SCENARIO === 'all' || SCENARIO === 'auth') {
    testAuthEndpoints();
  }
  
  if (SCENARIO === 'all' || SCENARIO === 'sensitive') {
    testSensitiveEndpoints(authToken);
  }
  
  if (SCENARIO === 'all' || SCENARIO === 'admin') {
    testAdminEndpoints(authToken);
  }
  
  // Add some randomized sleep to make the test more realistic
  const randomSleep = Math.random() * 2 + 0.5; // 0.5 to 2.5 seconds
  sleep(randomSleep);
}

// Teardown function to report statistics
export function teardown(data) {
  const endTime = new Date().toISOString();
  
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`Test ran from ${data.startTime} to ${endTime}`);
  console.log(`Rate limiting mode: ${REDIS ? 'Redis' : 'In-memory'}`);
  console.log(`Scenario tested: ${SCENARIO}`);
  console.log('==================================\n');
}