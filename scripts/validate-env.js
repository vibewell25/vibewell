const { logger } = require('../src/lib/monitoring');

const requiredEnvVars = {
  app: [
    'NODE_ENV',
    'PORT',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'API_URL',
  ],
  auth0: [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
  ],
  database: [
    'DATABASE_URL',
    'SHADOW_DATABASE_URL',
  ],
  redis: [
    'REDIS_URL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
  ],
  aws: [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'S3_BUCKET',
  ],
  sentry: [
    'SENTRY_DSN',
    'SENTRY_AUTH_TOKEN',
    'SENTRY_PROJECT',
    'SENTRY_ORG',
  ],
  security: [
    'RATE_LIMIT_REQUESTS',
    'RATE_LIMIT_WINDOW_MS',
  ],
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function validateEnv() {
  let hasErrors = false;
  const missingVars = [];
  const emptyVars = [];
  const invalidUrls = [];
  const invalidNumbers = [];

  // Check for missing and empty variables
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    logger.info(`Validating ${category} environment variables...`);
    
    vars.forEach(varName => {
      if (!(varName in process.env)) {
        missingVars.push(varName);
        hasErrors = true;
      } else if (!process.env[varName]) {
        emptyVars.push(varName);
        hasErrors = true;
      }
    });
  });

  // Validate URL formats
  const urlVars = ['AUTH0_BASE_URL', 'AUTH0_ISSUER_BASE_URL', 'NEXTAUTH_URL', 'API_URL', 'DATABASE_URL'];
  urlVars.forEach(varName => {
    if (process.env[varName] && !isValidUrl(process.env[varName])) {
      invalidUrls.push(varName);
      hasErrors = true;
    }
  });

  // Validate numeric values
  const numericVars = ['RATE_LIMIT_REQUESTS', 'RATE_LIMIT_WINDOW_MS', 'PORT'];
  numericVars.forEach(varName => {
    if (process.env[varName] && isNaN(Number(process.env[varName]))) {
      invalidNumbers.push(varName);
      hasErrors = true;
    }
  });

  // Log validation results
  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars);
  }
  if (emptyVars.length > 0) {
    logger.error('Empty environment variables:', emptyVars);
  }
  if (invalidUrls.length > 0) {
    logger.error('Invalid URL format for variables:', invalidUrls);
  }
  if (invalidNumbers.length > 0) {
    logger.error('Invalid numeric values for variables:', invalidNumbers);
  }

  if (hasErrors) {
    logger.error('Environment validation failed. Please fix the issues above before deploying.');
    process.exit(1);
  } else {
    logger.info('All environment variables validated successfully.');
    process.exit(0);
  }
}

validateEnv(); 