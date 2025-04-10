#!/usr/bin/env node

/**
 * Rate Limiting Security Audit Script
 * 
 * This script performs a comprehensive security audit of the
 * rate limiting implementation in the Vibewell application.
 * 
 * It tests for:
 * 1. Rate limit effectiveness
 * 2. Bypass attempts
 * 3. Header spoofing vulnerabilities
 * 4. Performance under load
 * 5. Reset time accuracy
 * 
 * Usage:
 *   node scripts/security-audit-rate-limiting.js
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');
const { promisify } = require('util');
const { exec } = require('child_process');
const execPromise = promisify(exec);

// Configuration
const config = {
  baseUrl: process.env.API_URL || 'http://localhost:3000/api',
  testEndpoints: [
    '/test/general',
    '/test/auth',
    '/test/sensitive',
    '/test/admin'
  ],
  iterations: 150,                // Number of requests to send
  concurrency: 10,                // Concurrent requests
  bypassAttemptMethods: 5,        // Number of different bypass methods to test
  headerSpoofingTests: true,      // Test header spoofing
  performanceTest: true,          // Run performance test
  testResetAccuracy: true,        // Test reset time accuracy
  verbose: process.argv.includes('--verbose'),
};

// Colors for console output
const color = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Logger
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  let prefix = '';
  let colorCode = color.reset;
  
  switch (level) {
    case 'success':
      prefix = '✅ ';
      colorCode = color.green;
      break;
    case 'error':
      prefix = '❌ ';
      colorCode = color.red;
      break;
    case 'warn':
      prefix = '⚠️ ';
      colorCode = color.yellow;
      break;
    case 'info':
      prefix = 'ℹ️ ';
      colorCode = color.blue;
      break;
    case 'debug':
      if (!config.verbose) return;
      prefix = '🔍 ';
      colorCode = color.cyan;
      break;
  }
  
  console.log(`${colorCode}${prefix}${message}${color.reset}`);
}

// Send HTTP request with optional headers and options
async function sendRequest(endpoint, options = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const defaultOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Vibewell-Security-Audit-Script',
    },
    timeout: 10000, // 10 seconds
  };
  
  const requestOptions = { ...defaultOptions, ...options };
  
  // Determine HTTP or HTTPS
  const client = url.startsWith('https') ? https : http;
  
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    // Create request object
    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      // Collect response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Resolve on end
      res.on('end', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        try {
          // Parse JSON if possible
          const jsonData = data.length > 0 ? JSON.parse(data) : {};
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            duration,
            raw: data,
          });
        } catch (error) {
          // Return raw data if JSON parsing fails
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: {},
            duration,
            raw: data,
            parseError: error.message,
          });
        }
      });
    });
    
    // Handle errors
    req.on('error', (error) => {
      reject(error);
    });
    
    // Add request body if provided
    if (requestOptions.body) {
      req.write(JSON.stringify(requestOptions.body));
    }
    
    req.end();
  });
}

// Generate X IP addresses for testing
function generateIpAddresses(count) {
  const ips = [];
  for (let i = 0; i < count; i++) {
    const ip = `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    ips.push(ip);
  }
  return ips;
}

// Test basic rate limiting functionality
async function testRateLimiting() {
  log('Testing basic rate limiting functionality...', 'info');
  const results = {};
  
  for (const endpoint of config.testEndpoints) {
    log(`Testing endpoint: ${endpoint}`, 'debug');
    
    const responses = [];
    let rateLimitTriggered = false;
    let rateLimitStatusCode = null;
    let rateLimitHeaders = null;
    let requestsBeforeLimit = 0;
    
    // Send multiple requests
    for (let i = 0; i < config.iterations; i++) {
      try {
        const response = await sendRequest(endpoint, {
          body: { timestamp: Date.now(), iteration: i }
        });
        
        responses.push(response);
        
        // Check for rate limiting
        if (response.statusCode === 429) {
          if (!rateLimitTriggered) {
            rateLimitTriggered = true;
            rateLimitStatusCode = response.statusCode;
            rateLimitHeaders = response.headers;
            requestsBeforeLimit = i;
          }
        }
        
        // Log progress for long-running tests
        if (i > 0 && i % 20 === 0) {
          log(`Made ${i}/${config.iterations} requests to ${endpoint}`, 'debug');
        }
      } catch (error) {
        log(`Error making request to ${endpoint}: ${error.message}`, 'error');
      }
    }
    
    // Analyze results
    const successResponses = responses.filter(r => r.statusCode === 200);
    const rateLimitResponses = responses.filter(r => r.statusCode === 429);
    
    results[endpoint] = {
      totalRequests: responses.length,
      successfulRequests: successResponses.length,
      rateLimitedRequests: rateLimitResponses.length,
      rateLimitTriggered,
      requestsBeforeLimit,
      rateLimitHeaders: rateLimitHeaders || {},
      averageResponseTime: responses.reduce((sum, r) => sum + r.duration, 0) / responses.length,
    };
    
    if (rateLimitTriggered) {
      log(`Rate limiting triggered after ${requestsBeforeLimit} requests to ${endpoint}`, 'success');
      
      // Check for required rate limit headers
      const hasRetryAfter = rateLimitHeaders && 'retry-after' in rateLimitHeaders;
      const hasRateLimitRemaining = rateLimitHeaders && 'x-ratelimit-remaining' in rateLimitHeaders;
      
      if (hasRetryAfter && hasRateLimitRemaining) {
        log(`Rate limit headers present and correct`, 'success');
      } else {
        log(`Missing recommended rate limit headers`, 'warn');
      }
    } else {
      log(`Rate limiting not triggered after ${config.iterations} requests to ${endpoint}`, 'error');
    }
  }
  
  return results;
}

// Test for bypass vulnerabilities
async function testBypassVulnerabilities() {
  log('Testing rate limit bypass vulnerabilities...', 'info');
  
  const bypassTests = [
    { 
      name: 'IP spoofing via X-Forwarded-For',
      headers: { 'X-Forwarded-For': generateIpAddresses(1)[0] },
    },
    { 
      name: 'IP spoofing via multiple XFF entries',
      headers: { 'X-Forwarded-For': `${generateIpAddresses(5).join(', ')}, 127.0.0.1` },
    },
    { 
      name: 'IP spoofing via X-Real-IP',
      headers: { 'X-Real-IP': generateIpAddresses(1)[0] },
    },
    { 
      name: 'IP spoofing via CF-Connecting-IP',
      headers: { 'CF-Connecting-IP': generateIpAddresses(1)[0] },
    },
    { 
      name: 'Case sensitivity in header names',
      headers: { 'x-forwarded-for': generateIpAddresses(1)[0] },
    },
  ];
  
  const results = {};
  
  // Use the most restrictive endpoint for bypass testing
  const testEndpoint = '/test/auth';
  
  for (const test of bypassTests) {
    log(`Testing bypass method: ${test.name}`, 'debug');
    
    const responses = [];
    let rateLimitTriggered = false;
    let requestsBeforeLimit = 0;
    
    // Send multiple requests with bypass headers
    for (let i = 0; i < config.iterations; i++) {
      try {
        const response = await sendRequest(testEndpoint, {
          body: { timestamp: Date.now(), iteration: i },
          headers: {
            ...test.headers,
          }
        });
        
        responses.push(response);
        
        // Check for rate limiting
        if (response.statusCode === 429) {
          if (!rateLimitTriggered) {
            rateLimitTriggered = true;
            requestsBeforeLimit = i;
          }
        }
      } catch (error) {
        log(`Error during bypass test "${test.name}": ${error.message}`, 'error');
      }
    }
    
    // Calculate success rate for this bypass method
    const successResponses = responses.filter(r => r.statusCode === 200);
    const rateLimitResponses = responses.filter(r => r.statusCode === 429);
    
    results[test.name] = {
      totalRequests: responses.length,
      successfulRequests: successResponses.length,
      rateLimitedRequests: rateLimitResponses.length,
      rateLimitTriggered,
      requestsBeforeLimit,
      bypassSuccessful: !rateLimitTriggered || (rateLimitTriggered && requestsBeforeLimit > 10),
    };
    
    if (results[test.name].bypassSuccessful) {
      log(`⚠️ Potential vulnerability: "${test.name}" may allow bypass`, 'error');
    } else {
      log(`✅ Bypass test "${test.name}" failed (which is good)`, 'success');
    }
  }
  
  return results;
}

// Test concurrent requests
async function testConcurrentRequests() {
  log('Testing rate limiting under concurrent load...', 'info');
  
  const testEndpoint = '/test/auth';
  const concurrentBatches = 5;
  const requestsPerBatch = 20;
  
  const batchResults = [];
  
  for (let batch = 0; batch < concurrentBatches; batch++) {
    log(`Running concurrent batch ${batch + 1}/${concurrentBatches}`, 'debug');
    
    // Create an array of promises for concurrent requests
    const requestPromises = [];
    
    for (let i = 0; i < requestsPerBatch; i++) {
      requestPromises.push(
        sendRequest(testEndpoint, {
          body: { timestamp: Date.now(), batch, iteration: i }
        })
      );
    }
    
    // Wait for all concurrent requests to complete
    const responses = await Promise.all(requestPromises);
    
    // Count results
    const successResponses = responses.filter(r => r.statusCode === 200);
    const rateLimitResponses = responses.filter(r => r.statusCode === 429);
    
    batchResults.push({
      totalRequests: responses.length,
      successfulRequests: successResponses.length,
      rateLimitedRequests: rateLimitResponses.length,
      averageResponseTime: responses.reduce((sum, r) => sum + r.duration, 0) / responses.length,
    });
    
    // Give the rate limiter a moment to recover between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Analyze concurrent test results
  const totalRequests = batchResults.reduce((sum, batch) => sum + batch.totalRequests, 0);
  const successfulRequests = batchResults.reduce((sum, batch) => sum + batch.successfulRequests, 0);
  const rateLimitedRequests = batchResults.reduce((sum, batch) => sum + batch.rateLimitedRequests, 0);
  
  if (rateLimitedRequests > 0) {
    log('Rate limiting worked correctly under concurrent load', 'success');
  } else {
    log('⚠️ No rate limiting triggered under concurrent load - check if this is expected', 'warn');
  }
  
  return {
    batches: batchResults,
    totalRequests,
    successfulRequests,
    rateLimitedRequests,
    averageSuccessPerBatch: successfulRequests / concurrentBatches,
  };
}

// Test reset time accuracy
async function testResetTimeAccuracy() {
  log('Testing rate limit reset time accuracy...', 'info');
  
  const testEndpoint = '/test/auth';
  let retryAfterValue = null;
  let rateLimitResetTimestamp = null;
  
  // Step 1: Trigger rate limiting
  log('Triggering rate limiting...', 'debug');
  
  let rateLimited = false;
  let responses = [];
  
  // Keep making requests until rate limited
  for (let i = 0; i < 50 && !rateLimited; i++) {
    const response = await sendRequest(testEndpoint);
    responses.push(response);
    
    if (response.statusCode === 429) {
      rateLimited = true;
      
      // Get retry-after header
      if (response.headers['retry-after']) {
        retryAfterValue = parseInt(response.headers['retry-after'], 10);
        log(`Rate limited with Retry-After: ${retryAfterValue} seconds`, 'debug');
      }
      
      // Get x-ratelimit-reset header if available
      if (response.headers['x-ratelimit-reset']) {
        rateLimitResetTimestamp = parseInt(response.headers['x-ratelimit-reset'], 10);
        log(`Rate limit reset timestamp: ${new Date(rateLimitResetTimestamp * 1000).toISOString()}`, 'debug');
      }
    }
  }
  
  if (!rateLimited) {
    log('Could not trigger rate limiting for reset time test', 'error');
    return {
      success: false,
      reason: 'Could not trigger rate limiting',
    };
  }
  
  if (!retryAfterValue) {
    log('No Retry-After header found, cannot test reset accuracy', 'warn');
    return {
      success: false,
      reason: 'No Retry-After header',
    };
  }
  
  // Step 2: Wait until just before the reset time
  const waitTime = Math.max(1, retryAfterValue - 1); // Wait for reset time minus 1 second
  log(`Waiting for ${waitTime} seconds before checking reset...`, 'debug');
  await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  
  // Step 3: Try a request just before reset should happen
  const beforeResetResponse = await sendRequest(testEndpoint);
  
  // Step 4: Wait a bit more to ensure we're past the reset time
  log('Waiting 2 more seconds to ensure reset time has passed...', 'debug');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 5: Try a request after reset should have happened
  const afterResetResponse = await sendRequest(testEndpoint);
  
  // Analyze results
  const resetTimeAccurate = (
    beforeResetResponse.statusCode === 429 && 
    afterResetResponse.statusCode === 200
  );
  
  if (resetTimeAccurate) {
    log('Reset time is accurate', 'success');
    return {
      success: true,
      retryAfterValue,
      beforeResetBlocked: beforeResetResponse.statusCode === 429,
      afterResetAllowed: afterResetResponse.statusCode === 200,
      actualResetTime: retryAfterValue,
    };
  } else {
    log('Reset time is inaccurate', 'warn');
    return {
      success: false,
      retryAfterValue,
      beforeResetBlocked: beforeResetResponse.statusCode === 429,
      afterResetAllowed: afterResetResponse.statusCode === 200,
    };
  }
}

// Generate security audit report
function generateReport(results) {
  log(`\n${color.bold}${color.cyan}====== RATE LIMITING SECURITY AUDIT REPORT ======${color.reset}`, 'info');
  
  // Overall assessment
  const overallScore = calculateOverallScore(results);
  const scoreColor = overallScore >= 80 ? color.green : (overallScore >= 60 ? color.yellow : color.red);
  
  log(`${color.bold}Overall Security Score: ${scoreColor}${overallScore}/100${color.reset}\n`, 'info');
  
  // Basic rate limiting
  log(`${color.bold}${color.blue}1. Basic Rate Limiting${color.reset}`, 'info');
  
  for (const [endpoint, result] of Object.entries(results.basicRateLimiting)) {
    const rateLimitPercent = result.rateLimitedRequests / result.totalRequests * 100;
    log(`Endpoint ${endpoint}:`, 'info');
    log(`  - Rate limiting triggered: ${result.rateLimitTriggered ? '✅' : '❌'}`, 'info');
    log(`  - Requests before limit: ${result.requestsBeforeLimit}`, 'info');
    log(`  - Rate limited requests: ${result.rateLimitedRequests}/${result.totalRequests} (${rateLimitPercent.toFixed(1)}%)`, 'info');
    
    // Check for headers
    const hasRetryAfter = result.rateLimitHeaders && 'retry-after' in result.rateLimitHeaders;
    const hasRateLimitRemaining = result.rateLimitHeaders && 'x-ratelimit-remaining' in result.rateLimitHeaders;
    
    log(`  - Has Retry-After header: ${hasRetryAfter ? '✅' : '❌'}`, 'info');
    log(`  - Has X-RateLimit-Remaining header: ${hasRateLimitRemaining ? '✅' : '❌'}`, 'info');
  }
  
  // Bypass vulnerabilities
  log(`\n${color.bold}${color.blue}2. Bypass Vulnerability Tests${color.reset}`, 'info');
  
  let bypassVulnerabilitiesFound = 0;
  
  for (const [testName, result] of Object.entries(results.bypassTests)) {
    if (result.bypassSuccessful) {
      log(`❌ VULNERABLE: ${testName}`, 'error');
      log(`  - Requests before limit: ${result.requestsBeforeLimit || 'N/A'}`, 'info');
      bypassVulnerabilitiesFound++;
    } else {
      log(`✅ SECURE: ${testName}`, 'success');
    }
  }
  
  // Concurrent requests
  log(`\n${color.bold}${color.blue}3. Concurrent Request Handling${color.reset}`, 'info');
  
  const concurrentResults = results.concurrentRequests;
  log(`Made ${concurrentResults.totalRequests} concurrent requests in ${concurrentResults.batches.length} batches`, 'info');
  log(`Rate limited ${concurrentResults.rateLimitedRequests}/${concurrentResults.totalRequests} requests`, 'info');
  
  const concurrentConsistency = concurrentResults.rateLimitedRequests > 0 ? '✅' : '❌';
  log(`Consistent rate limiting under load: ${concurrentConsistency}`, 'info');
  
  // Reset time accuracy
  log(`\n${color.bold}${color.blue}4. Reset Time Accuracy${color.reset}`, 'info');
  
  if (results.resetTimeAccuracy) {
    const resetAccuracy = results.resetTimeAccuracy.success ? '✅' : '❌';
    log(`Reset time accuracy: ${resetAccuracy}`, 'info');
    log(`Retry-After value: ${results.resetTimeAccuracy.retryAfterValue} seconds`, 'info');
    
    if (results.resetTimeAccuracy.beforeResetBlocked) {
      log(`Request before reset was correctly blocked`, 'success');
    } else {
      log(`Request before reset was incorrectly allowed`, 'error');
    }
    
    if (results.resetTimeAccuracy.afterResetAllowed) {
      log(`Request after reset was correctly allowed`, 'success');
    } else {
      log(`Request after reset was incorrectly blocked`, 'error');
    }
  } else {
    log(`Reset time accuracy test was not performed`, 'info');
  }
  
  // Recommendations
  log(`\n${color.bold}${color.blue}5. Recommendations${color.reset}`, 'info');
  
  // Generate recommendations based on test results
  const recommendations = [];
  
  if (bypassVulnerabilitiesFound > 0) {
    recommendations.push('❗ Fix IP spoofing vulnerabilities by ensuring consistent handling of proxy headers');
  }
  
  // Check for missing headers
  let missingHeadersFound = false;
  for (const [endpoint, result] of Object.entries(results.basicRateLimiting)) {
    const hasRetryAfter = result.rateLimitHeaders && 'retry-after' in result.rateLimitHeaders;
    const hasRateLimitRemaining = result.rateLimitHeaders && 'x-ratelimit-remaining' in result.rateLimitHeaders;
    
    if (!hasRetryAfter || !hasRateLimitRemaining) {
      missingHeadersFound = true;
    }
  }
  
  if (missingHeadersFound) {
    recommendations.push('⚠️ Add all recommended rate limiting headers (Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining)');
  }
  
  if (results.resetTimeAccuracy && !results.resetTimeAccuracy.success) {
    recommendations.push('⚠️ Fix rate limit reset timing to match the advertised Retry-After value');
  }
  
  if (concurrentResults.rateLimitedRequests === 0) {
    recommendations.push('⚠️ Improve rate limiting under concurrent load');
  }
  
  // Add default recommendations
  recommendations.push('✅ Consider implementing more advanced rate limiting strategies (token bucket, sliding window)');
  recommendations.push('✅ Add monitoring and alerting for rate limit events');
  
  // Print recommendations
  if (recommendations.length > 0) {
    for (const recommendation of recommendations) {
      log(`${recommendation}`, 'info');
    }
  } else {
    log('No specific recommendations, all tests passed!', 'success');
  }
}

// Calculate overall security score
function calculateOverallScore(results) {
  let score = 100;
  
  // Check basic rate limiting
  for (const [endpoint, result] of Object.entries(results.basicRateLimiting)) {
    if (!result.rateLimitTriggered) {
      score -= 20; // Severe issue: rate limiting not working
    }
    
    const hasRetryAfter = result.rateLimitHeaders && 'retry-after' in result.rateLimitHeaders;
    const hasRateLimitRemaining = result.rateLimitHeaders && 'x-ratelimit-remaining' in result.rateLimitHeaders;
    
    if (!hasRetryAfter) score -= 5;
    if (!hasRateLimitRemaining) score -= 5;
  }
  
  // Check bypass vulnerabilities
  for (const [testName, result] of Object.entries(results.bypassTests)) {
    if (result.bypassSuccessful) {
      score -= 10; // Each bypass vulnerability is serious
    }
  }
  
  // Check concurrent requests
  if (results.concurrentRequests.rateLimitedRequests === 0) {
    score -= 15; // No rate limiting under load
  }
  
  // Check reset time accuracy
  if (results.resetTimeAccuracy && !results.resetTimeAccuracy.success) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Main function
async function main() {
  try {
    log(`Starting rate limiting security audit...`, 'info');
    log(`Base URL: ${config.baseUrl}`, 'debug');
    log(`Testing endpoints: ${config.testEndpoints.join(', ')}`, 'debug');
    
    // Basic rate limiting test
    const basicRateLimiting = await testRateLimiting();
    
    // Bypass vulnerabilities test
    const bypassTests = await testBypassVulnerabilities();
    
    // Concurrent requests test
    const concurrentRequests = await testConcurrentRequests();
    
    // Reset time accuracy test
    let resetTimeAccuracy = null;
    if (config.testResetAccuracy) {
      resetTimeAccuracy = await testResetTimeAccuracy();
    }
    
    // Collect all results
    const results = {
      basicRateLimiting,
      bypassTests,
      concurrentRequests,
      resetTimeAccuracy,
    };
    
    // Generate report
    generateReport(results);
    
    log(`Security audit completed`, 'success');
  } catch (error) {
    log(`Error during security audit: ${error.message}`, 'error');
    console.error(error);
  }
}

// Run the audit
main(); 