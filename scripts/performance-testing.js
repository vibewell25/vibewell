#!/usr/bin/env node

/**
 * Performance Testing Script
 * 
 * This script performs load testing and performance benchmarking for the Vibewell application.
 * It tests API endpoints, critical functions, and measures response times under various load scenarios.
 * 
 * Usage:
 *   node scripts/performance-testing.js [--endpoint=<endpoint>] [--concurrent=<number>] [--duration=<seconds>]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const autocannon = require('autocannon');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const DEFAULT_URL = 'http://localhost:3000';
const DEFAULT_DURATION = 10; // seconds
const DEFAULT_CONNECTIONS = 10;
const TEST_ENDPOINTS = [
  '/',
  '/api/profiles',
  '/api/services',
  '/api/bookings',
  '/try-on',
  '/business/dashboard'
];

// Memory usage tracking
let memoryBaseline = process.memoryUsage();

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const endpoint = args.endpoint || null;
const connections = parseInt(args.concurrent || DEFAULT_CONNECTIONS, 10);
const duration = parseInt(args.duration || DEFAULT_DURATION, 10);

/**
 * Run the performance tests
 */
async function runTests() {
  console.log('🧪 Starting Performance Tests');
  
  // Ensure the dev server is running
  await ensureServerRunning();
  
  // Initialize results object
  const results = {
    systemInfo: await getSystemInfo(),
    endpoints: {},
    summary: {
      totalRequests: 0,
      avgLatency: 0,
      p95Latency: 0,
      maxRps: 0
    }
  };
  
  try {
    if (endpoint) {
      // Test specific endpoint if provided
      console.log(`\n📊 Testing endpoint: ${endpoint}`);
      const endpointResult = await testEndpoint(endpoint, connections, duration);
      results.endpoints[endpoint] = endpointResult;
      Object.assign(results.summary, calculateSummary([endpointResult]));
    } else {
      // Test all endpoints
      for (const endpoint of TEST_ENDPOINTS) {
        console.log(`\n📊 Testing endpoint: ${endpoint}`);
        const endpointResult = await testEndpoint(endpoint, connections, duration);
        results.endpoints[endpoint] = endpointResult;
      }
      
      // Calculate overall summary
      Object.assign(results.summary, calculateSummary(Object.values(results.endpoints)));
    }
    
    // Generate report
    generateReport(results);
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
  
  console.log('\n✅ Performance tests completed!');
}

/**
 * Ensure the development server is running
 */
async function ensureServerRunning() {
  console.log('🔍 Checking if development server is running...');
  
  try {
    // Try to connect to the server
    await new Promise((resolve, reject) => {
      const req = http.get(`${DEFAULT_URL}/api/health`, res => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Server returned status: ${res.statusCode}`));
        }
        res.resume(); // Consume response data to free up memory
      });
      
      req.on('error', err => {
        reject(err);
      });
      
      // Set timeout
      req.setTimeout(1000, () => {
        req.destroy();
        reject(new Error('Connection timeout'));
      });
    });
    
    console.log('✅ Server is already running.');
  } catch (error) {
    console.log('🚀 Starting development server...');
    
    // Start the server in a separate process
    const serverProcess = require('child_process').spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true
    });
    
    // Wait for server to start
    await new Promise(resolve => {
      let output = '';
      
      serverProcess.stdout.on('data', data => {
        output += data.toString();
        
        // Check if server is ready
        if (output.includes('ready') || output.includes('started')) {
          console.log('✅ Development server started.');
          resolve();
        }
      });
      
      // Set a timeout in case the server doesn't start
      setTimeout(() => {
        console.log('⚠️ Timed out waiting for server to start. Continuing anyway.');
        resolve();
      }, 20000);
    });
    
    // Wait a bit more to ensure the server is fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

/**
 * Test a specific endpoint
 */
async function testEndpoint(endpoint, connections, duration) {
  const url = `${DEFAULT_URL}${endpoint}`;
  
  const result = await new Promise((resolve) => {
    autocannon({
      url,
      connections,
      duration,
      headers: {
        'Accept': 'application/json'
      },
      requests: [
        {
          method: 'GET',
          path: endpoint
        }
      ]
    }, (err, result) => {
      if (err) {
        console.error('Error during load testing:', err);
      }
      resolve(result);
    });
  });
  
  // Add memory usage delta
  const currentMemory = process.memoryUsage();
  const memoryDelta = {
    rss: currentMemory.rss - memoryBaseline.rss,
    heapTotal: currentMemory.heapTotal - memoryBaseline.heapTotal,
    heapUsed: currentMemory.heapUsed - memoryBaseline.heapUsed,
    external: currentMemory.external - memoryBaseline.external
  };
  
  return {
    ...result,
    memoryDelta
  };
}

/**
 * Calculate summary metrics from all test results
 */
function calculateSummary(results) {
  if (!results.length) return {};
  
  const totalRequests = results.reduce((sum, r) => sum + r.requests.total, 0);
  
  // Calculate weighted averages based on number of requests
  const weightedLatencySum = results.reduce((sum, r) => sum + (r.latency.average * r.requests.total), 0);
  const weightedP95Sum = results.reduce((sum, r) => sum + (r.latency.p95 * r.requests.total), 0);
  
  const avgLatency = weightedLatencySum / totalRequests;
  const p95Latency = weightedP95Sum / totalRequests;
  const maxRps = Math.max(...results.map(r => r.requests.average));
  
  return {
    totalRequests,
    avgLatency,
    p95Latency,
    maxRps
  };
}

/**
 * Get system information for the report
 */
async function getSystemInfo() {
  try {
    const { stdout: nodeVersion } = await exec('node --version');
    const { stdout: npmVersion } = await exec('npm --version');
    const { stdout: osInfo } = await exec('uname -a');
    
    return {
      node: nodeVersion.trim(),
      npm: npmVersion.trim(),
      os: osInfo.trim(),
      cpu: {
        cores: require('os').cpus().length,
        model: require('os').cpus()[0].model
      },
      memory: {
        total: require('os').totalmem(),
        free: require('os').freemem()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return {
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate the performance test report
 */
function generateReport(results) {
  console.log('\n📊 Generating Performance Test Report');
  
  // Create report directory
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  const reportPath = path.join(
    reportDir, 
    `performance-test-${new Date().toISOString().slice(0, 10)}.json`
  );
  
  // Save full results to JSON file
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Full performance report saved to: ${reportPath}`);
  
  // Print summary to console
  console.log('\n📋 Performance Test Summary:');
  console.log('--------------------------------------------------');
  console.log(`Date: ${new Date().toLocaleString()}`);
  console.log(`System: ${results.systemInfo.os || 'Unknown'}`);
  console.log(`Node.js: ${results.systemInfo.node || 'Unknown'}`);
  console.log('--------------------------------------------------');
  console.log(`Total Requests: ${results.summary.totalRequests.toLocaleString()}`);
  console.log(`Avg Latency: ${results.summary.avgLatency.toFixed(2)} ms`);
  console.log(`P95 Latency: ${results.summary.p95Latency.toFixed(2)} ms`);
  console.log(`Max RPS: ${results.summary.maxRps.toFixed(2)}`);
  console.log('--------------------------------------------------');
  
  // Print endpoint results
  console.log('\nEndpoint Results:');
  for (const [endpoint, result] of Object.entries(results.endpoints)) {
    if (!result) continue;
    
    console.log(`\n${endpoint}:`);
    console.log(`  Requests/sec: ${result.requests.average.toFixed(2)}`);
    console.log(`  Latency (avg): ${result.latency.average.toFixed(2)} ms`);
    console.log(`  Latency (p95): ${result.latency.p95.toFixed(2)} ms`);
    console.log(`  Memory usage delta: ${formatBytes(result.memoryDelta.heapUsed)}`);
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  
  return (bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
}

// Start the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 