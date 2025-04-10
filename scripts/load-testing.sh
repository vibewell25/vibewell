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

# Load testing script for Redis rate limiting
# This script runs k6 load tests against our rate-limited API endpoints

set -e

# Create results directory if it doesn't exist
mkdir -p ./load-test-results

# Print header
echo "====================================="
echo "Vibewell API Load Testing (k6)"
echo "====================================="
echo

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "Error: k6 is not installed"
    echo "Please install k6 from https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Ensure the API is running first
echo "Checking if API is available..."
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "Error: API is not running"
    echo "Please start the API server first with 'npm run dev'"
    exit 1
fi

# Set timestamp for this test run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run tests for each endpoint
run_test() {
    local endpoint=$1
    local name=$2
    local users=$3
    local duration=$4
    
    echo "Running load test for $name endpoint..."
    echo "- Virtual Users: $users"
    echo "- Duration: $duration"
    
    k6 run ./tests/rate-limiting/k6-scripts/$endpoint.js \
        --out json=./load-test-results/${endpoint}_${TIMESTAMP}.json \
        --out csv=./load-test-results/${endpoint}_${TIMESTAMP}.csv \
        -e ENDPOINT=$endpoint \
        -e USERS=$users \
        -e DURATION=$duration
        
    echo "Test complete for $endpoint"
    echo
}

# Run tests with different loads
echo "Starting load tests..."

# General API endpoint (higher limit)
run_test "general" "General API" 10 "10s"

# Auth endpoint (stricter limit)
run_test "auth" "Authentication" 5 "10s"

# Sensitive operations endpoint
run_test "sensitive" "Sensitive Operations" 3 "10s"

# Admin endpoint
run_test "admin" "Admin Operations" 5 "10s"

# Generate HTML report
echo "Generating HTML report..."
k6 report ./load-test-results/*_${TIMESTAMP}.json -o ./load-test-results/report_${TIMESTAMP}.html

echo "Load testing complete!"
echo "Results saved to ./load-test-results/"
echo "Report available at ./load-test-results/report_${TIMESTAMP}.html"

# Create directory for results if it doesn't exist
mkdir -p load-test-results

# Set environment variables
export NODE_ENV=production
export REDIS_ENABLED=true
export REDIS_URL=redis://localhost:6379

# Check if Redis is running
echo "Checking if Redis is running..."
if command -v redis-cli > /dev/null; then
  if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
  else
    echo "⚠️ Redis server is not running. Starting it up..."
    if command -v redis-server > /dev/null; then
      redis-server --daemonize yes
      sleep 1
      if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis server started successfully"
      else
        echo "❌ Failed to start Redis server. Please start it manually."
        echo "You can still run the tests with in-memory rate limiting by setting REDIS_ENABLED=false"
        read -p "Continue with in-memory rate limiting? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          echo "Test execution canceled."
          exit 1
        fi
        export REDIS_ENABLED=false
      fi
    else
      echo "❌ Redis server not found. Please install Redis or run with in-memory rate limiting."
      read -p "Continue with in-memory rate limiting? (y/n) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Test execution canceled."
        exit 1
      fi
      export REDIS_ENABLED=false
    fi
  fi
else
  echo "⚠️ redis-cli not found. Cannot check if Redis is running."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Test execution canceled."
    exit 1
  fi
fi

# Check if k6 is installed
if ! command -v k6 > /dev/null; then
  echo "❌ k6 not installed. Please install k6 first:"
  echo "  - macOS: brew install k6"
  echo "  - Linux: sudo apt-get install k6"
  echo "  - Windows: choco install k6"
  echo "Or visit https://k6.io/docs/getting-started/installation/ for more options."
  exit 1
fi

# Start the Next.js server in the background (if not already running)
echo "Checking if Next.js server is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Starting Next.js server in the background..."
  npm run dev > server.log 2>&1 &
  NEXT_PID=$!
  
  # Give the server time to start up
  echo "Waiting for server to start..."
  for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null; then
      echo "✅ Next.js server started successfully"
      break
    fi
    if [ $i -eq 30 ]; then
      echo "❌ Failed to start Next.js server. Check server.log for details."
      exit 1
    fi
    sleep 1
    echo -n "."
  done
  echo
else
  echo "✅ Next.js server is already running"
fi

# Run the load tests
echo "Running Redis rate limiting load tests..."
echo "Mode: $([ "$REDIS_ENABLED" = "true" ] && echo "Redis" || echo "In-memory")"
timestamp=$(date +"%Y%m%d_%H%M%S")

echo "Running normal load test scenario..."
k6 run tests/load-testing/redis-rate-limiting.js --summary-export=load-test-results/normal_${timestamp}.json --include-system-env-vars

echo "Running high load test scenario..."
k6 run tests/load-testing/redis-rate-limiting.js --scenario high_load --summary-export=load-test-results/high_${timestamp}.json --include-system-env-vars

# If we started the server, shut it down
if [ -n "$NEXT_PID" ]; then
  echo "Shutting down Next.js server..."
  kill $NEXT_PID
fi

echo "📊 Load test complete! Results saved to load-test-results/ directory."

# Create results directory if it doesn't exist
RESULTS_DIR="./load-test-results"
mkdir -p $RESULTS_DIR

# Get current timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run k6 tests and save results
echo "Running Redis rate limit load tests..."
k6 run --out json=./$RESULTS_DIR/redis_rate_limit_test_$TIMESTAMP.json \
       --out summary=./$RESULTS_DIR/redis_rate_limit_summary_$TIMESTAMP.txt \
       --out dashboard=./$RESULTS_DIR/redis_rate_limit_dashboard_$TIMESTAMP.html \
       ./tests/k6/redis-rate-limit-test.js

echo "Tests completed. Results saved to $RESULTS_DIR"

# Generate HTML report
echo "Generating HTML report..."
node ./scripts/generate-report.js

# Display summary
echo "Summary:"
cat ./$RESULTS_DIR/redis_rate_limit_summary_$TIMESTAMP.txt

echo "To view the dashboard, open ./$RESULTS_DIR/redis_rate_limit_dashboard_$TIMESTAMP.html in a browser"
echo "To view the detailed report, open the HTML report generated in the results directory"

# Default settings
BASE_URL="http://localhost:3000"
USERS=50
DURATION="30s"
TEST_TYPE="all"
BYPASS_ATTEMPT="false"

# Help function
function show_help {
  echo "Usage: ./load-testing.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                Show this help message"
  echo "  -u, --url URL             Base URL to test (default: http://localhost:3000)"
  echo "  -c, --users COUNT         Number of concurrent users (default: 50)"
  echo "  -d, --duration DURATION   Test duration (default: 30s)"
  echo "  -t, --type TYPE           Test type: all, general, auth, sensitive, admin (default: all)"
  echo "  -b, --bypass              Enable bypass attempt mode (default: false)"
  echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -h|--help)
      show_help
      exit 0
      ;;
    -u|--url)
      BASE_URL="$2"
      shift
      shift
      ;;
    -c|--users)
      USERS="$2"
      shift
      shift
      ;;
    -d|--duration)
      DURATION="$2"
      shift
      shift
      ;;
    -t|--type)
      TEST_TYPE="$2"
      shift
      shift
      ;;
    -b|--bypass)
      BYPASS_ATTEMPT="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Generate a timestamp for the results
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
RESULT_FILE="$RESULTS_DIR/load-test-$TEST_TYPE-$TIMESTAMP"

echo "Starting k6 load test with the following configuration:"
echo "- Base URL: $BASE_URL"
echo "- Users: $USERS"
echo "- Duration: $DURATION"
echo "- Test type: $TEST_TYPE"
echo "- Bypass attempt: $BYPASS_ATTEMPT"
echo ""
echo "Results will be saved to: $RESULT_FILE"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "Error: k6 is not installed. Please install it first."
  echo "Visit https://k6.io/docs/getting-started/installation/ for installation instructions."
  exit 1
fi

# Check if Redis is running for production tests
if [[ "$NODE_ENV" == "production" || "$REDIS_ENABLED" == "true" ]]; then
  echo "Checking Redis connection..."
  if ! command -v redis-cli &> /dev/null; then
    echo "Warning: redis-cli not found. Cannot verify Redis is running."
  else
    if ! redis-cli ping &> /dev/null; then
      echo "Warning: Redis server is not running. Rate limiting might not work correctly in production mode."
    else
      echo "Redis is running and responding to ping."
    fi
  fi
fi

# Execute the k6 load test
k6 run \
  --out json="$RESULT_FILE.json" \
  --out summary \
  --env BASE_URL=$BASE_URL \
  --env USERS=$USERS \
  --env DURATION=$DURATION \
  --env TEST_TYPE=$TEST_TYPE \
  --env BYPASS_ATTEMPT=$BYPASS_ATTEMPT \
  scripts/load-testing.js

# Generate HTML report if k6-reporter is installed
if [ -f "./scripts/k6-report.js" ]; then
  echo "Generating HTML report..."
  node ./scripts/k6-report.js "$RESULT_FILE.json" > "$RESULT_FILE.html"
  echo "HTML report generated at: $RESULT_FILE.html"
fi

echo ""
echo "Load test complete. Results saved to: $RESULT_FILE.json"
echo "" 