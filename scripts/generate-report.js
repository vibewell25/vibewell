#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const RESULTS_DIR = path.join(__dirname, '..', 'load-test-results');
const LATEST_RESULTS = findLatestJsonResult();

// Find the most recent JSON result file
function findLatestJsonResult() {
  try {
    const files = fs.readdirSync(RESULTS_DIR)
      .filter(file => file.includes('redis_rate_limit_test_') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('No test result files found in', RESULTS_DIR);
      process.exit(1);
    }
    
    return path.join(RESULTS_DIR, files[0]);
  } catch (error) {
    console.error('Error finding latest result file:', error.message);
    process.exit(1);
  }
}

// Parse JSON results
function parseResults(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing JSON results:', error.message);
    process.exit(1);
  }
}

// Generate HTML report
function generateReport(results) {
  const metrics = results.metrics || {};
  
  // Extract key metrics
  const successRate = metrics.success_rate ? 
    (metrics.success_rate.values.rate * 100).toFixed(2) : 'N/A';
  
  const rateLimitedRate = metrics.rate_limited_rate ? 
    (metrics.rate_limited_rate.values.rate * 100).toFixed(2) : 'N/A';
  
  const responseTime = metrics.response_time ? {
    avg: metrics.response_time.values.avg.toFixed(2),
    min: metrics.response_time.values.min.toFixed(2),
    max: metrics.response_time.values.max.toFixed(2),
    p90: metrics.response_time.values['p(90)'].toFixed(2),
    p95: metrics.response_time.values['p(95)'].toFixed(2)
  } : { avg: 'N/A', min: 'N/A', max: 'N/A', p90: 'N/A', p95: 'N/A' };
  
  const http = metrics.http_req_duration ? {
    avg: metrics.http_req_duration.values.avg.toFixed(2),
    min: metrics.http_req_duration.values.min.toFixed(2),
    max: metrics.http_req_duration.values.max.toFixed(2),
    p90: metrics.http_req_duration.values['p(90)'].toFixed(2),
    p95: metrics.http_req_duration.values['p(95)'].toFixed(2)
  } : { avg: 'N/A', min: 'N/A', max: 'N/A', p90: 'N/A', p95: 'N/A' };
  
  const requests = {
    total: metrics.http_reqs ? metrics.http_reqs.values.count : 'N/A',
    rate: metrics.http_reqs ? metrics.http_reqs.values.rate.toFixed(2) : 'N/A'
  };
  
  // Create results by status code
  const statusCodes = {};
  Object.keys(metrics).forEach(key => {
    if (key.startsWith('http_req_status_')) {
      const code = key.replace('http_req_status_', '');
      statusCodes[code] = metrics[key].values.count;
    }
  });
  
  // Format timestamp
  const timestamp = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Generate HTML content
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redis Rate Limiting Load Test Report</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      header {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 5px;
        margin-bottom: 30px;
        border-left: 5px solid #0066cc;
      }
      h1 {
        margin: 0;
        color: #0066cc;
      }
      .timestamp {
        color: #666;
        font-size: 0.9em;
      }
      .card {
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        padding: 20px;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .metric-value {
        font-size: 2em;
        font-weight: bold;
        margin: 10px 0;
        color: #0066cc;
      }
      .metric-description {
        color: #666;
        font-size: 0.9em;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background-color: #f8f9fa;
        font-weight: 600;
      }
      tr:hover {
        background-color: #f8f9fa;
      }
      .status-code {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 3px;
        margin-right: 5px;
        font-weight: bold;
      }
      .status-200 {
        background-color: #d4edda;
        color: #155724;
      }
      .status-429 {
        background-color: #fff3cd;
        color: #856404;
      }
      .status-error {
        background-color: #f8d7da;
        color: #721c24;
      }
      .chart-container {
        height: 300px;
        margin-bottom: 30px;
      }
      footer {
        margin-top: 50px;
        text-align: center;
        color: #666;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Redis Rate Limiting Load Test Report</h1>
      <p class="timestamp">Generated on ${formattedDate}</p>
    </header>
    
    <div class="card">
      <h2>Key Metrics</h2>
      <div class="metrics-grid">
        <div>
          <h3>Success Rate</h3>
          <div class="metric-value">${successRate}%</div>
          <p class="metric-description">Percentage of successful requests (HTTP 200)</p>
        </div>
        <div>
          <h3>Rate Limited</h3>
          <div class="metric-value">${rateLimitedRate}%</div>
          <p class="metric-description">Percentage of rate-limited requests (HTTP 429)</p>
        </div>
        <div>
          <h3>Total Requests</h3>
          <div class="metric-value">${requests.total}</div>
          <p class="metric-description">At ${requests.rate} requests per second</p>
        </div>
        <div>
          <h3>Avg Response Time</h3>
          <div class="metric-value">${responseTime.avg} ms</div>
          <p class="metric-description">Average response time in milliseconds</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>Detailed Metrics</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Avg</th>
            <th>Min</th>
            <th>Max</th>
            <th>p90</th>
            <th>p95</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Response Time (ms)</td>
            <td>${responseTime.avg}</td>
            <td>${responseTime.min}</td>
            <td>${responseTime.max}</td>
            <td>${responseTime.p90}</td>
            <td>${responseTime.p95}</td>
          </tr>
          <tr>
            <td>HTTP Request Duration (ms)</td>
            <td>${http.avg}</td>
            <td>${http.min}</td>
            <td>${http.max}</td>
            <td>${http.p90}</td>
            <td>${http.p95}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <h2>Status Code Distribution</h2>
      <table>
        <thead>
          <tr>
            <th>Status Code</th>
            <th>Count</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(statusCodes).map(([code, count]) => `
            <tr>
              <td>
                <span class="status-code ${
                  code === '200' ? 'status-200' : 
                  code === '429' ? 'status-429' : 'status-error'
                }">${code}</span>
              </td>
              <td>${count}</td>
              <td>${
                code === '200' ? 'Success' : 
                code === '429' ? 'Too Many Requests (Rate Limited)' : 'Error'
              }</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <footer>
      <p>Generated from ${path.basename(LATEST_RESULTS)} • Vibewell Application • ${timestamp}</p>
    </footer>
  </body>
  </html>
  `;
  
  return html;
}

// Write report to file
function writeReport(html) {
  const outputFile = LATEST_RESULTS.replace('.json', '-report.html');
  try {
    fs.writeFileSync(outputFile, html);
    console.log(`Report generated successfully: ${outputFile}`);
  } catch (error) {
    console.error('Error writing report:', error.message);
    process.exit(1);
  }
}

// Main execution
console.log(`Analyzing results from: ${LATEST_RESULTS}`);
const results = parseResults(LATEST_RESULTS);
const report = generateReport(results);
writeReport(report); 