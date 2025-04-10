#!/bin/bash

# Default values
API_URL="http://localhost:3000/api"
SCENARIO="all"
VUS=10
DURATION="30s"
REDIS=false
EXPORT=false
OUTPUT_DIR="./load-test-results"
COMPARE=false
DEBUG=false

# Print usage information
print_usage() {
  echo "Load Testing Script for Vibewell Rate Limiting"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --redis                Use Redis for rate limiting"
  echo "  --scenario NAME        Test scenario (general, auth, sensitive, admin, all)"
  echo "  --vus NUMBER           Number of virtual users (default: 10)"
  echo "  --duration TIME        Test duration (e.g., 30s, 1m, 2h) (default: 30s)"
  echo "  --export               Export test results"
  echo "  --output DIR           Output directory for test results (default: ./load-test-results)"
  echo "  --compare              Run tests with both Redis and in-memory for comparison"
  echo "  --debug                Enable debug logging"
  echo "  --help                 Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --redis --scenario auth"
  echo "  $0 --vus 50 --duration 60s --scenario sensitive"
  echo "  $0 --compare --export"
  exit 1
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --redis)
      REDIS=true
      shift
      ;;
    --scenario)
      SCENARIO="$2"
      shift 2
      ;;
    --vus)
      VUS="$2"
      shift 2
      ;;
    --duration)
      DURATION="$2"
      shift 2
      ;;
    --export)
      EXPORT=true
      shift
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --compare)
      COMPARE=true
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    --help)
      print_usage
      ;;
    *)
      echo "Unknown option: $1"
      print_usage
      ;;
  esac
done

# Validate scenario
if [[ ! "$SCENARIO" =~ ^(general|auth|sensitive|admin|all)$ ]]; then
  echo "Error: Invalid scenario '$SCENARIO'. Must be one of: general, auth, sensitive, admin, all"
  exit 1
fi

# Create output directory if exporting results
if [ "$EXPORT" = true ]; then
  mkdir -p "$OUTPUT_DIR"
  echo "Results will be exported to $OUTPUT_DIR"
fi

# Function to run a single test
run_test() {
  local redis_mode=$1
  local redis_label=$([ "$redis_mode" = true ] && echo "redis" || echo "in-memory")
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local output_prefix=""
  
  echo "============================================="
  echo "Running test with the following configuration:"
  echo "- Rate limiting: $redis_label"
  echo "- Scenario: $SCENARIO"
  echo "- Virtual users: $VUS"
  echo "- Duration: $DURATION"
  echo "- API URL: $API_URL"
  echo "- Debug mode: $DEBUG"
  echo "============================================="

  # Set export parameters if needed
  if [ "$EXPORT" = true ]; then
    output_prefix="--out json=$OUTPUT_DIR/${SCENARIO}_${redis_label}_${timestamp}.json --out csv=$OUTPUT_DIR/${SCENARIO}_${redis_label}_${timestamp}.csv"
  fi

  # Run k6 test
  SCENARIO="$SCENARIO" REDIS="$redis_mode" BASE_URL="$API_URL" DEBUG="$DEBUG" \
  k6 run $output_prefix \
    --vus "$VUS" \
    --duration "$DURATION" \
    scripts/k6-test.js
}

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "Error: k6 is not installed or not in the PATH"
  echo "Please install k6: https://k6.io/docs/getting-started/installation/"
  exit 1
fi

# Check if test script exists
if [ ! -f "scripts/k6-test.js" ]; then
  echo "Error: Test script not found at scripts/k6-test.js"
  exit 1
fi

# Run tests based on configuration
if [ "$COMPARE" = true ]; then
  echo "Running comparison tests (in-memory vs Redis)..."
  
  # Run in-memory test
  run_test false
  
  # Add a small delay between tests
  sleep 2
  
  # Run Redis test
  run_test true
  
  echo "Comparison tests complete!"
else
  # Run single test with specified Redis mode
  run_test $REDIS
fi

# Display summary for exported results
if [ "$EXPORT" = true ]; then
  echo "Test results exported to $OUTPUT_DIR"
  echo "Files:"
  ls -la "$OUTPUT_DIR" | grep "$(date +"%Y%m%d")"
fi

echo "Load testing complete!" 