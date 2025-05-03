#!/usr/bin/env node

/**
 * Environment Variable Validator
 * 
 * This script validates that all required environment variables are set
 * before allowing the application to be deployed or run in production.
 * 
 * Usage:
 *  - npm run validate:env
 *  - NODE_ENV=production npm run validate:env
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from various .env files based on environment
function loadEnvFiles() {
  const env = process.env.NODE_ENV || 'development';
  const files = [
    '.env',                    // Base config for all environments
    `.env.${env}`,             // Environment-specific config
    `.env.${env}.local`,       // Local overrides for environment
    '.env.local',              // Local overrides for all environments
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Loading environment from ${file}`);
      dotenv.config({ path: file });
    }
  });
}

loadEnvFiles();

// Define required environment variables by category
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE: ['DATABASE_URL'],
  
  // Authentication
  AUTH: [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ],
  
  // Auth0 (if using Auth0)
  AUTH0: [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET'
  ],

  // Stripe
  STRIPE: [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],

  // AWS S3
  AWS: [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_BUCKET_NAME'
  ],

  // Redis
  REDIS: ['REDIS_URL'],

  // Email
  EMAIL: [
    'EMAIL_FROM'
  ],

  // Security
  SECURITY: [
    'ENCRYPTION_KEY',
    'JWT_SECRET'
  ],
  
  // API
  API: [
    'NEXT_PUBLIC_API_URL'
  ],
  
  // Monitoring
  MONITORING: [
    'SENTRY_DSN'
  ],
  
  // Health Checks
  HEALTH: [
    'HEALTH_CHECK_API_KEY'
  ],
  
  // Mobile
  MOBILE: [
    'EXPO_PUBLIC_API_URL'
  ]
};

// Optional environment variables by category for different environments
const OPTIONAL_ENV_VARS = {
  development: [
    'OPENAI_API_KEY',
    'SENTRY_DSN',
    'MIXPANEL_TOKEN'
  ],
  staging: [
    'OPENAI_API_KEY',
    'MIXPANEL_TOKEN'
  ],
  production: []
};

// Function to check if an environment variable is set
function isEnvVarSet(name) {
  const value = process.env[name];
  return value !== undefined && value !== '';
}

// Function to get environment variables to check based on current environment
function getRequiredEnvVars() {
  const env = process.env.NODE_ENV || 'development';
  
  // For production and staging, we need all environment variables
  if (env === 'production') {
    return REQUIRED_ENV_VARS;
  }
  
  // For development and staging, we can exclude some categories
  const requiredCategories = { ...REQUIRED_ENV_VARS };
  
  if (env === 'development') {
    // Make certain categories optional in development
    delete requiredCategories.MONITORING;
    delete requiredCategories.SECURITY;
    
    // For Auth0, only require if NEXT_AUTH_PROVIDER is 'auth0'
    if (process.env.NEXT_AUTH_PROVIDER !== 'auth0') {
      delete requiredCategories.AUTH0;
    }
  }
  
  return requiredCategories;
}

// Main validation function
function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  console.log(chalk.blue(`🔍 Validating environment variables for ${chalk.bold(env)} environment...`));
  
  const requiredVars = getRequiredEnvVars();
  const missingVars = {};
  const optionalMissingVars = {};
  let hasMissingVars = false;
  
  // Check each category of required variables
  for (const [category, vars] of Object.entries(requiredVars)) {
    missingVars[category] = [];
    
    for (const varName of vars) {
      if (!isEnvVarSet(varName)) {
        missingVars[category].push(varName);
        hasMissingVars = true;
      }
    }
    
    // Remove empty categories
    if (missingVars[category].length === 0) {
      delete missingVars[category];
    }
  }
  
  // Check optional variables
  if (OPTIONAL_ENV_VARS[env]) {
    const missingOptionalVars = [];
    
    for (const varName of OPTIONAL_ENV_VARS[env]) {
      if (!isEnvVarSet(varName)) {
        missingOptionalVars.push(varName);
      }
    }
    
    if (missingOptionalVars.length > 0) {
      optionalMissingVars.OPTIONAL = missingOptionalVars;
    }
  }
  
  // Output results
  if (hasMissingVars) {
    console.error(chalk.red('❌ Missing required environment variables:'));
    
    for (const [category, vars] of Object.entries(missingVars)) {
      console.error(chalk.red(`\n[${category}]`));
      vars.forEach(name => console.error(chalk.red(`  - ${name}`)));
    }
    
    console.error(chalk.red('\nPlease set these variables in your .env file or in your environment.'));
    
    if (env === 'production') {
      console.error(chalk.red('Exiting with error code 1'));
      process.exit(1);
    }
  } else {
    console.log(chalk.green('✅ All required environment variables are set!'));
  }
  
  // Show warnings for missing optional variables
  if (Object.keys(optionalMissingVars).length > 0) {
    console.warn(chalk.yellow('\n⚠️ Missing optional environment variables:'));
    
    for (const [category, vars] of Object.entries(optionalMissingVars)) {
      console.warn(chalk.yellow(`\n[${category}]`));
      vars.forEach(name => console.warn(chalk.yellow(`  - ${name}`)));
    }
    
    console.warn(chalk.yellow('\nThese variables are optional but recommended for full functionality.'));
  }
  
  // Warn about placeholder values
  const suspiciousVars = checkForPlaceholders();
  
  if (suspiciousVars.length > 0) {
    console.warn(chalk.yellow('\n⚠️ Warning: Some environment variables may contain placeholder values:'));
    suspiciousVars.forEach(name => {
      // Mask secrets in output
      let value = process.env[name];
      if (name.toLowerCase().includes('secret') || name.toLowerCase().includes('key') || name.toLowerCase().includes('password')) {
        value = value.substring(0, 3) + '********' + value.substring(value.length - 3);
      }
      console.warn(chalk.yellow(`  - ${name} = ${value}`));
    });
    console.warn(chalk.yellow('\nPlease check these variables and update them with real values if needed.'));
    
    if (env === 'production') {
      console.error(chalk.red('Exiting with error code 1 due to suspicious placeholder values in production'));
      process.exit(1);
    }
  }
  
  // Check for URL formatting issues
  checkUrlFormatting();
}

// Check for placeholder values in environment variables
function checkForPlaceholders() {
  const suspiciousPatterns = [
    'your-', 'YOUR-', 'placeholder', 'PLACEHOLDER',
    'xxx', 'XXX', 'change-me', 'example', '[', ']',
    'to-be-filled', '<', '>'
  ];
  
  const suspiciousVars = [];
  
  for (const [name, value] of Object.entries(process.env)) {
    if (value && typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (value.includes(pattern)) {
          suspiciousVars.push(name);
          break;
        }
      }
    }
  }
  
  return suspiciousVars;
}

// Check URL formatting
function checkUrlFormatting() {
  const urlVars = ['NEXTAUTH_URL', 'AUTH0_BASE_URL', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_URL'];
  
  for (const varName of urlVars) {
    if (isEnvVarSet(varName)) {
      const url = process.env[varName];
      
      // Check for trailing slashes inconsistency
      if (url.endsWith('/') && varName === 'NEXTAUTH_URL') {
        console.warn(chalk.yellow(`⚠️ Warning: ${varName} has a trailing slash which may cause issues: ${url}`));
      }
      
      // Check for http in production
      if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
        console.error(chalk.red(`❌ Error: ${varName} uses insecure HTTP in production: ${url}`));
        process.exit(1);
      }
    }
  }
}

// Run the validation
validateEnv();

// Export the validation function for use in other scripts
module.exports = {
  validateEnv
}; 