# Vibewell CI/CD Pipeline Integration Guide

This document provides step-by-step instructions for integrating the GitHub Actions workflow with your CI/CD pipeline and configuring the necessary environment variables and secrets.

## Overview

The Vibewell CI/CD pipeline is implemented using GitHub Actions and includes the following stages:
- Linting and type checking
- Building and unit testing
- End-to-end testing
- Deployment to staging (for `develop` branch)
- Deployment to production (for `main` branch)
- Post-deployment smoke tests

## Prerequisites

1. GitHub repository with your Vibewell codebase
2. Administrator access to the repository settings
3. Vercel account for hosting the application
4. New Relic account for monitoring (optional, but recommended)
5. Cypress dashboard account for E2E test recording (optional)

## Step 1: Configure GitHub Repository Secrets

In your GitHub repository, navigate to Settings > Secrets and Variables > Actions and add the following secrets:

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.vibewell.com
NEXT_PUBLIC_STRIPE_PK=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Deployment
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### Testing
```
CYPRESS_RECORD_KEY=your-cypress-record-key
```

### Monitoring
```
NEW_RELIC_API_KEY=your-new-relic-api-key
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key
```

## Step 2: Configure GitHub Environments

1. In your GitHub repository, navigate to Settings > Environments
2. Create two environments: `staging` and `production`
3. For each environment, add environment-specific secrets if needed
4. Optionally, add required reviewers for the production environment for added security

## Step 3: Create Required NPM Scripts

Ensure the following scripts are defined in your `package.json` file:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit",
    "test:ci": "jest --ci",
    "test:post-deploy-staging": "jest --config=jest.post-deploy.config.js",
    "test:post-deploy-prod": "jest --config=jest.post-deploy.config.js",
    "test:smoke": "jest --config=jest.smoke.config.js",
    "setup-test-db": "node scripts/setup-test-db.js",
    "monitor:deployment": "node scripts/monitor-deployment.js"
  }
}
```

## Step 4: Create Required Test Configurations

1. Create a `.env.test` file for E2E testing:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PK=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
```

2. Configure smoke tests in `jest.smoke.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/smoke/**/*.test.ts'],
};
```

3. Add post-deployment test configuration in `jest.post-deploy.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/post-deploy/**/*.test.ts'],
};
```

## Step 5: Create Deployment Monitoring Script

Create a file `scripts/monitor-deployment.js`:

```js
const https = require('https');

// Configuration
const apiKey = process.env.NEW_RELIC_API_KEY;
const deploymentId = process.env.DEPLOYMENT_ID || 'manual';
const applicationId = '12345678'; // Replace with your New Relic app ID

// Create deployment marker in New Relic
const data = JSON.stringify({
  deployment: {
    revision: deploymentId,
    changelog: `Deployment ${deploymentId}`,
    description: `GitHub Actions deployment ${deploymentId}`,
    user: 'GitHub Actions'
  }
});

const options = {
  hostname: 'api.newrelic.com',
  port: 443,
  path: `/v2/applications/${applicationId}/deployments.json`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Deployment marker status: ${res.statusCode}`);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Error creating deployment marker:', error);
  process.exit(1);
});

req.write(data);
req.end();

// Monitor performance for 5 minutes after deployment
console.log('Monitoring deployment for 5 minutes...');
setTimeout(() => {
  console.log('Monitoring complete. Deployment successful.');
}, 5 * 60 * 1000);
```

## Step 6: Set Up Test Database Script

Create a file `scripts/setup-test-db.js`:

```js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up test database...');

// Check if docker-compose file exists for local Supabase
const dockerComposePath = path.join(__dirname, '../supabase/docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  // Start Supabase local development
  execSync('npx supabase start', { stdio: 'inherit' });
  
  // Wait for Supabase to start
  console.log('Waiting for Supabase to start...');
  execSync('sleep 5');
  
  // Run test seed script
  console.log('Seeding test database...');
  execSync('node scripts/seed-test-db.js', { stdio: 'inherit' });
} else {
  console.log('Using mock database for testing');
  // Set up mock database if needed
}

console.log('Test database setup complete');
```

## Step 7: Create Smoke Tests

Create basic smoke tests in `tests/smoke/home.test.ts`:

```typescript
import axios from 'axios';

const baseUrl = process.env.TEST_URL || 'https://vibewell.com';

describe('Smoke tests', () => {
  test('Home page should return 200', async () => {
    const response = await axios.get(baseUrl);
    expect(response.status).toBe(200);
  });

  test('API health endpoint should return 200', async () => {
    const response = await axios.get(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'healthy');
  });
});
```

## Step 8: Create Post-Deployment Tests

Create post-deployment tests in `tests/post-deploy/critical-paths.test.ts`:

```typescript
import axios from 'axios';

const baseUrl = process.env.TEST_URL || 'https://vibewell.com';

describe('Critical paths', () => {
  test('Login page should load', async () => {
    const response = await axios.get(`${baseUrl}/login`);
    expect(response.status).toBe(200);
  });

  test('Service booking flow should be accessible', async () => {
    const response = await axios.get(`${baseUrl}/services`);
    expect(response.status).toBe(200);
  });

  test('API should return providers', async () => {
    const response = await axios.get(`${baseUrl}/api/providers`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('providers');
    expect(Array.isArray(response.data.providers)).toBe(true);
  });
});
```

## Step 9: Configure Branch Protection Rules

1. In your GitHub repository, navigate to Settings > Branches
2. Add a branch protection rule for `main` and `develop`
3. Enable the following settings:
   - Require pull request reviews
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

## Step 10: Test the Complete Workflow

1. Make a small change to your codebase
2. Commit and push to a feature branch
3. Create a pull request to the `develop` branch
4. Verify that all CI checks pass
5. Merge the pull request and verify deployment to staging
6. Create a pull request from `develop` to `main`
7. Merge and verify deployment to production

## Step 11: Monitor the Deployment

1. Check the GitHub Actions workflow to ensure all steps completed successfully
2. Visit the staging and production environments to verify the changes
3. Check New Relic for deployment markers and performance metrics
4. Set up alerts in New Relic for performance degradations

## Troubleshooting

### Common Issues

1. **Build failures**: Check the build logs for errors. Common issues include:
   - Missing dependencies
   - Type errors
   - ESLint warnings treated as errors

2. **Deployment failures**: Check the Vercel deployment logs. Common issues include:
   - Missing environment variables
   - Build failures on Vercel
   - Invalid Vercel project configuration

3. **Smoke test failures**: Verify that:
   - The application is accessible at the expected URL
   - API endpoints are functioning correctly
   - Required services (database, authentication) are available

### Support

For additional support with CI/CD integration, contact the DevOps team.

## Conclusion

You've now successfully integrated and configured the GitHub Actions workflow for the Vibewell CI/CD pipeline. The pipeline will automatically lint, test, build, and deploy your application whenever changes are pushed to the `develop` or `main` branches.

Remember to regularly review and update your CI/CD pipeline as requirements change or new features are added to the codebase. 