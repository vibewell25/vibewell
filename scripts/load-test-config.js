const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

const scenarios = {
  // Basic API endpoints
  api: {
    title: 'API Load Test',
    url: 'http://localhost:3000/api',
    connections: 100,
    pipelining: 10,
    duration: 30,
    requests: [
      {
        method: 'GET',
        path: '/services'
      },
      {
        method: 'GET',
        path: '/providers'
      }
    ]
  },
  
  // AR-specific endpoints
  ar: {
    title: 'AR Experience Load Test',
    url: 'http://localhost:3000/api/ar',
    connections: 50,
    duration: 30,
    requests: [
      {
        method: 'GET',
        path: '/models/face'
      },
      {
        method: 'GET',
        path: '/models/hair'
      }
    ]
  },
  
  // Authentication endpoints
  auth: {
    title: 'Auth Load Test',
    url: 'http://localhost:3000/api/auth',
    connections: 200,
    duration: 30,
    requests: [
      {
        method: 'POST',
        path: '/login',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      }
    ]
  },
  
  // Booking system
  booking: {
    title: 'Booking System Load Test',
    url: 'http://localhost:3000/api/bookings',
    connections: 150,
    duration: 30,
    requests: [
      {
        method: 'GET',
        path: '/available-slots'
      },
      {
        method: 'POST',
        path: '/create',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          serviceId: '123',
          date: '2024-03-20',
          time: '14:00'
        })
      }
    ]
  }
};

function runLoadTest(scenario) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(scenario, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
    
    // Log progress
    autocannon.track(instance);
  });
}

async function runAllTests() {
  const results = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  for (const [name, scenario] of Object.entries(scenarios)) {
    console.log(`Running ${scenario.title}...`);
    try {
      results[name] = await runLoadTest(scenario);
    } catch (error) {
      console.error(`Error running ${name} scenario:`, error);
      results[name] = { error: error.message };
    }
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../load-test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  fs.writeFileSync(
    path.join(resultsDir, `load-test-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );
  
  // Generate report
  generateReport(results, timestamp);
}

function generateReport(results, timestamp) {
  let report = '# Load Test Results\n\n';
  report += `Date: ${new Date().toISOString()}\n\n`;
  
  for (const [name, result] of Object.entries(results)) {
    report += `## ${scenarios[name].title}\n\n`;
    
    if (result.error) {
      report += `Error: ${result.error}\n\n`;
      continue;
    }
    
    report += '### Summary\n\n';
    report += `- Total Requests: ${result.requests}\n`;
    report += `- Total Throughput: ${result.throughput} req/sec\n`;
    report += `- Average Latency: ${result.latency.average} ms\n`;
    report += `- Max Latency: ${result.latency.max} ms\n`;
    report += `- Min Latency: ${result.latency.min} ms\n\n`;
    
    report += '### Percentiles\n\n';
    report += `- 99th: ${result.latency.p99} ms\n`;
    report += `- 95th: ${result.latency.p95} ms\n`;
    report += `- 90th: ${result.latency.p90} ms\n\n`;
    
    report += '### Errors\n\n';
    if (result.errors) {
      report += `- Total Errors: ${result.errors}\n`;
      report += `- Timeouts: ${result.timeouts}\n`;
    } else {
      report += 'No errors recorded\n';
    }
    report += '\n---\n\n';
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../load-test-results', `report-${timestamp}.md`),
    report
  );
}

// Export for use in npm scripts
module.exports = {
  scenarios,
  runLoadTest,
  runAllTests
}; 