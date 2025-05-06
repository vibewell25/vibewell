const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  baseUrl: process.env.TEST_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds timeout for tests
  retries: 2, // Number of retries if a test fails
  endpoints: [
    {
      name: 'Health Check',
      path: '/health',
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: 200, // 200ms maximum response time
      headers: {
        'x-api-key': process.env.HEALTH_CHECK_API_KEY || 'test-key'
},
    {
      name: 'Providers List',
      path: '/providers',
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: 300, // 300ms maximum response time
{
      name: 'Search',
      path: '/search?q=spa',
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: 500, // 500ms maximum response time
{
      name: 'Booking Availability',
      path: '/bookings/availability?date=2023-12-01',
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: 400, // 400ms maximum response time
]
describe('API Response Time Tests', () => {
  // Global timeout for all tests
  jest.setTimeout(config.timeout);
  
  // Test each endpoint
  config.endpoints.forEach(endpoint => {
    test(`${endpoint.name} responds within ${endpoint.maxResponseTime}ms`, async () => {
      const url = `${config.baseUrl}${endpoint.path}`;
      let lastError = null;
      let responseTime = 0;
      let response = null;
      
      // Try the request with retries
      for (let i = 0; i <= config.retries; i++) {
        try {
          const startTime = performance.now();
          
          response = await fetch(url, {
            method: endpoint.method,
            headers: endpoint.headers || {}
responseTime = performance.now() - startTime;
          
          if (response.status === endpoint.expectedStatus) {
            break; // Success, exit retry loop
lastError = new Error(`Unexpected status code: ${response.status}`);
catch (error) {
          lastError = error;
          if (i < config.retries) {
            console.log(`Retry ${i + 1}/${config.retries} for ${endpoint.name} due to: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
}
// If we have no response after all retries, throw the last error
      if (!response && lastError) {
        throw lastError;
// Format response time for display (2 decimal places)
      const formattedTime = responseTime.toFixed(2);
      
      // Log the response time
      console.log(`${endpoint.name} responded in ${formattedTime}ms`);
      
      // Check status code
      expect(response.status).toBe(endpoint.expectedStatus);
      
      // Check response time
      expect(responseTime).toBeLessThanOrEqual(
        endpoint.maxResponseTime,
        `${endpoint.name} took ${formattedTime}ms which exceeds the maximum allowed time of ${endpoint.maxResponseTime}ms`
// For response body tests, if needed
      if (endpoint.bodyTest) {
        const data = await response.json();
        endpoint.bodyTest(data);
});
// Test response time distribution
  test('Response time distribution analysis', async () => {
    const results = [];
    const samplesPerEndpoint = 3;
    
    // Collect multiple samples for each endpoint
    for (const endpoint of config.endpoints) {
      const url = `${config.baseUrl}${endpoint.path}`;
      
      for (let i = 0; i < samplesPerEndpoint; i++) {
        try {
          const startTime = performance.now();
          
          const response = await fetch(url, {
            method: endpoint.method,
            headers: endpoint.headers || {}
const responseTime = performance.now() - startTime;
          
          results.push({
            endpoint: endpoint.name,
            responseTime,
            timestamp: new Date().toISOString()
// Short delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
catch (error) {
          console.error(`Error sampling ${endpoint.name}: ${error.message}`);
}
// Calculate statistics
    const stats = {};
    
    config.endpoints.forEach(endpoint => {
      const endpointResults = results.filter(r => r.endpoint === endpoint.name);
      const responseTimes = endpointResults.map(r => r.responseTime);
      
      if (responseTimes.length > 0) {
        const sum = responseTimes.reduce((a, b) => a + b, 0);
        const avg = sum / responseTimes.length;
        const min = Math.min(...responseTimes);
        const max = Math.max(...responseTimes);
        
        stats[endpoint.name] = {
          samples: responseTimes.length,
          avg: avg.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2),
          p95: calculatePercentile(responseTimes, 95).toFixed(2)
});
    
    console.table(stats);
    
    // Check that we have data for all endpoints
    expect(Object.keys(stats).length).toBe(config.endpoints.length);
/**
 * Calculate a percentile value from an array of numbers
 */
function calculatePercentile(array, percentile) {
  if (array.length === 0) return 0;
  
  array.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * array.length) - 1;
  return array[index];
