#!/bin/bash

# Run all tests for the VibeWell platform
# This script runs each test suite and reports any failures

# Change to the project root directory
cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting VibeWell test suite...${NC}"
echo "============================================="

# Initialize failure tracking
FAILED_TESTS=()

# Function to run a test and track failures
run_test() {
  TEST_NAME=$1
  TEST_CMD=$2
  
  echo -e "${YELLOW}Running $TEST_NAME tests...${NC}"
  
  $TEST_CMD
  if [ $? -ne 0 ]; then
    FAILED_TESTS+=("$TEST_NAME")
    echo -e "${RED}❌ $TEST_NAME tests failed${NC}"
  else
    echo -e "${GREEN}✅ $TEST_NAME tests passed${NC}"
  fi
  
  echo "---------------------------------------------"
}

# Run unit tests
run_test "Unit" "npm run test:unit"

# Run smoke tests
run_test "Smoke" "npm run test:smoke"

# Run rate limiting tests
run_test "Rate Limiting" "npm run test:rate-limiting"

# Run AR tests if available
if [ -f "scripts/test-ar-optimizations.js" ]; then
  run_test "AR" "npm run test:ar"
fi

# Run post-deploy tests if configured
if [ -f "jest.e2e.config.js" ]; then
  run_test "Post-Deploy" "npm run test:post-deploy"
fi

# Report results
echo "============================================="
if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}The following test suites failed:${NC}"
  for test in "${FAILED_TESTS[@]}"; do
    echo -e "${RED}- $test${NC}"
  done
  exit 1
fi 