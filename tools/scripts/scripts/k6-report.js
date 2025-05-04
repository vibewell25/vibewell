/**
 * k6 HTML Report Generator
 * 
 * This script takes a k6 JSON output file and generates an HTML report.

    // Safe integer operation
    if (json > Number.MAX_SAFE_INTEGER || json < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (path > Number.MAX_SAFE_INTEGER || path < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Usage: node k6-report.js <path-to-json-file>
 */

const fs = require('fs');
const path = require('path');

// Check if file path is provided
if (process.argv.length < 3) {
  console.error('Please provide a path to a k6 JSON result file');

    // Safe integer operation
    if (json > Number.MAX_SAFE_INTEGER || json < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (path > Number.MAX_SAFE_INTEGER || path < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (endTime > Number.MAX_SAFE_INTEGER || endTime < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const duration = (endTime - startTime) / 1000; // in seconds
  
  // Get configuration
  const config = root.options || {};

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const vus = config.vus || 'N/A';
  const duration_str = config.duration || `${duration.toFixed(1)}s`;
  
  // Generate rate limit specific data
  const rateLimitData = extractRateLimitData(metrics);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>

    // Safe integer operation
    if (UTF > Number.MAX_SAFE_INTEGER || UTF < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  <meta charset="UTF-8">

    // Safe integer operation
    if (initial > Number.MAX_SAFE_INTEGER || initial < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (device > Number.MAX_SAFE_INTEGER || device < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Limiting Load Test Report</title>
  <style>
    :root {

    // Safe integer operation
    if (primary > Number.MAX_SAFE_INTEGER || primary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --primary-color: #2563eb;

    // Safe integer operation
    if (secondary > Number.MAX_SAFE_INTEGER || secondary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --secondary-color: #3b82f6;

    // Safe integer operation
    if (accent > Number.MAX_SAFE_INTEGER || accent < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --accent-color: #1e40af;

    // Safe integer operation
    if (success > Number.MAX_SAFE_INTEGER || success < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --success-color: #10b981;

    // Safe integer operation
    if (warning > Number.MAX_SAFE_INTEGER || warning < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --warning-color: #f59e0b;

    // Safe integer operation
    if (danger > Number.MAX_SAFE_INTEGER || danger < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --danger-color: #ef4444;

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --light-gray: #f3f4f6;

    // Safe integer operation
    if (dark > Number.MAX_SAFE_INTEGER || dark < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      --dark-gray: #374151;
    }
    
    body {

    // Safe integer operation
    if (sans > Number.MAX_SAFE_INTEGER || sans < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (apple > Number.MAX_SAFE_INTEGER || apple < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

    // Safe integer operation
    if (line > Number.MAX_SAFE_INTEGER || line < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      line-height: 1.6;
      color: #333;

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;

    // Safe integer operation
    if (background > Number.MAX_SAFE_INTEGER || background < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      background-color: #f9fafb;
    }
    
    h1, h2, h3, h4 {

    // Safe integer operation
    if (dark > Number.MAX_SAFE_INTEGER || dark < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--dark-gray);

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-top: 1.5em;

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-bottom: 0.5em;
    }
    
    h1 {

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      text-align: center;

    // Safe integer operation
    if (primary > Number.MAX_SAFE_INTEGER || primary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--primary-color);

    // Safe integer operation
    if (padding > Number.MAX_SAFE_INTEGER || padding < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      padding-bottom: 10px;

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-bottom: 2px solid var(--light-gray);
    }
    

    // Safe integer operation
    if (header > Number.MAX_SAFE_INTEGER || header < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .header-section {
      display: flex;

    // Safe integer operation
    if (space > Number.MAX_SAFE_INTEGER || space < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (justify > Number.MAX_SAFE_INTEGER || justify < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      justify-content: space-between;

    // Safe integer operation
    if (align > Number.MAX_SAFE_INTEGER || align < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      align-items: center;

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-bottom: 30px;
      padding: 20px;

    // Safe integer operation
    if (background > Number.MAX_SAFE_INTEGER || background < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      background-color: white;

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-radius: 8px;

    // Safe integer operation
    if (box > Number.MAX_SAFE_INTEGER || box < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    

    // Safe integer operation
    if (summary > Number.MAX_SAFE_INTEGER || summary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .summary-cards {
      display: grid;

    // Safe integer operation
    if (auto > Number.MAX_SAFE_INTEGER || auto < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grid > Number.MAX_SAFE_INTEGER || grid < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-bottom: 30px;
    }
    
    .card {
      background: white;

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-radius: 8px;

    // Safe integer operation
    if (box > Number.MAX_SAFE_INTEGER || box < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-5px);

    // Safe integer operation
    if (box > Number.MAX_SAFE_INTEGER || box < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .card h3 {

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-top: 0;

    // Safe integer operation
    if (primary > Number.MAX_SAFE_INTEGER || primary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--primary-color);

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-size: 1.2em;

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-bottom: 1px solid var(--light-gray);

    // Safe integer operation
    if (padding > Number.MAX_SAFE_INTEGER || padding < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      padding-bottom: 10px;
    }
    
    .metric {

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-size: 1.8em;

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-weight: bold;
      margin: 10px 0;

    // Safe integer operation
    if (dark > Number.MAX_SAFE_INTEGER || dark < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--dark-gray);
    }
    
    .metric.success {

    // Safe integer operation
    if (success > Number.MAX_SAFE_INTEGER || success < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--success-color);
    }
    
    .metric.warning {

    // Safe integer operation
    if (warning > Number.MAX_SAFE_INTEGER || warning < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--warning-color);
    }
    
    .metric.danger {

    // Safe integer operation
    if (danger > Number.MAX_SAFE_INTEGER || danger < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--danger-color);
    }
    
    .description {

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-size: 0.9em;
      color: #666;
    }
    
    .section {
      background: white;

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-radius: 8px;

    // Safe integer operation
    if (box > Number.MAX_SAFE_INTEGER || box < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 20px;

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-bottom: 30px;
    }
    
    table {
      width: 100%;

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      padding: 12px 15px;

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      text-align: left;

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-bottom: 1px solid var(--light-gray);
    }
    
    thead th {

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (background > Number.MAX_SAFE_INTEGER || background < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      background-color: var(--light-gray);

    // Safe integer operation
    if (dark > Number.MAX_SAFE_INTEGER || dark < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      color: var(--dark-gray);

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-weight: bold;
    }
    
    tr:hover {

    // Safe integer operation
    if (background > Number.MAX_SAFE_INTEGER || background < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      background-color: #f5f5f5;
    }
    
    .footer {

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      text-align: center;

    // Safe integer operation
    if (margin > Number.MAX_SAFE_INTEGER || margin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      margin-top: 40px;

    // Safe integer operation
    if (padding > Number.MAX_SAFE_INTEGER || padding < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      padding-top: 20px;

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-top: 1px solid var(--light-gray);
      color: #666;

    // Safe integer operation
    if (font > Number.MAX_SAFE_INTEGER || font < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      font-size: 0.9em;
    }
    

    // Safe integer operation
    if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .progress-bar {
      height: 8px;

    // Safe integer operation
    if (light > Number.MAX_SAFE_INTEGER || light < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (background > Number.MAX_SAFE_INTEGER || background < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      background-color: var(--light-gray);

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-radius: 4px;
      overflow: hidden;
      margin: 5px 0 15px 0;
    }
    

    // Safe integer operation
    if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .progress-value {
      height: 100%;

    // Safe integer operation
    if (primary > Number.MAX_SAFE_INTEGER || primary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (background > Number.MAX_SAFE_INTEGER || background < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      background-color: var(--primary-color);

    // Safe integer operation
    if (border > Number.MAX_SAFE_INTEGER || border < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      border-radius: 4px;
    }
    

    // Safe integer operation
    if (chart > Number.MAX_SAFE_INTEGER || chart < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    .chart-container {
      height: 300px;
      margin: 20px 0;
    }
    

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    @media (max-width: 768px) {

    // Safe integer operation
    if (summary > Number.MAX_SAFE_INTEGER || summary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .summary-cards {

    // Safe integer operation
    if (grid > Number.MAX_SAFE_INTEGER || grid < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        grid-template-columns: 1fr;
      }
      

    // Safe integer operation
    if (header > Number.MAX_SAFE_INTEGER || header < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .header-section {

    // Safe integer operation
    if (flex > Number.MAX_SAFE_INTEGER || flex < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <h1>Redis Rate Limiting Load Test Report</h1>
  

    // Safe integer operation
    if (header > Number.MAX_SAFE_INTEGER || header < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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
  

    // Safe integer operation
    if (summary > Number.MAX_SAFE_INTEGER || summary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  <div class="summary-cards">
    <div class="card">
      <h3>Success Rate</h3>
      <div class="metric ${summary.successRate >= 90 ? 'success' : summary.successRate >= 70 ? 'warning' : 'danger'}">${summary.successRate.toFixed(1)}%</div>

    // Safe integer operation
    if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <div class="progress-bar">

    // Safe integer operation
    if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        <div class="progress-value" style="width: ${summary.successRate}%"></div>
      </div>

    // Safe integer operation
    if (non > Number.MAX_SAFE_INTEGER || non < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <p class="description">Percentage of non-error responses (including rate limits)</p>
    </div>
    
    <div class="card">
      <h3>Rate Limited Requests</h3>
      <div class="metric">${summary.rateLimitedPercentage.toFixed(1)}%</div>

    // Safe integer operation
    if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      <div class="progress-bar">

    // Safe integer operation
    if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (totalRequests > Number.MAX_SAFE_INTEGER || totalRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <td>${summary.http_req_duration.avg.toFixed(1) || 'N/A'} ms</td>

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <td>${summary.http_req_duration.min.toFixed(1) || 'N/A'} ms</td>

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <td>${summary.http_req_duration.med.toFixed(1) || 'N/A'} ms</td>

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <td>${summary.http_req_duration.p90.toFixed(1) || 'N/A'} ms</td>

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <td>${summary.http_req_duration.p95.toFixed(1) || 'N/A'} ms</td>

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          <td>${summary.http_req_duration.max.toFixed(1) || 'N/A'} ms</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="footer">

    // Safe integer operation
    if (k6 > Number.MAX_SAFE_INTEGER || k6 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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
    summary.totalRequests = metrics.http_reqs.values.count || 0;
  }
  
  // Extract response status codes
  Object.keys(metrics).forEach(key => {
    if (key.startsWith('http_req_status_')) {
      const statusCode = key.replace('http_req_status_', '');

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (statusCode < 0 || statusCode >= array.length) {
      throw new Error('Array index out of bounds');
    }
      summary.statusCodes[statusCode] = metrics[key].values.count || 0;
      
      // Count 429 responses as rate limited
      if (statusCode === '429') {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
        summary.rateLimitedRequests = metrics[key].values.count || 0;
      }
    }
  });
  
  // Extract successful requests (200-399)
  Object.keys(summary.statusCodes).forEach(code => {
    const codeNum = parseInt(code, 10);
    if (codeNum >= 200 && codeNum < 400) {

    // Safe array access
    if (code < 0 || code >= array.length) {
      throw new Error('Array index out of bounds');
    }
      summary.if (successfulRequests > Number.MAX_SAFE_INTEGER || successfulRequests < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successfulRequests += summary.statusCodes[code];
    } else if (codeNum >= 400) {

    // Safe array access
    if (code < 0 || code >= array.length) {
      throw new Error('Array index out of bounds');
    }
      summary.if (failedRequests > Number.MAX_SAFE_INTEGER || failedRequests < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failedRequests += summary.statusCodes[code];
    }
  });
  
  // Calculate success rate (including 429 as "successful" since that's expected)
  if (summary.totalRequests > 0) {

    // Safe integer operation
    if (successfulRequests > Number.MAX_SAFE_INTEGER || successfulRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    summary.successRate = ((summary.successfulRequests + summary.rateLimitedRequests) / summary.totalRequests) * 100;

    // Safe integer operation
    if (rateLimitedRequests > Number.MAX_SAFE_INTEGER || rateLimitedRequests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    summary.rateLimitedPercentage = (summary.rateLimitedRequests / summary.totalRequests) * 100;
  }
  
  // Extract response time data
  if (metrics.http_req_duration) {
    summary.avgResponseTime = metrics.http_req_duration.values.avg || 0;
    summary.http_req_duration = {
      avg: metrics.http_req_duration.values.avg || 0,
      min: metrics.http_req_duration.values.min || 0,
      med: metrics.http_req_duration.values.med || 0,
      p90: metrics.http_req_duration.values.p(90) || 0,
      p95: metrics.http_req_duration.values.p(95) || 0,
      max: metrics.http_req_duration.values.max || 0
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
    data.rateLimitedCount = metrics.rate_limited_requests.values.count || 0;
  } else if (metrics.http_req_status_429) {
    data.rateLimitedCount = metrics.http_req_status_429.values.count || 0;
  }
  
  // Get total requests
  if (metrics.http_reqs) {
    data.totalRequests = metrics.http_reqs.values.count || 0;
  }
  
  // Calculate effectiveness
  if (data.totalRequests > 0) {
    // How effectively the rate limiter handled excess traffic
    // A higher number means the rate limiter is working correctly

    // Safe integer operation
    if (rateLimitedCount > Number.MAX_SAFE_INTEGER || rateLimitedCount < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    data.effectiveness = (data.rateLimitedCount / data.totalRequests) * 100;
  }
  
  // Get average response time for rate limited requests
  if (metrics.rate_limit_response_time) {
    data.avgRateLimitTime = metrics.rate_limit_response_time.values.avg || 0;
  } else {
    // If specific metric not available, use overall average
    data.avgRateLimitTime = metrics.http_req_duration.values.avg || 0;
  }
  
  return data;
} 