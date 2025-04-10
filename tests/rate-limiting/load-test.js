/**
 * Rate Limiting Load Test
 * 
 * This script performs load testing on the rate limiting implementation
 * to verify its effectiveness and performance under high load.
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  target: process.env.TEST_URL || 'http://localhost:3000',
  endpoint: '/api/auth/login',
  concurrentUsers: 50,
  requestsPerUser: 20,
  rampUpTimeMs: 5000,
  requestIntervalMs: 100,
  timeoutMs: 10000,
};

// Stats tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  otherErrors: 0,
  startTime: 0,
  endTime: 0,
  responseTimes: [],
};

// HTTP client based on URL protocol
const client = config.target.startsWith('https') ? https : http;

// Make a single request and return response
async function makeRequest(userId) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': `load-test-user-${userId}`,
      },
      timeout: config.timeoutMs,
    };
    
    const requestData = JSON.stringify({
      email: `test-${userId}@example.com`,
      password: 'Password123!',
    });
    
    const req = client.request(
      `${config.target}${config.endpoint}`, 
      requestOptions,
      (res) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          stats.responseTimes.push(responseTime);
          
          if (res.statusCode === 200) {
            stats.successfulRequests++;
          } else if (res.statusCode === 429) {
            stats.rateLimitedRequests++;
          } else {
            stats.otherErrors++;
          }
          
          resolve({
            statusCode: res.statusCode,
            data,
            responseTime,
            headers: res.headers,
          });
        });
      }
    );
    
    req.on('error', (error) => {
      const endTime = performance.now();
      stats.failedRequests++;
      resolve({
        error: error.message,
        responseTime: endTime - startTime,
      });
    });
    
    req.write(requestData);
    req.end();
  });
}

// Simulate a user making multiple requests
async function simulateUser(userId) {
  const requests = [];
  
  for (let i = 0; i < config.requestsPerUser; i++) {
    // Add random delay to simulate real user behavior
    await new Promise(resolve => setTimeout(resolve, Math.random() * config.requestIntervalMs));
    
    requests.push(makeRequest(userId));
    stats.totalRequests++;
  }
  
  return Promise.all(requests);
}

// Run the load test
async function runLoadTest() {
  console.log(`Starting load test for ${config.target}${config.endpoint}`);
  console.log(`Simulating ${config.concurrentUsers} users making ${config.requestsPerUser} requests each`);
  
  stats.startTime = performance.now();
  
  const users = [];
  
  // Create users with staggered start times
  for (let i = 0; i < config.concurrentUsers; i++) {
    const delay = (i / config.concurrentUsers) * config.rampUpTimeMs;
    
    users.push(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(simulateUser(i));
        }, delay);
      })
    );
  }
  
  await Promise.all(users);
  
  stats.endTime = performance.now();
  
  // Calculate and display statistics
  const testDurationSec = (stats.endTime - stats.startTime) / 1000;
  const requestsPerSecond = stats.totalRequests / testDurationSec;
  
  const avgResponseTime = stats.responseTimes.reduce((sum, time) => sum + time, 0) / stats.responseTimes.length;
  
  // Sort response times for percentile calculations
  stats.responseTimes.sort((a, b) => a - b);
  const p50 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.5)];
  const p90 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.9)];
  const p95 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.95)];
  const p99 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.99)];
  
  console.log('\n========= Load Test Results =========');
  console.log(`Total test duration: ${testDurationSec.toFixed(2)} seconds`);
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Requests per second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`\nResponse Status Breakdown:`);
  console.log(`- Success (200): ${stats.successfulRequests} (${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`- Rate Limited (429): ${stats.rateLimitedRequests} (${((stats.rateLimitedRequests / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`- Other Errors: ${stats.otherErrors} (${((stats.otherErrors / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`- Failed Requests: ${stats.failedRequests} (${((stats.failedRequests / stats.totalRequests) * 100).toFixed(2)}%)`);
  
  console.log(`\nResponse Time Statistics:`);
  console.log(`- Average: ${avgResponseTime.toFixed(2)} ms`);
  console.log(`- 50th percentile (p50): ${p50.toFixed(2)} ms`);
  console.log(`- 90th percentile (p90): ${p90.toFixed(2)} ms`);
  console.log(`- 95th percentile (p95): ${p95.toFixed(2)} ms`);
  console.log(`- 99th percentile (p99): ${p99.toFixed(2)} ms`);
  
  console.log('\nRate Limiting Effectiveness:');
  
  // Determine if rate limiting is working effectively
  if (stats.rateLimitedRequests > 0) {
    console.log('✅ Rate limiting is active and working');
    
    // Check if rate limiting is properly limiting requests
    const rateLimitedPercent = (stats.rateLimitedRequests / stats.totalRequests) * 100;
    if (rateLimitedPercent > 30 && rateLimitedPercent < 70) {
      console.log('✅ Rate limiting is properly throttling excessive requests');
    } else if (rateLimitedPercent <= 30) {
      console.log('⚠️ Rate limiting might be too permissive');
    } else {
      console.log('⚠️ Rate limiting might be too restrictive');
    }
  } else {
    console.log('❌ No requests were rate limited - rate limiting may not be working properly');
  }
  
  // Exit with non-zero code if the test detected issues
  if (stats.failedRequests > stats.totalRequests * 0.1) {
    console.log('\n❌ Load test failed: Too many failed requests');
    process.exit(1);
  }
  
  if (stats.rateLimitedRequests === 0) {
    console.log('\n❌ Load test failed: Rate limiting not detected');
    process.exit(1);
  }
  
  console.log('\n✅ Load test completed successfully');
  process.exit(0);
}

// Run the test
runLoadTest().catch(error => {
  console.error('Load test error:', error);
  process.exit(1);
}); 