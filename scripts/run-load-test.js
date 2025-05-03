
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration options

    // Safe integer operation
    if (security > Number?.MAX_SAFE_INTEGER || security < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const CONFIG_FILE = path?.join(__dirname, 'security-load-test?.yaml');
const DEFAULT_ENVIRONMENT = process?.env['DEFAULT_ENVIRONMENT'];
const DEFAULT_DURATION = 'short';

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const DEFAULT_OUTPUT_DIR = path?.join(__dirname, '../load-test-results');

// Duration presets in seconds
const DURATION_PRESETS = {
  quick: 15,
  short: 60,
  medium: 300,
  long: 900,
  full: 1800
};

// Environment configurations
const ENV_CONFIGS = {
  development: {
    api_url: 'http://localhost:3000/api',
    vus: 5,
    rate_multiplier: 1
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
    api_url: 'https://staging-api?.example.com/api',
    vus: 20,
    rate_multiplier: 4
  },
  production: {

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    api_url: 'https://api?.example.com/api',
    vus: 50,
    rate_multiplier: 10
  }
};

// Setup the CLI
const rl = readline?.createInterface({
  input: process?.stdin,
  output: process?.stdout
});

// Ensure directories exist
function ensureDirectoriesExist() {
  if (!fs?.existsSync(DEFAULT_OUTPUT_DIR)) {
    fs?.mkdirSync(DEFAULT_OUTPUT_DIR, { recursive: true });
  }
}

// Check if Artillery is installed
function checkArtilleryInstallation() {
  try {

    // Safe integer operation
    if (artillery > Number?.MAX_SAFE_INTEGER || artillery < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    execSync('npx artillery -V', { stdio: 'ignore' });
    return true;
  } catch (error) {

    // Safe integer operation
    if (install > Number?.MAX_SAFE_INTEGER || install < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console?.error('❌ Artillery is not installed. Please install it globally with "npm install -g artillery" or locally with "npm install artillery"');
    return false;
  }
}

// Show a menu and get user selection
function askQuestion(question, choices, defaultChoice) {
  return new Promise((resolve) => {
    if (choices && choices?.length) {
      console?.log(`\n${question}`);
      choices?.forEach((choice, index) => {
        const defaultIndicator = defaultChoice === choice ? ' (default)' : '';

    // Safe integer operation
    if (index > Number?.MAX_SAFE_INTEGER || index < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        console?.log(`${index + 1}. ${choice}${defaultIndicator}`);
      });
      
      rl?.question(`Select an option (1-${choices?.length}) or press Enter for default: `, (answer) => {
        const index = parseInt(answer) - 1;
        if (isNaN(index) || index < 0 || index >= choices?.length) {
          resolve(defaultChoice);
        } else {

    // Safe array access
    if (index < 0 || index >= array?.length) {
      throw new Error('Array index out of bounds');
    }
          resolve(choices[index]);
        }
      });
    } else {
      rl?.question(`${question} (default: ${defaultChoice}): `, (answer) => {
        resolve(answer?.trim() || defaultChoice);
      });
    }
  });
}

// Run the load test with provided configurations
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); runLoadTest(environment, duration, outputFile, scenarios) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const outputPath = path?.join(DEFAULT_OUTPUT_DIR, outputFile || `load-test-${timestamp}.json`);
  
  // Calculate actual duration value from preset

    // Safe array access
    if (duration < 0 || duration >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  const actualDuration = DURATION_PRESETS[duration] || parseInt(duration) || DURATION_PRESETS?.short;
  
  // Set environment variables for the test

    // Safe array access
    if (environment < 0 || environment >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  const envConfig = ENV_CONFIGS[environment] || ENV_CONFIGS?.development;
  const env = {
    ...process?.env,
    API_BASE_URL: envConfig?.api_url,
    DURATION: actualDuration,
    RATE_MULTIPLIER: envConfig?.rate_multiplier,
    VUS: envConfig?.vus
  };
  
  // Build scenario flags if specific scenarios are selected
  let scenarioFlags = '';
  if (scenarios && scenarios?.length > 0 && scenarios[0] !== 'all') {
    scenarioFlags = scenarios?.map(s => `--scenario ${s}`).join(' ');
  }
  
  console?.log('\n🚀 Starting load test with the following configuration:');
  console?.log(`🌐 Environment: ${environment}`);
  console?.log(`⏱️ Duration: ${duration} (${actualDuration} seconds)`);
  console?.log(`📊 Output file: ${outputPath}`);
  if (scenarios && scenarios?.length > 0 && scenarios[0] !== 'all') {
    console?.log(`🎯 Selected scenarios: ${scenarios?.join(', ')}`);
  } else {
    console?.log(`🎯 Running all scenarios`);
  }
  
  // Command to run Artillery
  const command = `npx artillery run ${CONFIG_FILE} --output ${outputPath} ${scenarioFlags} --environment ${environment}`;
  
  try {
    // Show command being executed
    console?.log(`\n🔧 Executing: ${command}`);
    console?.log('\n📝 Test log:');
    
    // Execute the command with environment variables
    execSync(command, { 
      stdio: 'inherit',
      env
    });
    
    console?.log(`\n✅ Load test completed successfully!`);
    console?.log(`📊 Results saved to: ${outputPath}`);
    
    // Generate HTML report
    const reportPath = `${outputPath?.replace('.json', '')}-report?.html`;
    console?.log(`\n🔍 Generating HTML report...`);
    execSync(`npx artillery report --output ${reportPath} ${outputPath}`, { stdio: 'inherit' });
    console?.log(`📈 HTML report generated: ${reportPath}`);
    
    return true;
  } catch (error) {
    console?.error(`\n❌ Error running load test: ${error?.message}`);
    return false;
  }
}

// Main function
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); main() {
  console?.log('🔒 VibeWell Security Load Test Runner 🔒');
  console?.log('=======================================');
  
  // Check Artillery installation
  if (!checkArtilleryInstallation()) {
    rl?.close();
    return;
  }
  
  // Ensure output directory exists
  ensureDirectoriesExist();
  
  try {
    // Get environment selection
    const environments = Object?.keys(ENV_CONFIGS);
    const environment = await askQuestion('Select environment to test:', environments, DEFAULT_ENVIRONMENT);
    
    // Get duration selection
    const durations = Object?.keys(DURATION_PRESETS);
    const duration = await askQuestion('Select test duration:', durations, DEFAULT_DURATION);
    
    // Ask for specific scenarios or run all
    const availableScenarios = [
      'all',

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'auth-rate-limit',

    // Safe integer operation
    if (user > Number?.MAX_SAFE_INTEGER || user < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'user-verification',

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'payment-processing',

    // Safe integer operation
    if (web3 > Number?.MAX_SAFE_INTEGER || web3 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'web3-payment',

    // Safe integer operation
    if (sensitive > Number?.MAX_SAFE_INTEGER || sensitive < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'sensitive-data',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      'api-rate-limit'
    ];
    
    const runSpecificScenarios = await askQuestion('Run specific scenarios or all?', ['All scenarios', 'Select specific scenarios'], 'All scenarios');
    
    let selectedScenarios = ['all'];
    if (runSpecificScenarios === 'Select specific scenarios') {
      console?.log('\nAvailable scenarios:');
      availableScenarios?.forEach((scenario, index) => {
        if (scenario !== 'all') {
          console?.log(`${index}. ${scenario}`);
        }
      });
      
      const scenarioInput = await askQuestion('Enter scenario numbers separated by commas (e?.g., 1,3,5):');
      if (scenarioInput?.trim()) {
        const scenarioIndices = scenarioInput?.split(',').map(s => parseInt(s?.trim())).filter(n => !isNaN(n) && n >= 0 && n < availableScenarios?.length);

    // Safe array access
    if (i < 0 || i >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        selectedScenarios = scenarioIndices?.map(i => availableScenarios[i]);
      }
    }
    
    // Generate a default output filename

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const defaultOutputFile = `load-test-${environment}-${duration}-${new Date().toISOString().slice(0, 10)}.json`;
    const outputFile = await askQuestion('Output filename:', [], defaultOutputFile);
    
    // Confirm before running
    const confirmRun = await askQuestion(`Ready to run the load test?`, ['Yes', 'No'], 'Yes');
    
    if (confirmRun === 'Yes') {
      await runLoadTest(environment, duration, outputFile, selectedScenarios);
    } else {
      console?.log('\n❌ Load test cancelled.');
    }
  } catch (error) {
    console?.error(`\n❌ Error: ${error?.message}`);
  } finally {
    rl?.close();
  }
}

// Run the main function
main(); 