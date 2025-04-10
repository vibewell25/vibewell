/**
 * k6 HTML Report Generator
 * 
 * This script takes a k6 JSON output file and generates an HTML report.
 * Usage: node k6-report.js <path-to-json-file>
 */

const fs = require('fs');
const path = require('path');

// Check if file path is provided
if (process.argv.length < 3) {
  console.error('Please provide a path to a k6 JSON result file');
  console.error('Usage: node k6-report.js <path-to-json-file>');
  process.exit(1);
}

// Get the file path from command line args
const filePath = process.argv[2];

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Extract data from the JSON
  const metrics = jsonData.metrics || {};
  const metadata = jsonData.metadata || {};
  const root = jsonData.root || {};
  
  // Generate the HTML report
  const html = generateHtmlReport(metrics, metadata, root);
  
  // Output the HTML to stdout
  console.log(html);
  
} catch (error) {
  console.error('Error processing the file:', error.message);
  process.exit(1);
}

/**
 * Generate an HTML report from k6 metrics
 */
function generateHtmlReport(metrics, metadata, root) {
  // Calculate summary data
  const summary = calculateSummary(metrics);
  
  // Format dates
  const startTime = new Date(metadata.startTime || root.startTime || Date.now());
  const endTime = new Date(metadata.endTime || root.endTime || Date.now());
  const duration = (endTime - startTime) / 1000; // in seconds
  
  // Get configuration
  const config = root.options || {};
  const vus = config.vus || 'N/A';
  const duration_str = config.duration || `${duration.toFixed(1)}s`;
  
  // Generate rate limit specific data
  const rateLimitData = extractRateLimitData(metrics);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Limiting Load Test Report</title>
  <style>
    :root {
      --primary-color: #2563eb;
      --secondary-color: #3b82f6;
      --accent-color: #1e40af;
      --success-color: #10b981;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      --light-gray: #f3f4f6;
      --dark-gray: #374151;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    
    h1, h2, h3, h4 {
      color: var(--dark-gray);
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    
    h1 {
      text-align: center;
      color: var(--primary-color);
      padding-bottom: 10px;
      border-bottom: 2px solid var(--light-gray);
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      margin-top: 0;
      color: var(--primary-color);
      font-size: 1.2em;
      border-bottom: 1px solid var(--light-gray);
      padding-bottom: 10px;
    }
    
    .metric {
      font-size: 1.8em;
      font-weight: bold;
      margin: 10px 0;
      color: var(--dark-gray);
    }
    
    .metric.success {
      color: var(--success-color);
    }
    
    .metric.warning {
      color: var(--warning-color);
    }
    
    .metric.danger {
      color: var(--danger-color);
    }
    
    .description {
      font-size: 0.9em;
      color: #666;
    }
    
    .section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      margin-bottom: 30px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--light-gray);
    }
    
    thead th {
      background-color: var(--light-gray);
      color: var(--dark-gray);
      font-weight: bold;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--light-gray);
      color: #666;
      font-size: 0.9em;
    }
    
    .progress-bar {
      height: 8px;
      background-color: var(--light-gray);
      border-radius: 4px;
      overflow: hidden;
      margin: 5px 0 15px 0;
    }
    
    .progress-value {
      height: 100%;
      background-color: var(--primary-color);
      border-radius: 4px;
    }
    
    .chart-container {
      height: 300px;
      margin: 20px 0;
    }
    
    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .header-section {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <h1>Redis Rate Limiting Load Test Report</h1>
  
  <div class="header-section">
    <div>
      <p><strong>Start Time:</strong> ${startTime.toLocaleString()}</p>
      <p><strong>End Time:</strong> ${endTime.toLocaleString()}</p>
      <p><strong>Duration:</strong> ${duration.toFixed(1)} seconds</p>
    </div>
    <div>
      <p><strong>Virtual Users:</strong> ${vus}</p>
      <p><strong>Test Duration:</strong> ${duration_str}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
  </div>
  
  <div class="summary-cards">
    <div class="card">
      <h3>Success Rate</h3>
      <div class="metric ${summary.successRate >= 90 ? 'success' : summary.successRate >= 70 ? 'warning' : 'danger'}">${summary.successRate.toFixed(1)}%</div>
      <div class="progress-bar">
        <div class="progress-value" style="width: ${summary.successRate}%"></div>
      </div>
      <p class="description">Percentage of non-error responses (including rate limits)</p>
    </div>
    
    <div class="card">
      <h3>Rate Limited Requests</h3>
      <div class="metric">${summary.rateLimitedPercentage.toFixed(1)}%</div>
      <div class="progress-bar">
        <div class="progress-value" style="width: ${summary.rateLimitedPercentage}%"></div>
      </div>
      <p class="description">Percentage of requests that were rate limited</p>
    </div>
    
    <div class="card">
      <h3>Response Time</h3>
      <div class="metric ${summary.avgResponseTime < 200 ? 'success' : summary.avgResponseTime < 500 ? 'warning' : 'danger'}">${summary.avgResponseTime.toFixed(1)} ms</div>
      <p class="description">Average response time for all requests</p>
    </div>
    
    <div class="card">
      <h3>Total Requests</h3>
      <div class="metric">${summary.totalRequests}</div>
      <p class="description">Total number of HTTP requests made</p>
    </div>
  </div>
  
  <div class="section">
    <h2>Rate Limiting Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Rate Limited Requests</td>
          <td>${rateLimitData.rateLimitedCount}</td>
          <td>Total requests that received a 429 status code</td>
        </tr>
        <tr>
          <td>Rate Limiting Effectiveness</td>
          <td>${rateLimitData.effectiveness.toFixed(1)}%</td>
          <td>How effectively the rate limiter is stopping excess traffic</td>
        </tr>
        <tr>
          <td>Avg. Response Time (All)</td>
          <td>${summary.avgResponseTime.toFixed(1)} ms</td>
          <td>Average response time across all requests</td>
        </tr>
        <tr>
          <td>Avg. Response Time (Rate Limited)</td>
          <td>${rateLimitData.avgRateLimitTime.toFixed(1)} ms</td>
          <td>Average response time for rate limited requests</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>HTTP Response Codes</h2>
    <table>
      <thead>
        <tr>
          <th>Status Code</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(summary.statusCodes).map(([code, count]) => {
          const percentage = (count / summary.totalRequests * 100).toFixed(1);
          return `
        <tr>
          <td>${code}</td>
          <td>${count}</td>
          <td>${percentage}%</td>
        </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Performance Metrics</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Avg</th>
          <th>Min</th>
          <th>Median</th>
          <th>p90</th>
          <th>p95</th>
          <th>Max</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>HTTP Request Duration</td>
          <td>${summary.http_req_duration?.avg.toFixed(1) || 'N/A'} ms</td>
          <td>${summary.http_req_duration?.min.toFixed(1) || 'N/A'} ms</td>
          <td>${summary.http_req_duration?.med.toFixed(1) || 'N/A'} ms</td>
          <td>${summary.http_req_duration?.p90.toFixed(1) || 'N/A'} ms</td>
          <td>${summary.http_req_duration?.p95.toFixed(1) || 'N/A'} ms</td>
          <td>${summary.http_req_duration?.max.toFixed(1) || 'N/A'} ms</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <p>Generated using k6-report.js | Test Data from k6.io | ${new Date().toISOString()}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Calculate summary metrics from k6 data
 */
function calculateSummary(metrics) {
  const summary = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimitedRequests: 0,
    successRate: 0,
    rateLimitedPercentage: 0,
    avgResponseTime: 0,
    statusCodes: {},
    http_req_duration: {
      avg: 0,
      min: 0,
      med: 0,
      p90: 0,
      p95: 0,
      max: 0
    }
  };
  
  // Extract HTTP requests data
  if (metrics.http_reqs) {
    summary.totalRequests = metrics.http_reqs.values?.count || 0;
  }
  
  // Extract response status codes
  Object.keys(metrics).forEach(key => {
    if (key.startsWith('http_req_status_')) {
      const statusCode = key.replace('http_req_status_', '');
      summary.statusCodes[statusCode] = metrics[key].values?.count || 0;
      
      // Count 429 responses as rate limited
      if (statusCode === '429') {
        summary.rateLimitedRequests = metrics[key].values?.count || 0;
      }
    }
  });
  
  // Extract successful requests (200-399)
  Object.keys(summary.statusCodes).forEach(code => {
    const codeNum = parseInt(code, 10);
    if (codeNum >= 200 && codeNum < 400) {
      summary.successfulRequests += summary.statusCodes[code];
    } else if (codeNum >= 400) {
      summary.failedRequests += summary.statusCodes[code];
    }
  });
  
  // Calculate success rate (including 429 as "successful" since that's expected)
  if (summary.totalRequests > 0) {
    summary.successRate = ((summary.successfulRequests + summary.rateLimitedRequests) / summary.totalRequests) * 100;
    summary.rateLimitedPercentage = (summary.rateLimitedRequests / summary.totalRequests) * 100;
  }
  
  // Extract response time data
  if (metrics.http_req_duration) {
    summary.avgResponseTime = metrics.http_req_duration.values?.avg || 0;
    summary.http_req_duration = {
      avg: metrics.http_req_duration.values?.avg || 0,
      min: metrics.http_req_duration.values?.min || 0,
      med: metrics.http_req_duration.values?.med || 0,
      p90: metrics.http_req_duration.values?.p(90) || 0,
      p95: metrics.http_req_duration.values?.p(95) || 0,
      max: metrics.http_req_duration.values?.max || 0
    };
  }
  
  return summary;
}

/**
 * Extract rate limiting specific data
 */
function extractRateLimitData(metrics) {
  const data = {
    rateLimitedCount: 0,
    totalRequests: 0,
    effectiveness: 0,
    avgRateLimitTime: 0
  };
  
  // Get rate limited count
  if (metrics.rate_limited_requests) {
    data.rateLimitedCount = metrics.rate_limited_requests.values?.count || 0;
  } else if (metrics.http_req_status_429) {
    data.rateLimitedCount = metrics.http_req_status_429.values?.count || 0;
  }
  
  // Get total requests
  if (metrics.http_reqs) {
    data.totalRequests = metrics.http_reqs.values?.count || 0;
  }
  
  // Calculate effectiveness
  if (data.totalRequests > 0) {
    // How effectively the rate limiter handled excess traffic
    // A higher number means the rate limiter is working correctly
    data.effectiveness = (data.rateLimitedCount / data.totalRequests) * 100;
  }
  
  // Get average response time for rate limited requests
  if (metrics.rate_limit_response_time) {
    data.avgRateLimitTime = metrics.rate_limit_response_time.values?.avg || 0;
  } else {
    // If specific metric not available, use overall average
    data.avgRateLimitTime = metrics.http_req_duration?.values?.avg || 0;
  }
  
  return data;
} 