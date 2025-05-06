#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const autocannon = require('autocannon');
const ora = require('ora');
const chalk = require('chalk');

// Ensure the required dependencies are installed
try {
  require('autocannon');
  require('ora');
  require('chalk');
} catch (error) {
  console.log('Installing required dependencies...');
  execSync('npm install --no-save autocannon ora chalk');
}

// Test configuration
const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:3000',
  duration: 30, // seconds
  connections: 100,
  pipelining: 10,
  scenarios: [
    // Main pages performance test
    {
      name: 'Virtual Try-On Page',
      path: '/virtual-try-on',
      method: 'GET',
    },
    // User preferences API test
    {
      name: 'User Preferences API - GET',
      path: '/api/user-preferences',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{TEST_AUTH_TOKEN}}',
      },
    },
    // User preferences API update test
    {
      name: 'User Preferences API - POST',
      path: '/api/user-preferences',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{TEST_AUTH_TOKEN}}',
      },
      body: JSON.stringify({
        theme: 'dark',
        fontSize: 'medium',
        reducedAnimations: true,
      }),
    },
    // Analytics events API test
    {
      name: 'Analytics Events API',
      path: '/api/analytics/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'page_view',
        page: '/virtual-try-on',
        timestamp: Date.now(),
        sessionId: 'test-session-id',
        metadata: {
          referrer: 'direct',
          deviceType: 'desktop',
        },
      }),
    },
    // Social sharing feature test
    {
      name: 'Social Sharing API',
      path: '/api/share',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://vibewell.app/virtual-try-on',
        platform: 'facebook',
      }),
    },
  ],
};

// Function to load test configuration from file
function loadConfig() {
  const configPath = path.join(process.cwd(), 'performance-test-config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configFile);
    } catch (error) {
      console.error('Error reading config file:', error.message);
      return DEFAULT_CONFIG;
    }
  } else {
    return DEFAULT_CONFIG;
  }
}

// Function to save test results
function saveResults(results) {
  const resultsDir = path.join(process.cwd(), 'performance-test-results');
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const resultsPath = path.join(resultsDir, `results-${timestamp}.json`);
  
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(chalk.green(`Results saved to ${resultsPath}`));
}

// Main function to run performance tests
async function runPerformanceTests() {
  const config = loadConfig();
  const testResults = [];
  
  console.log(chalk.blue('Starting performance tests...'));
  console.log(chalk.blue('=========================='));
  
  for (const scenario of config.scenarios) {
    const spinner = ora(`Running test: ${scenario.name}`).start();
    
    try {
      // Replace placeholders in headers and body
      const headers = scenario.headers ? { ...scenario.headers } : {};
      Object.keys(headers).forEach(key => {
        if (typeof headers[key] === 'string') {
          headers[key] = headers[key].replace('{{TEST_AUTH_TOKEN}}', process.env.TEST_AUTH_TOKEN || 'test-token');
        }
      });
      
      let body = scenario.body;
      if (typeof body === 'string') {
        body = body.replace('{{TEST_AUTH_TOKEN}}', process.env.TEST_AUTH_TOKEN || 'test-token');
      }
      
      // Configure Autocannon instance
      const instance = autocannon({
        url: `${config.baseUrl}${scenario.path}`,
        method: scenario.method,
        headers,
        body,
        connections: config.connections,
        pipelining: config.pipelining,
        duration: config.duration,
      });
      
      // Get results
      const results = await new Promise(resolve => {
        instance.on('done', resolve);
      });
      
      // Add results to our array
      testResults.push({
        scenario: scenario.name,
        results: {
          requests: {
            average: results.requests.average,
            mean: results.requests.mean,
            stddev: results.requests.stddev,
            min: results.requests.min,
            max: results.requests.max,
            total: results.requests.total,
            p99: results.requests.p99,
            p95: results.requests.p95,
          },
          latency: {
            average: results.latency.average,
            mean: results.latency.mean,
            stddev: results.latency.stddev,
            min: results.latency.min,
            max: results.latency.max,
            p99: results.latency.p99,
            p95: results.latency.p95,
          },
          errors: results.errors,
          timeouts: results.timeouts,
        },
      });
      
      // Log results
      spinner.succeed(`Completed test: ${scenario.name}`);
      console.log(chalk.green(`  Requests/sec: ${results.requests.average.toFixed(2)}`));
      console.log(chalk.green(`  Latency avg: ${results.latency.average.toFixed(2)} ms`));
      console.log(chalk.green(`  Latency p99: ${results.latency.p99.toFixed(2)} ms`));
      console.log(chalk.yellow(`  Errors: ${results.errors}`));
      console.log(chalk.yellow(`  Timeouts: ${results.timeouts}`));
      console.log(chalk.blue('----------------------------'));
    } catch (error) {
      spinner.fail(`Failed test: ${scenario.name}`);
      console.error(chalk.red(error.message));
      testResults.push({
        scenario: scenario.name,
        error: error.message,
      });
    }
  }
  
  // Save test results
  saveResults({
    timestamp: new Date().toISOString(),
    config: {
      baseUrl: config.baseUrl,
      duration: config.duration,
      connections: config.connections,
      pipelining: config.pipelining,
    },
    results: testResults,
  });
  
  console.log(chalk.blue('Performance tests completed!'));
}

// Execute tests
runPerformanceTests().catch(error => {
  console.error(chalk.red('Error running performance tests:'), error);
  process.exit(1);
}); 