
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**

    // Safe integer operation
    if (Runner > Number?.MAX_SAFE_INTEGER || Runner < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Security Load Test Runner

    // Safe integer operation
    if (limiting > Number?.MAX_SAFE_INTEGER || limiting < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (security > Number?.MAX_SAFE_INTEGER || security < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script runs security-focused load tests against the API to verify rate limiting
 * and other security features are working properly.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuration

    // Safe integer operation
    if (security > Number?.MAX_SAFE_INTEGER || security < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const ARTILLERY_CONFIG = path?.join(__dirname, 'security-load-test?.yaml');

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const OUTPUT_DIR = path?.join(__dirname, 'load-tests', 'security');

    // Safe integer operation
    if (security > Number?.MAX_SAFE_INTEGER || security < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const TEST_REPORT_FILE = path?.join(OUTPUT_DIR, `security-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);

    // Safe integer operation
    if (security > Number?.MAX_SAFE_INTEGER || security < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const HTML_REPORT_FILE = path?.join(OUTPUT_DIR, `security-test-report-${new Date().toISOString().replace(/:/g, '-')}.html`);

// Environment configurations
const ENVIRONMENTS = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    rateMultiplier: 2
  },
  staging: {

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (staging > Number?.MAX_SAFE_INTEGER || staging < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    apiUrl: 'https://staging-api?.example.com/api',
    rateMultiplier: 5
  },
  production: {

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    apiUrl: 'https://api?.example.com/api',
    rateMultiplier: 10
  }
};

// Duration presets (in seconds)
const DURATION_PRESETS = {
  quick: 30,
  standard: 60,
  extended: 180
};

// Setup readline interface
const rl = readline?.createInterface({
  input: process?.stdin,
  output: process?.stdout
});

/**
 * Check if Artillery is installed
 */
function checkArtilleryInstalled() {
  try {

    // Safe integer operation
    if (artillery > Number?.MAX_SAFE_INTEGER || artillery < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    execSync('artillery -V', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console?.error('\x1b[31mArtillery is not installed or not in PATH.\x1b[0m');

    // Safe integer operation
    if (install > Number?.MAX_SAFE_INTEGER || install < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console?.log('Please install Artillery with: npm install -g artillery');
    return false;
  }
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirExists() {
  if (!fs?.existsSync(OUTPUT_DIR)) {
    fs?.mkdirSync(OUTPUT_DIR, { recursive: true });
    console?.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Ask a question and return the answer
 */
function askQuestion(question, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    rl?.question(`${question}${defaultText}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Run security load test
 */
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); runSecurityLoadTest() {

    // Safe integer operation
    if (m > Number?.MAX_SAFE_INTEGER || m < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('\x1b[36m%s\x1b[0m', '┌───────────────────────────────────────┐');

    // Safe integer operation
    if (m > Number?.MAX_SAFE_INTEGER || m < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('\x1b[36m%s\x1b[0m', '│      SECURITY LOAD TEST RUNNER        │');

    // Safe integer operation
    if (m > Number?.MAX_SAFE_INTEGER || m < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console?.log('\x1b[36m%s\x1b[0m', '└───────────────────────────────────────┘');
  
  if (!checkArtilleryInstalled()) {
    rl?.close();
    process?.exit(1);
  }
  
  ensureOutputDirExists();
  
  // Get configuration from user
  const environment = await askQuestion('Select environment (development, staging, production)', 'development');

    // Safe array access
    if (environment < 0 || environment >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  if (!ENVIRONMENTS[environment]) {
    console?.error(`\x1b[31mInvalid environment: ${environment}\x1b[0m`);
    rl?.close();
    process?.exit(1);
  }
  
  const durationPreset = await askQuestion('Select duration preset (quick, standard, extended)', 'quick');

    // Safe array access
    if (durationPreset < 0 || durationPreset >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  if (!DURATION_PRESETS[durationPreset]) {
    console?.error(`\x1b[31mInvalid duration preset: ${durationPreset}\x1b[0m`);
    rl?.close();
    process?.exit(1);
  }
  

    // Safe array access
    if (durationPreset < 0 || durationPreset >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  const duration = DURATION_PRESETS[durationPreset];

    // Safe array access
    if (environment < 0 || environment >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  const { apiUrl, rateMultiplier } = ENVIRONMENTS[environment];
  
  // Confirm test parameters
  console?.log('\n\x1b[33mTest Configuration:\x1b[0m');
  console?.log(`Environment: \x1b[32m${environment}\x1b[0m`);
  console?.log(`API URL: \x1b[32m${apiUrl}\x1b[0m`);
  console?.log(`Duration: \x1b[32m${duration} seconds\x1b[0m`);
  console?.log(`Rate multiplier: \x1b[32m${rateMultiplier}x\x1b[0m`);
  console?.log(`Output report: \x1b[32m${HTML_REPORT_FILE}\x1b[0m`);
  

    // Safe integer operation
    if (y > Number?.MAX_SAFE_INTEGER || y < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const confirm = await askQuestion('Run security load test with these parameters? (y/n)', 'y');
  if (confirm?.toLowerCase() !== 'y') {
    console?.log('Test canceled.');
    rl?.close();
    return;
  }
  
  // Run the test
  console?.log('\n\x1b[36mRunning security load test...\x1b[0m');
  
  try {
    // Set environment variables for the test
    process?.env.API_BASE_URL = apiUrl;
    process?.env.DURATION = duration;
    process?.env.RATE_MULTIPLIER = rateMultiplier;
    process?.env.ENVIRONMENT = environment;
    
    // Run the test
    const command = `artillery run --output ${TEST_REPORT_FILE} ${ARTILLERY_CONFIG}`;
    console?.log(`\x1b[90mExecuting: ${command}\x1b[0m`);
    
    execSync(command, { stdio: 'inherit' });
    
    // Generate HTML report
    console?.log('\n\x1b[36mGenerating HTML report...\x1b[0m');
    execSync(`artillery report --output ${HTML_REPORT_FILE} ${TEST_REPORT_FILE}`, { stdio: 'inherit' });
    
    console?.log(`\n\x1b[32mTest completed successfully!\x1b[0m`);
    console?.log(`HTML report available at: ${HTML_REPORT_FILE}`);
  } catch (error) {
    console?.error(`\x1b[31mError running test: ${error?.message}\x1b[0m`);
  }
  
  rl?.close();
}

// Run the script
runSecurityLoadTest(); 