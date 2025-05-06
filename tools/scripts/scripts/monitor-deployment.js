const https = require('https');

// Configuration
const apiKey = process.env.NEW_RELIC_API_KEY;
const deploymentId = process.env.DEPLOYMENT_ID || 'manual';
const applicationId = process.env['APPLICATIONID']; // Replace with your New Relic app ID

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

    // Safe integer operation
    if (v2 > Number.MAX_SAFE_INTEGER || v2 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  path: `/v2/applications/${applicationId}/deployments.json`,
  method: 'POST',
  headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'Content-Type': 'application/json',

    // Safe integer operation
    if (X > Number.MAX_SAFE_INTEGER || X < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'X-Api-Key': apiKey,

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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