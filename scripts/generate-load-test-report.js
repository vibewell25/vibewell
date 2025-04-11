/**
 * Generate HTML report from K6 load test results
 * 
 * This script takes the JSON output from K6 tests and generates an HTML report
 * with visualizations of the test results.
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const resultsDir = process.argv[2] || './load-test-results';
const timestamp = process.argv[3] || new Date().toISOString().replace(/:/g, '-').split('.')[0];

// HTML template for the report
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redis Rate Limiting Load Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .card {
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      margin-bottom: 20px;
      padding: 20px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .metric {
      padding: 15px;
      border-radius: 5px;
      background-color: #f8f9fa;
    }
    .metric-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .metric-value {
      font-size: 24px;
      color: #3498db;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .chart-container {
      height: 300px;
      margin-top: 20px;
    }
    .success {
      color: #27ae60;
    }
    .warning {
      color: #f39c12;
    }
    .danger {
      color: #e74c3c;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>Redis Rate Limiting Load Test Report</h1>
    <p>Test run: {{timestamp}}</p>

    <div class="card">
      <h2>Summary</h2>
      <div class="metrics-grid">
        <div class="metric">
          <div class="metric-title">Total Requests</div>
          <div class="metric-value">{{totalRequests}}</div>
        </div>
        <div class="metric">
          <div class="metric-title">Success Rate</div>
          <div class="metric-value {{successRateClass}}">{{successRate}}%</div>
        </div>
        <div class="metric">
          <div class="metric-title">Rate Limited Requests</div>
          <div class="metric-value">{{rateLimitedRequests}} ({{rateLimitedPercentage}}%)</div>
        </div>
        <div class="metric">
          <div class="metric-title">Avg Response Time</div>
          <div class="metric-value">{{avgResponseTime}}ms</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Request Metrics by Endpoint Type</h2>
      <canvas id="requestsChart" class="chart-container"></canvas>
    </div>

    <div class="card">
      <h2>Response Time Distribution</h2>
      <canvas id="responseTimeChart" class="chart-container"></canvas>
    </div>

    <div class="card">
      <h2>Rate Limiting Effectiveness</h2>
      <canvas id="rateLimitChart" class="chart-container"></canvas>
    </div>

    <div class="card">
      <h2>Detailed Metrics</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Min</th>
            <th>Avg</th>
            <th>Median</th>
            <th>P90</th>
            <th>P95</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          {{tableRows}}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    // Chart data
    const requestsData = {{requestsChartData}};
    const responseTimeData = {{responseTimeChartData}};
    const rateLimitData = {{rateLimitChartData}};

    // Create charts
    window.onload = function() {
      // Requests by endpoint type
      new Chart(document.getElementById('requestsChart'), {
        type: 'bar',
        data: {
          labels: requestsData.labels,
          datasets: [{
            label: 'Successful Requests',
            data: requestsData.successData,
            backgroundColor: 'rgba(46, 204, 113, 0.7)',
          }, {
            label: 'Rate Limited Requests',
            data: requestsData.limitedData,
            backgroundColor: 'rgba(231, 76, 60, 0.7)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true
            }
          }
        }
      });

      // Response time distribution
      new Chart(document.getElementById('responseTimeChart'), {
        type: 'line',
        data: {
          labels: responseTimeData.labels,
          datasets: [{
            label: 'Response Time (ms)',
            data: responseTimeData.data,
            borderColor: 'rgba(52, 152, 219, 1)',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Rate limiting effectiveness
      new Chart(document.getElementById('rateLimitChart'), {
        type: 'line',
        data: {
          labels: rateLimitData.labels,
          datasets: [{
            label: 'Requests',
            data: rateLimitData.requestsData,
            borderColor: 'rgba(52, 152, 219, 1)',
            backgroundColor: 'transparent',
            yAxisID: 'y'
          }, {
            label: 'Rate Limited (%)',
            data: rateLimitData.rateLimitedData,
            borderColor: 'rgba(231, 76, 60, 1)',
            backgroundColor: 'transparent',
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Requests'
              }
            },
            y1: {
              position: 'right',
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Rate Limited (%)'
              }
            }
          }
        }
      });
    };
  </script>
</body>
</html>
`;

// Process all JSON result files
function processResults() {
  try {
    // Read all JSON files in the results directory
    const files = fs.readdirSync(resultsDir)
      .filter(file => file.endsWith('.json') && file.includes(timestamp));
    
    if (files.length === 0) {
      console.error(`No JSON result files found for timestamp ${timestamp}`);
      return;
    }
    
    console.log(`Processing ${files.length} result files...`);
    
    // Aggregate data from all files
    const aggregatedData = {
      totalRequests: 0,
      successfulRequests: 0,
      rateLimitedRequests: 0,
      responseTimeValues: [],
      endpoints: {
        general: { total: 0, limited: 0 },
        auth: { total: 0, limited: 0 },
        sensitive: { total: 0, limited: 0 },
        admin: { total: 0, limited: 0 }
      },
      timePoints: [],
      metrics: {}
    };
    
    // Process each file
    files.forEach(file => {
      const filePath = path.join(resultsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Determine endpoint type from filename
      let endpointType = 'general';
      if (file.includes('auth')) endpointType = 'auth';
      else if (file.includes('sensitive')) endpointType = 'sensitive';
      else if (file.includes('admin')) endpointType = 'admin';
      
      // Process metrics
      if (data.metrics) {
        // Count requests
        if (data.metrics.http_reqs) {
          const reqCount = data.metrics.http_reqs.count || 0;
          aggregatedData.totalRequests += reqCount;
          aggregatedData.endpoints[endpointType].total += reqCount;
        }
        
        // Count rate limited requests
        if (data.metrics.rate_limited_rate) {
          const limitedCount = Math.round((data.metrics.rate_limited_rate.value || 0) * aggregatedData.totalRequests);
          aggregatedData.rateLimitedRequests += limitedCount;
          aggregatedData.endpoints[endpointType].limited += limitedCount;
        }
        
        // Success rate
        if (data.metrics.success_rate) {
          aggregatedData.successfulRequests += Math.round((data.metrics.success_rate.value || 0) * aggregatedData.totalRequests);
        }
        
        // Response times
        if (data.metrics.response_time) {
          aggregatedData.responseTimeValues.push(...(data.metrics.response_time.values || []));
        }
        
        // Collect all metrics for detailed table
        Object.keys(data.metrics).forEach(metricName => {
          if (!aggregatedData.metrics[metricName]) {
            aggregatedData.metrics[metricName] = {
              values: [],
              min: Infinity,
              max: -Infinity,
              avg: 0,
              med: 0,
              p90: 0,
              p95: 0
            };
          }
          
          const metric = data.metrics[metricName];
          
          if (metric.values) {
            aggregatedData.metrics[metricName].values.push(...metric.values);
          }
          
          aggregatedData.metrics[metricName].min = Math.min(aggregatedData.metrics[metricName].min, metric.min || Infinity);
          aggregatedData.metrics[metricName].max = Math.max(aggregatedData.metrics[metricName].max, metric.max || -Infinity);
        });
      }
      
      // Process time series data for charts
      if (data.timeSeries) {
        data.timeSeries.forEach(point => {
          aggregatedData.timePoints.push({
            time: point.time,
            metrics: point.metrics
          });
        });
      }
    });
    
    // Calculate aggregate metrics
    Object.keys(aggregatedData.metrics).forEach(metricName => {
      const metric = aggregatedData.metrics[metricName];
      if (metric.values.length > 0) {
        const sorted = [...metric.values].sort((a, b) => a - b);
        metric.avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
        metric.med = sorted[Math.floor(sorted.length / 2)];
        metric.p90 = sorted[Math.floor(sorted.length * 0.9)];
        metric.p95 = sorted[Math.floor(sorted.length * 0.95)];
      }
    });
    
    // Calculate success rate percentage
    const successRate = aggregatedData.totalRequests > 0 
      ? (aggregatedData.successfulRequests / aggregatedData.totalRequests * 100).toFixed(2)
      : '0.00';
    
    // Calculate rate limited percentage
    const rateLimitedPercentage = aggregatedData.totalRequests > 0
      ? (aggregatedData.rateLimitedRequests / aggregatedData.totalRequests * 100).toFixed(2)
      : '0.00';
    
    // Determine color class for success rate
    let successRateClass = 'success';
    if (parseFloat(successRate) < 70) successRateClass = 'danger';
    else if (parseFloat(successRate) < 90) successRateClass = 'warning';
    
    // Calculate average response time
    const avgResponseTime = aggregatedData.responseTimeValues.length > 0
      ? (aggregatedData.responseTimeValues.reduce((a, b) => a + b, 0) / aggregatedData.responseTimeValues.length).toFixed(2)
      : '0.00';
    
    // Prepare chart data
    const requestsChartData = {
      labels: ['General API', 'Auth API', 'Sensitive API', 'Admin API'],
      successData: [
        aggregatedData.endpoints.general.total - aggregatedData.endpoints.general.limited,
        aggregatedData.endpoints.auth.total - aggregatedData.endpoints.auth.limited,
        aggregatedData.endpoints.sensitive.total - aggregatedData.endpoints.sensitive.limited,
        aggregatedData.endpoints.admin.total - aggregatedData.endpoints.admin.limited
      ],
      limitedData: [
        aggregatedData.endpoints.general.limited,
        aggregatedData.endpoints.auth.limited,
        aggregatedData.endpoints.sensitive.limited,
        aggregatedData.endpoints.admin.limited
      ]
    };
    
    // Response time distribution data (simplified)
    const responseTimeChartData = {
      labels: ['Min', 'P10', 'P25', 'Median', 'P75', 'P90', 'P95', 'Max'],
      data: [
        Math.min(...aggregatedData.responseTimeValues),
        percentile(aggregatedData.responseTimeValues, 0.1),
        percentile(aggregatedData.responseTimeValues, 0.25),
        percentile(aggregatedData.responseTimeValues, 0.5),
        percentile(aggregatedData.responseTimeValues, 0.75),
        percentile(aggregatedData.responseTimeValues, 0.9),
        percentile(aggregatedData.responseTimeValues, 0.95),
        Math.max(...aggregatedData.responseTimeValues)
      ]
    };
    
    // Rate limit chart data (simplified since we don't have detailed time series)
    const rateLimitChartData = {
      labels: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
      requestsData: Array(11).fill(aggregatedData.totalRequests / 11),
      rateLimitedData: Array(11).fill(parseFloat(rateLimitedPercentage))
    };
    
    // Generate table rows for detailed metrics
    const tableRows = Object.keys(aggregatedData.metrics)
      .filter(name => !name.includes('rate') && aggregatedData.metrics[name].values.length > 0)
      .map(name => {
        const metric = aggregatedData.metrics[name];
        return `
          <tr>
            <td>${formatMetricName(name)}</td>
            <td>${metric.min.toFixed(2)}</td>
            <td>${metric.avg.toFixed(2)}</td>
            <td>${metric.med.toFixed(2)}</td>
            <td>${metric.p90.toFixed(2)}</td>
            <td>${metric.p95.toFixed(2)}</td>
            <td>${metric.max.toFixed(2)}</td>
          </tr>
        `;
      })
      .join('');
    
    // Generate HTML report
    const htmlReport = htmlTemplate
      .replace('{{timestamp}}', new Date(timestamp.replace(/-/g, ':')).toLocaleString())
      .replace('{{totalRequests}}', aggregatedData.totalRequests)
      .replace('{{successRate}}', successRate)
      .replace('{{successRateClass}}', successRateClass)
      .replace('{{rateLimitedRequests}}', aggregatedData.rateLimitedRequests)
      .replace('{{rateLimitedPercentage}}', rateLimitedPercentage)
      .replace('{{avgResponseTime}}', avgResponseTime)
      .replace('{{tableRows}}', tableRows)
      .replace('{{requestsChartData}}', JSON.stringify(requestsChartData))
      .replace('{{responseTimeChartData}}', JSON.stringify(responseTimeChartData))
      .replace('{{rateLimitChartData}}', JSON.stringify(rateLimitChartData));
    
    // Write HTML report
    const reportPath = path.join(resultsDir, `report-${timestamp}.html`);
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`Report generated: ${reportPath}`);
  } catch (err) {
    console.error('Error generating report:', err);
  }
}

// Helper function to calculate percentile
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = Math.floor(sorted.length * p);
  return sorted[pos];
}

// Helper function to format metric names
function formatMetricName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/http req/i, 'HTTP Request')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Execute the report generation
processResults(); 