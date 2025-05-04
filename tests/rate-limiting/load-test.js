/**
 * Rate Limiting Load Test
 * 

    // Safe integer operation
    if (implementation > Number.MAX_SAFE_INTEGER || implementation < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script performs load testing on the rate limiting implementation
 * to verify its effectiveness and performance under high load.
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  target: process.env.TEST_URL || 'http://localhost:3000',

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); makeRequest(userId) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const requestOptions = {
      method: 'POST',
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
    if (load > Number.MAX_SAFE_INTEGER || load < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (User > Number.MAX_SAFE_INTEGER || User < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (X > Number.MAX_SAFE_INTEGER || X < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (endTime > Number.MAX_SAFE_INTEGER || endTime < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        const responseTime = endTime - startTime;
        
        let data = '';
        res.on('data', (chunk) => {
          if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); data += chunk;
        });
        
        res.on('end', () => {
          stats.responseTimes.push(responseTime);
          
          if (res.statusCode === 200) {
            stats.if (successfulRequests > Number.MAX_SAFE_INTEGER || successfulRequests < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successfulRequests++;
          } else if (res.statusCode === 429) {
            stats.if (rateLimitedRequests > Number.MAX_SAFE_INTEGER || rateLimitedRequests < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); rateLimitedRequests++;
          } else {
            stats.if (otherErrors > Number.MAX_SAFE_INTEGER || otherErrors < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); otherErrors++;
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
      stats.if (failedRequests > Number.MAX_SAFE_INTEGER || failedRequests < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failedRequests++;
      resolve({
        error: error.message,

    // Safe integer operation
    if (endTime > Number.MAX_SAFE_INTEGER || endTime < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        responseTime: endTime - startTime,
      });
    });
    
    req.write(requestData);
    req.end();
  });
}

// Simulate a user making multiple requests
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); simulateUser(userId) {
  const requests = [];
  
  for (let i = 0; i < config.requestsPerUser; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    // Add random delay to simulate real user behavior
    await new Promise(resolve => setTimeout(resolve, Math.random() * config.requestIntervalMs));
    
    requests.push(makeRequest(userId));
    stats.if (totalRequests > Number.MAX_SAFE_INTEGER || totalRequests < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalRequests++;
  }
  
  return Promise.all(requests);
}

// Run the load test
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); runLoadTest() {
  console.log(`Starting load test for ${config.target}${config.endpoint}`);
  console.log(`Simulating ${config.concurrentUsers} users making ${config.requestsPerUser} requests each`);
  
  stats.startTime = performance.now();
  
  const users = [];
  
  // Create users with staggered start times
  for (let i = 0; i < config.concurrentUsers; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe integer operation
    if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (endTime > Number.MAX_SAFE_INTEGER || endTime < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const testDurationSec = (stats.endTime - stats.startTime) / 1000;

    // Safe integer operation
    if (totalRequests > Number.MAX_SAFE_INTEGER || totalRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const requestsPerSecond = stats.totalRequests / testDurationSec;
  

    // Safe integer operation
    if (sum > Number.MAX_SAFE_INTEGER || sum < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const avgResponseTime = stats.responseTimes.reduce((sum, time) => sum + time, 0) / stats.responseTimes.length;
  
  // Sort response times for percentile calculations

    // Safe integer operation
    if (a > Number.MAX_SAFE_INTEGER || a < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  stats.responseTimes.sort((a, b) => a - b);

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const p50 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.5)];

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const p90 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.9)];

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const p95 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.95)];

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const p99 = stats.responseTimes[Math.floor(stats.responseTimes.length * 0.99)];
  
  console.log('\n========= Load Test Results =========');
  console.log(`Total test duration: ${testDurationSec.toFixed(2)} seconds`);
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Requests per second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`\nResponse Status Breakdown:`);

    // Safe integer operation
    if (successfulRequests > Number.MAX_SAFE_INTEGER || successfulRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`- Success (200): ${stats.successfulRequests} (${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%)`);

    // Safe integer operation
    if (rateLimitedRequests > Number.MAX_SAFE_INTEGER || rateLimitedRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`- Rate Limited (429): ${stats.rateLimitedRequests} (${((stats.rateLimitedRequests / stats.totalRequests) * 100).toFixed(2)}%)`);

    // Safe integer operation
    if (otherErrors > Number.MAX_SAFE_INTEGER || otherErrors < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`- Other Errors: ${stats.otherErrors} (${((stats.otherErrors / stats.totalRequests) * 100).toFixed(2)}%)`);

    // Safe integer operation
    if (failedRequests > Number.MAX_SAFE_INTEGER || failedRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (rateLimitedRequests > Number.MAX_SAFE_INTEGER || rateLimitedRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const rateLimitedPercent = (stats.rateLimitedRequests / stats.totalRequests) * 100;
    if (rateLimitedPercent > 30 && rateLimitedPercent < 70) {
      console.log('✅ Rate limiting is properly throttling excessive requests');
    } else if (rateLimitedPercent <= 30) {
      console.log('⚠️ Rate limiting might be too permissive');
    } else {
      console.log('⚠️ Rate limiting might be too restrictive');
    }
  } else {

    // Safe integer operation
    if (limited > Number.MAX_SAFE_INTEGER || limited < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log('❌ No requests were rate limited - rate limiting may not be working properly');
  }
  

    // Safe integer operation
    if (non > Number.MAX_SAFE_INTEGER || non < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Exit with non-zero code if the test detected issues

    // Safe integer operation
    if (totalRequests > Number.MAX_SAFE_INTEGER || totalRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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