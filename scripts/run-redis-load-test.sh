#!/bin/bash

# Redis Load Testing Script for Vibewell

set -e

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
  echo "Starting Redis server..."
  cd ../redis-stable && ./src/redis-server ./redis-production.conf
  sleep 2
  if ! redis-cli ping > /dev/null 2>&1; then
    echo "Failed to start Redis. Exiting."
    exit 1
  fi
fi

echo "Redis is running."

# Create results directory if it doesn't exist
RESULTS_DIR="../load-test-results"
mkdir -p $RESULTS_DIR

echo "Running load tests for Redis rate limiting..."

# Set environment variables for testing
export NODE_ENV=production
export REDIS_ENABLED=true
export REDIS_URL=redis://localhost:6379
export LOG_LEVEL=info
export ENABLE_RATE_LIMIT_LOGGING=true

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run different test scenarios
echo "Running general API test scenario..."
k6 run --out json=$RESULTS_DIR/general-api-$TIMESTAMP.json ../tests/k6/redis-rate-limit-test.js --env SCENARIO=general

echo "Running auth API test scenario..."
k6 run --out json=$RESULTS_DIR/auth-api-$TIMESTAMP.json ../tests/k6/redis-rate-limit-test.js --env SCENARIO=auth

echo "Running sensitive API test scenario..."
k6 run --out json=$RESULTS_DIR/sensitive-api-$TIMESTAMP.json ../tests/k6/redis-rate-limit-test.js --env SCENARIO=sensitive

echo "Running admin API test scenario..."
k6 run --out json=$RESULTS_DIR/admin-api-$TIMESTAMP.json ../tests/k6/redis-rate-limit-test.js --env SCENARIO=admin

echo "Load tests completed. Results are stored in $RESULTS_DIR."

# Generate HTML report from JSON results
echo "Generating HTML report..."
node ../scripts/generate-load-test-report.js $RESULTS_DIR $TIMESTAMP

echo "Test report generated at $RESULTS_DIR/report-$TIMESTAMP.html" 