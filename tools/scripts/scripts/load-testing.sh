#!/bin/bash
# =============================================
# Vibewell Rate Limiting Load Test Script
# =============================================
# This script uses k6 (https://k6.io) to test rate limiting
# functionality of the Vibewell API under various load scenarios.
#
# Prerequisites:
# - k6 installed (https://k6.io/docs/getting-started/installation/)
# - Vibewell application running
# - .env file with API_URL defined

set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration parameters
API_URL=${API_URL:-"http://localhost:3000/api"}
OUTPUT_DIR="./load-test-results"
TIMEOUT=${TIMEOUT:-"60s"}
MAX_VUS=${MAX_VUS:-"50"}

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed. Please install it first:${NC}"
    echo -e "${BLUE}https://k6.io/docs/getting-started/installation/${NC}"
    exit 1
fi

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}     Vibewell API Rate Limiting Load Tests          ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${BLUE}Target API URL:${NC} $API_URL"
echo -e "${BLUE}Max Virtual Users:${NC} $MAX_VUS"
echo -e "${BLUE}Test timeout:${NC} $TIMEOUT"
echo

# Function to run a test scenario
run_test() {
    local name=$1
    local endpoint=$2
    local requests_per_user=$3
    local ramp_up_time=$4
    local steady_state_time=$5
    local vus=$6
    
    echo -e "${YELLOW}Running test scenario: ${name}${NC}"
    echo -e "Endpoint: ${endpoint}"
    echo -e "Virtual Users: ${vus}"
    echo -e "Requests per user: ${requests_per_user}"
    
    # Create temp k6 script
    cat > /tmp/k6_script.js << EOL
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const successRate = new Rate('successful_requests');
const rateLimitedRate = new Rate('rate_limited_requests');

export let options = {
  stages: [
    { duration: '${ramp_up_time}', target: ${vus} }, // Ramp up
    { duration: '${steady_state_time}', target: ${vus} }, // Steady state
    { duration: '10s', target: 0 }, // Ramp down
  ],
  thresholds: {
    'successful_requests': ['rate>0.7'], // 70% success
    'http_req_duration': ['p(95)<500'], // 95% of requests under 500ms
  },
};

// Unique identifier to simulate different users
const getUniqueUserId = (vu) => {
  return \`user_\${vu}_\${__VU}\`;
};

export default function() {
  // Add some randomness to the requests
  const userId = getUniqueUserId(Date.now());
  
  // Send requests in bursts to test rate limiting
  for (let i = 0; i < ${requests_per_user}; i++) {
    const url = '${API_URL}${endpoint}';
    const payload = {
      userId: userId,
      timestamp: new Date().toISOString(),
      requestNumber: i + 1
    };
    
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
    };
    
    const res = http.post(url, JSON.stringify(payload), params);
    
    check(res, {
      'is status 200': (r) => r.status === 200,
      'is status 429': (r) => r.status === 429, // Rate limit exceeded
    });
    
    if (res.status === 200) {
      successRate.add(1);
    } else if (res.status === 429) {
      rateLimitedRate.add(1);
      // Extract retry-after header if it exists
      if (res.headers['Retry-After']) {
        console.log(\`Rate limited: Retry after \${res.headers['Retry-After']} seconds\`);
      }
    }
    
    // Small random sleep between requests
    sleep(Math.random() * 0.5);
  }
  
  // Sleep between user sessions
  sleep(1);
}
EOL
    
    # Run the k6 test
    k6 run --summary-export="${OUTPUT_DIR}/${name}_summary.json" /tmp/k6_script.js
    
    echo -e "${GREEN}Test completed: ${name}${NC}"
    echo
}

# Run tests for different endpoints and scenarios

echo -e "${GREEN}Starting load tests...${NC}"

# Test 1: General API endpoints with moderate load
run_test "general_api_moderate" "/test/general" 10 "5s" "20s" 20

# Test 2: Authentication endpoints with high burst
run_test "auth_endpoints_burst" "/auth/test" 5 "3s" "15s" 30

# Test 3: Sensitive endpoints with sustained load
run_test "sensitive_endpoints" "/test/sensitive" 8 "5s" "30s" 15

# Test 4: Admin endpoints with very high load
run_test "admin_endpoints_high" "/admin/test" 12 "5s" "25s" $MAX_VUS

# Generate HTML report from all tests
echo -e "${GREEN}Generating consolidated report...${NC}"

cat > ${OUTPUT_DIR}/report.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>Vibewell Rate Limiting Load Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { margin-bottom: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
    .test-result { margin-bottom: 20px; padding: 15px; background-color: #eef; border-radius: 5px; }
    .success { color: green; }
    .warning { color: orange; }
    .error { color: red; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Vibewell Rate Limiting Load Test Results</h1>
  <div class="summary">
    <h2>Test Summary</h2>
    <p>Tests executed on: $(date)</p>
    <p>API URL: ${API_URL}</p>
    <p>Max Virtual Users: ${MAX_VUS}</p>
  </div>
  
  <div class="test-results">
    <h2>Test Results</h2>
    <p>See individual JSON files in the "${OUTPUT_DIR}" directory for detailed metrics.</p>
    
    <h3>Recommendations</h3>
    <ul>
      <li>Check rate limiting configuration if too many requests are being rejected</li>
      <li>Adjust rate limits based on the type of endpoint and expected traffic</li>
      <li>Ensure Redis is properly configured for production rate limiting</li>
      <li>Monitor the system during high traffic periods</li>
    </ul>
  </div>
</body>
</html>
EOL

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}     Load testing complete!                         ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${BLUE}Results saved to: ${OUTPUT_DIR}${NC}"
echo -e "${BLUE}HTML Report: ${OUTPUT_DIR}/report.html${NC}"
echo
echo -e "${YELLOW}Note: These tests simulate heavy load on your rate limiters.${NC}"
echo -e "${YELLOW}Review the results and adjust rate limits accordingly.${NC}"

# Ensure we have a directory to store results
mkdir -p ./load-test-results

# Get current timestamp for unique filenames
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Run k6 load test with JSON output
echo "Running k6 load test for Redis rate limiting..."
k6 run \
  --out json=./load-test-results/rate-limit-test-$TIMESTAMP.json \
  ./scripts/k6-test.js

# Generate HTML report if k6-reporter is available
if command -v k6-reporter &> /dev/null
then
    echo "Generating HTML report..."
    k6-reporter ./load-test-results/rate-limit-test-$TIMESTAMP.json \
      -o ./load-test-results/rate-limit-report-$TIMESTAMP.html
else
    echo "k6-reporter not found. Install with 'npm install -g k6-reporter' to generate HTML reports."
fi

echo "Load testing complete. Results saved to ./load-test-results/"

# Create results directory if it doesn't exist
mkdir -p ./load-test-results

# Run general API load test
echo "Running general API load test..."
k6 run --out json=./load-test-results/general-api-test.json scripts/load-tests/general-api.js

# Run authentication API load test
echo "Running authentication API load test..."
k6 run --out json=./load-test-results/auth-api-test.json scripts/load-tests/auth-api.js

# Run sensitive operations load test
echo "Running sensitive operations load test..."
k6 run --out json=./load-test-results/sensitive-api-test.json scripts/load-tests/sensitive-api.js

# Run admin operations load test
echo "Running admin operations load test..."
k6 run --out json=./load-test-results/admin-api-test.json scripts/load-tests/admin-api.js

# Generate HTML report
echo "Generating HTML report..."
k6 run --out html=./load-test-results/report.html scripts/load-tests/all-tests.js

echo "Load testing completed. Results saved in ./load-test-results/" 