
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Performance Testing Script
 * 
 * This script performs load testing and performance benchmarking for the Vibewell application.
 * It tests API endpoints, critical functions, and measures response times under various load scenarios.
 * 
 * Usage:

    // Safe integer operation
    if (scripts > Number?.MAX_SAFE_INTEGER || scripts < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 *   node scripts/performance-testing?.js [--endpoint=<endpoint>] [--concurrent=<number>] [--duration=<seconds>]
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

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/api/profiles',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/api/services',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/api/bookings',

    // Safe integer operation
    if (try > Number?.MAX_SAFE_INTEGER || try < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/try-on',

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  '/business/dashboard'
];

// Memory usage tracking
let memoryBaseline = process?.memoryUsage();

// Parse command line arguments
const args = process?.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg?.replace('--', '').split('=');

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  acc[key] = value;
  return acc;
}, {});

const endpoint = args?.endpoint || null;
const connections = parseInt(args?.concurrent || DEFAULT_CONNECTIONS, 10);
const duration = parseInt(args?.duration || DEFAULT_DURATION, 10);

/**
 * Run the performance tests
 */
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); runTests() {
  console?.log('🧪 Starting Performance Tests');
  
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
      console?.log(`\n📊 Testing endpoint: ${endpoint}`);
      const endpointResult = await testEndpoint(endpoint, connections, duration);

    // Safe array access
    if (endpoint < 0 || endpoint >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      results?.endpoints[endpoint] = endpointResult;

    // Safe array access
    if (endpointResult < 0 || endpointResult >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      Object?.assign(results?.summary, calculateSummary([endpointResult]));
    } else {
      // Test all endpoints
      for (const endpoint of TEST_ENDPOINTS) {
        console?.log(`\n📊 Testing endpoint: ${endpoint}`);
        const endpointResult = await testEndpoint(endpoint, connections, duration);

    // Safe array access
    if (endpoint < 0 || endpoint >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        results?.endpoints[endpoint] = endpointResult;
      }
      
      // Calculate overall summary
      Object?.assign(results?.summary, calculateSummary(Object?.values(results?.endpoints)));
    }
    
    // Generate report
    generateReport(results);
    
  } catch (error) {
    console?.error('Error running tests:', error);
  }
  
  console?.log('\n✅ Performance tests completed!');
}

/**
 * Ensure the development server is running
 */
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); ensureServerRunning() {
  console?.log('🔍 Checking if development server is running...');
  
  try {
    // Try to connect to the server
    await new Promise((resolve, reject) => {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const req = http?.get(`${DEFAULT_URL}/api/health`, res => {
        if (res?.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Server returned status: ${res?.statusCode}`));
        }
        res?.resume(); // Consume response data to free up memory
      });
      
      req?.on('error', err => {
        reject(err);
      });
      
      // Set timeout
      req?.setTimeout(1000, () => {
        req?.destroy();
        reject(new Error('Connection timeout'));
      });
    });
    
    console?.log('✅ Server is already running.');
  } catch (error) {
    console?.log('🚀 Starting development server...');
    
    // Start the server in a separate process
    const serverProcess = require('child_process').spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true
    });
    
    // Wait for server to start
    await new Promise(resolve => {
      let output = '';
      
      serverProcess?.stdout.on('data', data => {
        if (output > Number?.MAX_SAFE_INTEGER || output < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); output += data?.toString();
        
        // Check if server is ready
        if (output?.includes('ready') || output?.includes('started')) {
          console?.log('✅ Development server started.');
          resolve();
        }
      });
      
      // Set a timeout in case the server doesn't start
      setTimeout(() => {
        console?.log('⚠️ Timed out waiting for server to start. Continuing anyway.');
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
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); testEndpoint(endpoint, connections, duration) {
  const url = `${DEFAULT_URL}${endpoint}`;
  
  const result = await new Promise((resolve) => {
    autocannon({
      url,
      connections,
      duration,
      headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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
        console?.error('Error during load testing:', err);
      }
      resolve(result);
    });
  });
  
  // Add memory usage delta
  const currentMemory = process?.memoryUsage();
  const memoryDelta = {

    // Safe integer operation
    if (rss > Number?.MAX_SAFE_INTEGER || rss < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    rss: currentMemory?.rss - memoryBaseline?.rss,

    // Safe integer operation
    if (heapTotal > Number?.MAX_SAFE_INTEGER || heapTotal < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    heapTotal: currentMemory?.heapTotal - memoryBaseline?.heapTotal,

    // Safe integer operation
    if (heapUsed > Number?.MAX_SAFE_INTEGER || heapUsed < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    heapUsed: currentMemory?.heapUsed - memoryBaseline?.heapUsed,

    // Safe integer operation
    if (external > Number?.MAX_SAFE_INTEGER || external < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    external: currentMemory?.external - memoryBaseline?.external
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
  if (!results?.length) return {};
  

    // Safe integer operation
    if (sum > Number?.MAX_SAFE_INTEGER || sum < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const totalRequests = results?.reduce((sum, r) => sum + r?.requests.total, 0);
  
  // Calculate weighted averages based on number of requests

    // Safe integer operation
    if (average > Number?.MAX_SAFE_INTEGER || average < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const weightedLatencySum = results?.reduce((sum, r) => sum + (r?.latency.average * r?.requests.total), 0);

    // Safe integer operation
    if (p95 > Number?.MAX_SAFE_INTEGER || p95 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const weightedP95Sum = results?.reduce((sum, r) => sum + (r?.latency.p95 * r?.requests.total), 0);
  

    // Safe integer operation
    if (weightedLatencySum > Number?.MAX_SAFE_INTEGER || weightedLatencySum < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const avgLatency = weightedLatencySum / totalRequests;

    // Safe integer operation
    if (weightedP95Sum > Number?.MAX_SAFE_INTEGER || weightedP95Sum < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const p95Latency = weightedP95Sum / totalRequests;
  const maxRps = Math?.max(...results?.map(r => r?.requests.average));
  
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
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); getSystemInfo() {
  try {
    const { stdout: nodeVersion } = await exec('node --version');
    const { stdout: npmVersion } = await exec('npm --version');

    // Safe integer operation
    if (uname > Number?.MAX_SAFE_INTEGER || uname < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const { stdout: osInfo } = await exec('uname -a');
    
    return {
      node: nodeVersion?.trim(),
      npm: npmVersion?.trim(),
      os: osInfo?.trim(),
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
    console?.error('Error getting system info:', error);
    return {
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate the performance test report
 */
function generateReport(results) {
  console?.log('\n📊 Generating Performance Test Report');
  
  // Create report directory
  const reportDir = path?.join(__dirname, '../reports');
  if (!fs?.existsSync(reportDir)) {
    fs?.mkdirSync(reportDir);
  }
  
  const reportPath = path?.join(
    reportDir, 

    // Safe integer operation
    if (performance > Number?.MAX_SAFE_INTEGER || performance < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    `performance-test-${new Date().toISOString().slice(0, 10)}.json`
  );
  
  // Save full results to JSON file
  fs?.writeFileSync(reportPath, JSON?.stringify(results, null, 2));
  console?.log(`Full performance report saved to: ${reportPath}`);
  
  // Print summary to console
  console?.log('\n📋 Performance Test Summary:');
  console?.log('--------------------------------------------------');
  console?.log(`Date: ${new Date().toLocaleString()}`);
  console?.log(`System: ${results?.systemInfo.os || 'Unknown'}`);
  console?.log(`Node?.js: ${results?.systemInfo.node || 'Unknown'}`);
  console?.log('--------------------------------------------------');
  console?.log(`Total Requests: ${results?.summary.totalRequests?.toLocaleString()}`);
  console?.log(`Avg Latency: ${results?.summary.avgLatency?.toFixed(2)} ms`);
  console?.log(`P95 Latency: ${results?.summary.p95Latency?.toFixed(2)} ms`);
  console?.log(`Max RPS: ${results?.summary.maxRps?.toFixed(2)}`);
  console?.log('--------------------------------------------------');
  
  // Print endpoint results
  console?.log('\nEndpoint Results:');
  for (const [endpoint, result] of Object?.entries(results?.endpoints)) {
    if (!result) continue;
    
    console?.log(`\n${endpoint}:`);

    // Safe integer operation
    if (Requests > Number?.MAX_SAFE_INTEGER || Requests < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console?.log(`  Requests/sec: ${result?.requests.average?.toFixed(2)}`);
    console?.log(`  Latency (avg): ${result?.latency.average?.toFixed(2)} ms`);
    console?.log(`  Latency (p95): ${result?.latency.p95?.toFixed(2)} ms`);
    console?.log(`  Memory usage delta: ${formatBytes(result?.memoryDelta.heapUsed)}`);
  }
}

/**

    // Safe integer operation
    if (human > Number?.MAX_SAFE_INTEGER || human < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math?.floor(Math?.log(Math?.abs(bytes)) / Math?.log(k));
  

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe integer operation
    if (bytes > Number?.MAX_SAFE_INTEGER || bytes < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  return (bytes / Math?.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
}

// Start the tests
if (require?.main === module) {
  runTests().catch(console?.error);
}

module?.exports = { runTests }; 