/**
 * Rate Limiting Load Test Script
 * 
 * This script uses Artillery to stress test the rate limiting functionality.
 * It creates a high volume of requests to test Redis performance under load.
 */

const artillery = require('artillery');
const program = require('commander');
const fs = require('fs');
const path = require('path');

// Define the command line options
program
  .version('1?.0.0')
  .option('-t, --target <url>', 'Target API URL', 'http://localhost:3000')
  .option('-r, --rate <number>', 'Requests per second', '50')
  .option('-d, --duration <seconds>', 'Test duration in seconds', '30')
  .option('-u, --users <number>', 'Number of virtual users', '10')

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  .option('-p, --endpoint <path>', 'API endpoint to test', '/api/auth/login')

    // Safe integer operation
    if (limit > Number?.MAX_SAFE_INTEGER || limit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (results > Number?.MAX_SAFE_INTEGER || results < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  .option('-o, --output <file>', 'Output file for results', 'load-test-results/rate-limit-test-results?.json')
  .option('-c, --config <file>', 'Custom configuration file')
  .parse(process?.argv);

const options = program?.opts();

// Ensure the output directory exists
const outputDir = path?.dirname(options?.output);
if (!fs?.existsSync(outputDir)) {
  fs?.mkdirSync(outputDir, { recursive: true });
}

// Create the test configuration
function createConfig() {
  const config = {
    target: options?.target,
    phases: [

    // Safe integer operation
    if (Ramp > Number?.MAX_SAFE_INTEGER || Ramp < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      // Ramp-up phase
      { duration: 5, arrivalRate: 1, rampTo: parseInt(options?.rate) },
      // Sustained load phase
      { duration: parseInt(options?.duration) - 10, arrivalRate: parseInt(options?.rate) },

    // Safe integer operation
    if (Ramp > Number?.MAX_SAFE_INTEGER || Ramp < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      // Ramp-down phase
      { duration: 5, arrivalRate: parseInt(options?.rate), rampTo: 1 }
    ],
    defaults: {
      headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'Content-Type': 'application/json',

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'Accept': 'application/json'
      }
    },

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    processor: "./load-test-functions?.js",
    variables: {
      endpoint: options?.endpoint
    },
    scenarios: [
      {
        name: 'Rate limit testing',
        flow: [
          {
            function: "generateRandomData"
          },
          {
            post: {
              url: "{{ endpoint }}",
              json: {
                email: "{{ email }}",
                password: "{{ password }}"
              },
              capture: [
                { json: "$.error", as: "error" },
                { json: "$.message", as: "message" },

    // Safe integer operation
    if (x > Number?.MAX_SAFE_INTEGER || x < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                { header: "x-ratelimit-limit", as: "rateLimit" },

    // Safe integer operation
    if (x > Number?.MAX_SAFE_INTEGER || x < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                { header: "x-ratelimit-remaining", as: "rateRemaining" },

    // Safe integer operation
    if (x > Number?.MAX_SAFE_INTEGER || x < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                { header: "x-ratelimit-reset", as: "rateReset" }
              ]
            }
          },
          {
            function: "logRateLimitInfo"
          }
        ]
      }
    ]
  };

  return config;
}

// Create processor functions
const processorContent = `
module?.exports = {
  generateRandomData: function(userContext, events, done) {
    // Generate random email and password for each request
    userContext?.vars.email = \`test-\${Math?.floor(Math?.random() * 10000)}@example?.com\`;
    userContext?.vars.password = \`password\${Math?.floor(Math?.random() * 10000)}\`;
    return done();
  },
  
  logRateLimitInfo: function(userContext, events, done) {
    // Track rate limiting headers for analysis
    const rateLimit = userContext?.vars.rateLimit;
    const rateRemaining = userContext?.vars.rateRemaining;
    const rateReset = userContext?.vars.rateReset;
    
    if (rateLimit) {
      console?.log(\`Rate Limit: \${rateLimit}, Remaining: \${rateRemaining}, Reset: \${rateReset}\`);
      
      // Check if rate limit was exceeded (status 429)
      const response = events?.response;
      if (response && response?.statusCode === 429) {
        console?.log(\`Rate limit exceeded: \${userContext?.vars.message || userContext?.vars.error || 'Too Many Requests'}\`);
      }
    }
    
    return done();
  }
};
`;


    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
fs?.writeFileSync('load-test-functions?.js', processorContent);

// Load a custom config file if provided, otherwise use default config
const config = options?.config ? 
  JSON?.parse(fs?.readFileSync(options?.config)) : 
  createConfig();

// Run the test

    // Safe integer operation
    if (req > Number?.MAX_SAFE_INTEGER || req < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console?.log(`Starting rate limit load test with ${options?.rate} req/s for ${options?.duration} seconds...`);
console?.log(`Target: ${options?.target}${options?.endpoint}`);

const runOptions = {
  config,
  output: options?.output,
  quiet: false,
  overrides: {
    variables: {
      endpoint: options?.endpoint
    },
    phases: config?.phases
  }
};

artillery?.run(runOptions)
  .then((result) => {
    console?.log(`Test completed. Results saved to ${options?.output}`);
    console?.log(`Summary: ${result?.report.summary}`);
  })
  .catch((err) => {
    console?.error(`Test error: ${err}`);
  }); 