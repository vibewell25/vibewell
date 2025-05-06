#!/usr/bin/env node

/**
 * Deployment Validation Script
 * 
 * This script performs validation checks on a newly deployed instance
 * before it receives production traffic. It tests critical endpoints
 * and functionality to ensure the deployment is ready for production.
 * 
 * Usage:
 *   NODE_ENV=production node scripts/validate-deployment.js
 * 
 * Exit codes:
 *   0 - All validation checks passed
 *   1 - One or more validation checks failed
 */

const fetch = require('node-fetch');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/deployment-validation.log' })
  ]
});

// Config
const config = {
  baseUrl: process.env.VALIDATION_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  apiKey: process.env.HEALTH_CHECK_API_KEY || 'validation-key',
  timeout: 30000, // 30 seconds timeout for tests
  minSuccessRate: 0.95, // 95% success rate required
  maxResponseTime: 1000, // 1000ms max response time
  criticalPaths: [
    // Static pages
    { path: '/', method: 'GET', name: 'Home page' },
    { path: '/about', method: 'GET', name: 'About page' },
    
    // Auth endpoints
    { path: '/api/auth/csrf', method: 'GET', name: 'CSRF endpoint' },
    
    // API endpoints
    { path: '/api/health', method: 'GET', name: 'Health endpoint', headers: { 'x-api-key': '{{apiKey}}' } },
    
    // Profile and booking
    { path: '/api/profile/validate', method: 'GET', name: 'Profile validation', auth: true },
    { path: '/api/bookings/availability', method: 'GET', name: 'Booking availability', query: { date: '{{tomorrow}}' } },
    
    // Search functionality
    { path: '/api/search', method: 'GET', name: 'Search functionality', query: { q: 'test' } }
  ]
};

// Main validation function
async function validateDeployment() {
  const startTime = performance.now();
  logger.info(`🔍 Starting deployment validation for ${config.baseUrl}`);
  
  // Check if we're in a vercel deployment
  const isVercel = process.env.VERCEL === '1';
  const deploymentUrl = isVercel ? process.env.VERCEL_URL : config.baseUrl;
  
  // Results container
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    baseUrl: config.baseUrl,
    deploymentUrl: deploymentUrl,
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    duration: 0,
    success: false
  };
  
  try {
    // Run initial health check
    const healthCheck = await runTest({
      path: '/api/health',
      method: 'GET',
      name: 'Initial health check',
      headers: { 'x-api-key': config.apiKey }
    });
    
    results.tests.push(healthCheck);
    
    if (!healthCheck.success) {
      throw new Error('Initial health check failed - aborting validation');
    }
    
    // Replace template values in config
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Run tests for critical paths in parallel
    const testsToRun = config.criticalPaths.map(test => {
      const testConfig = { ...test };
      
      // Replace template values
      if (testConfig.headers) {
        Object.keys(testConfig.headers).forEach(key => {
          if (typeof testConfig.headers[key] === 'string') {
            testConfig.headers[key] = testConfig.headers[key].replace('{{apiKey}}', config.apiKey);
          }
        });
      }
      
      if (testConfig.query) {
        Object.keys(testConfig.query).forEach(key => {
          if (typeof testConfig.query[key] === 'string') {
            testConfig.query[key] = testConfig.query[key].replace('{{tomorrow}}', tomorrowStr);
          }
        });
      }
      
      return runTest(testConfig);
    });
    
    const testResults = await Promise.all(testsToRun);
    results.tests.push(...testResults);
    
    // Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.success).length;
    results.summary.failed = results.tests.filter(t => !t.success).length;
    results.summary.skipped = results.tests.filter(t => t.skipped).length;
    
    // Calculate success rate
    const successRate = results.summary.passed / (results.summary.total - results.summary.skipped);
    results.success = successRate >= config.minSuccessRate;
    
    // Calculate duration
    results.duration = Math.round(performance.now() - startTime);
    
    // Log results
    if (results.success) {
      logger.info(`✅ Deployment validation passed! Success rate: ${(successRate * 100).toFixed(2)}%`);
    } else {
      logger.error(`❌ Deployment validation failed! Success rate: ${(successRate * 100).toFixed(2)}%`);
      results.tests.filter(t => !t.success).forEach(test => {
        logger.error(`- ${test.name} failed: ${test.error}`);
      });
    }
    
    // Output results
    console.log(JSON.stringify(results, null, 2));
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    logger.error('Deployment validation failed with error:', error);
    results.success = false;
    results.error = error.message;
    results.duration = Math.round(performance.now() - startTime);
    console.error(JSON.stringify(results, null, 2));
    process.exit(1);
  }
}

// Run a single test
async function runTest(testConfig) {
  const { path, method, name, headers = {}, body, query, auth } = testConfig;
  const result = {
    name,
    path,
    method,
    timestamp: new Date().toISOString(),
    success: false,
    skipped: false,
    duration: 0,
    statusCode: null,
    error: null
  };
  
  try {
    // Build URL with query params
    let url = `${config.baseUrl}${path}`;
    if (query) {
      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url += `?${queryParams.toString()}`;
    }
    
    const startTime = performance.now();
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: config.timeout
    };
    
    // Add auth header if needed (mock for testing)
    if (auth) {
      // In a real scenario, you'd want to use a real token here
      fetchOptions.headers['Authorization'] = `Bearer test-token`;
    }
    
    // Add body if needed
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);
    const duration = Math.round(performance.now() - startTime);
    
    result.duration = duration;
    result.statusCode = response.status;
    result.success = response.ok && duration <= config.maxResponseTime;
    
    if (!response.ok) {
      const text = await response.text();
      result.error = `HTTP ${response.status}: ${text.substring(0, 200)}`;
    } else if (duration > config.maxResponseTime) {
      result.error = `Response time (${duration}ms) exceeds maximum (${config.maxResponseTime}ms)`;
    }
    
    return result;
  } catch (error) {
    result.error = error.message;
    return result;
  }
}

// Run the validation
validateDeployment(); 