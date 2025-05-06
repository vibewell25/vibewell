#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running Comprehensive Test Suite for Vibewell Application${NC}"
echo "========================================================"

# Function to run tests with proper formatting
run_test() {
  test_type=$1
  test_command=$2
  test_files=$3
  
  echo -e "\n${YELLOW}Running $test_type Tests${NC}"
  echo "--------------------------------------------------------"
  
  if [ -n "$test_files" ]; then
    echo "Test files: $test_files"
  fi
  
  if eval "$test_command"; then
    echo -e "${GREEN}✓ $test_type Tests Passed${NC}"
    return 0
  else
    echo -e "${RED}✗ $test_type Tests Failed${NC}"
    return 1
  fi
}

# Create results directory
mkdir -p test-results

# Run unit tests
run_test "Unit" "npx jest --testPathIgnorePatterns='tests/integration|tests/post-deploy|tests/load-testing'" || exit_code=1

# Run integration tests
run_test "Integration" "npx jest tests/integration" || exit_code=1

# Run end-to-end tests
run_test "End-to-End" "npx jest tests/post-deploy" || exit_code=1

# Run load tests if k6 is installed
if command -v k6 >/dev/null 2>&1; then
  run_test "Load" "k6 run tests/load-testing/performance-monitoring.test.js --out json=test-results/load-test-results.json" || exit_code=1
else
  echo -e "${YELLOW}Skipping load tests - k6 is not installed${NC}"
  echo "To install k6, follow instructions at https://k6.io/docs/getting-started/installation"
fi

# Final summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "========================================================"

if [ "$exit_code" -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
else
  echo -e "${RED}Some tests failed. Please check the logs above for details.${NC}"
fi

# Make the test results available
echo -e "\nTest results saved to test-results/ directory"

exit ${exit_code:-0} 