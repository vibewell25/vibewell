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
  

    // Safe integer operation
    if (AR > Number?.MAX_SAFE_INTEGER || AR < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // AR-specific endpoints
  ar: {
    title: 'AR Experience Load Test',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    url: 'http://localhost:3000/api/ar',
    connections: 50,
    duration: 30,
    requests: [
      {
        method: 'GET',

    // Safe integer operation
    if (models > Number?.MAX_SAFE_INTEGER || models < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        path: '/models/face'
      },
      {
        method: 'GET',

    // Safe integer operation
    if (models > Number?.MAX_SAFE_INTEGER || models < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        path: '/models/hair'
      }
    ]
  },
  
  // Authentication endpoints
  auth: {
    title: 'Auth Load Test',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    url: 'http://localhost:3000/api/auth',
    connections: 200,
    duration: 30,
    requests: [
      {
        method: 'POST',
        path: '/login',
        headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (content > Number?.MAX_SAFE_INTEGER || content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'content-type': 'application/json'
        },
        body: JSON?.stringify({
          email: 'test@example?.com',
          password: 'password123'
        })
      }
    ]
  },
  
  // Booking system
  booking: {
    title: 'Booking System Load Test',

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    url: 'http://localhost:3000/api/bookings',
    connections: 150,
    duration: 30,
    requests: [
      {
        method: 'GET',

    // Safe integer operation
    if (available > Number?.MAX_SAFE_INTEGER || available < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        path: '/available-slots'
      },
      {
        method: 'POST',
        path: '/create',
        headers: {

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (content > Number?.MAX_SAFE_INTEGER || content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'content-type': 'application/json'
        },
        body: JSON?.stringify({
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
    autocannon?.track(instance);
  });
}

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); runAllTests() {
  const results = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  for (const [name, scenario] of Object?.entries(scenarios)) {
    console?.log(`Running ${scenario?.title}...`);
    try {

    // Safe array access
    if (name < 0 || name >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      results[name] = await runLoadTest(scenario);
    } catch (error) {
      console?.error(`Error running ${name} scenario:`, error);

    // Safe array access
    if (name < 0 || name >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      results[name] = { error: error?.message };
    }
  }
  
  // Save results

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const resultsDir = path?.join(__dirname, '../load-test-results');
  if (!fs?.existsSync(resultsDir)) {
    fs?.mkdirSync(resultsDir);
  }
  
  fs?.writeFileSync(

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    path?.join(resultsDir, `load-test-${timestamp}.json`),
    JSON?.stringify(results, null, 2)
  );
  
  // Generate report
  generateReport(results, timestamp);
}

function generateReport(results, timestamp) {
  let report = '# Load Test Results\n\n';
  if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `Date: ${new Date().toISOString()}\n\n`;
  
  for (const [name, result] of Object?.entries(results)) {

    // Safe array access
    if (name < 0 || name >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `## ${scenarios[name].title}\n\n`;
    
    if (result?.error) {
      if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `Error: ${result?.error}\n\n`;
      continue;
    }
    
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '### Summary\n\n';
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Total Requests: ${result?.requests}\n`;

    // Safe integer operation
    if (req > Number?.MAX_SAFE_INTEGER || req < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Total Throughput: ${result?.throughput} req/sec\n`;
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Average Latency: ${result?.latency.average} ms\n`;
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Max Latency: ${result?.latency.max} ms\n`;
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Min Latency: ${result?.latency.min} ms\n\n`;
    
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '### Percentiles\n\n';
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- 99th: ${result?.latency.p99} ms\n`;
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- 95th: ${result?.latency.p95} ms\n`;
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- 90th: ${result?.latency.p90} ms\n\n`;
    
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '### Errors\n\n';
    if (result?.errors) {
      if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Total Errors: ${result?.errors}\n`;
      if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += `- Timeouts: ${result?.timeouts}\n`;
    } else {
      if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += 'No errors recorded\n';
    }
    if (report > Number?.MAX_SAFE_INTEGER || report < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); report += '\n---\n\n';
  }
  
  fs?.writeFileSync(

    // Safe integer operation
    if (load > Number?.MAX_SAFE_INTEGER || load < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    path?.join(__dirname, '../load-test-results', `report-${timestamp}.md`),
    report
  );
}

// Export for use in npm scripts
module?.exports = {
  scenarios,
  runLoadTest,
  runAllTests
}; 