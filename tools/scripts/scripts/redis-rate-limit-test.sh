#!/bin/bash
#
# Redis Rate Limit Load Testing Script for VibeWell
# This script simulates high traffic to test Redis rate limiting functionality
#

set -e  # Exit on error

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}VibeWell Redis Rate Limit Load Test${NC}"
echo "===================================="
echo ""

# Check for required tools
for cmd in curl jq bc; do
  if ! command -v $cmd &> /dev/null; then
    echo -e "${RED}Error: $cmd is required but not installed.${NC}"
    exit 1
  fi
done

# Default settings
API_URL="http://localhost:3000/api"
TEST_ENDPOINT="/products"
REQUESTS_PER_SECOND=10
TEST_DURATION=60
CONCURRENCY=5
AUTH_TOKEN=""
RATE_LIMIT_HEADER="X-RateLimit-Remaining"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      API_URL="$2"
      shift 2
      ;;
    --endpoint)
      TEST_ENDPOINT="$2"
      shift 2
      ;;
    --rps)
      REQUESTS_PER_SECOND="$2"
      shift 2
      ;;
    --duration)
      TEST_DURATION="$2"
      shift 2
      ;;
    --concurrency)
      CONCURRENCY="$2"
      shift 2
      ;;
    --auth)
      AUTH_TOKEN="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --url URL           Base API URL (default: http://localhost:3000/api)"
      echo "  --endpoint PATH     API endpoint to test (default: /products)"
      echo "  --rps N             Requests per second (default: 10)"
      echo "  --duration N        Test duration in seconds (default: 60)"
      echo "  --concurrency N     Number of concurrent clients (default: 5)"
      echo "  --auth TOKEN        Authorization token (optional)"
      echo "  --help              Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

TOTAL_REQUESTS=$((REQUESTS_PER_SECOND * TEST_DURATION))
echo -e "Test configuration:"
echo -e "  API URL:              ${BLUE}${API_URL}${NC}"
echo -e "  Test endpoint:        ${BLUE}${TEST_ENDPOINT}${NC}"
echo -e "  Requests per second:  ${BLUE}${REQUESTS_PER_SECOND}${NC}"
echo -e "  Test duration:        ${BLUE}${TEST_DURATION} seconds${NC}"
echo -e "  Concurrency:          ${BLUE}${CONCURRENCY}${NC}"
echo -e "  Total requests:       ${BLUE}${TOTAL_REQUESTS}${NC}"
if [[ -n "$AUTH_TOKEN" ]]; then
  echo -e "  Authentication:      ${BLUE}Enabled${NC}"
fi
echo ""

# Confirm test execution
read -p "Start rate limit test? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Test aborted."
  exit 0
fi

# Create temp directory for results
TEMP_DIR=$(mktemp -d)
RESULTS_FILE="${TEMP_DIR}/results.txt"
RATE_LIMITS_FILE="${TEMP_DIR}/rate_limits.txt"
RESPONSE_CODES_FILE="${TEMP_DIR}/response_codes.txt"

# Initialize counters
SUCCESSFUL_REQUESTS=0
RATE_LIMITED_REQUESTS=0
FAILED_REQUESTS=0

# Function to make a single request
make_request() {
  local url="${API_URL}${TEST_ENDPOINT}"
  local auth_header=""
  
  if [[ -n "$AUTH_TOKEN" ]]; then
    auth_header="-H \"Authorization: Bearer ${AUTH_TOKEN}\""
  fi
  
  # Make request and capture response
  response=$(curl -s -w "%{http_code}" -o "${TEMP_DIR}/body.json" \
    -H "Content-Type: application/json" \
    $auth_header \
    -H "X-Test-Client-ID: load-test-client" \
    "$url")
  
  http_code=$response
  
  # Get rate limit headers if they exist
  rate_limit_remaining=$(curl -s -I \
    -H "Content-Type: application/json" \
    $auth_header \
    -H "X-Test-Client-ID: load-test-client" \
    "$url" | grep -i "$RATE_LIMIT_HEADER" | awk '{print $2}' | tr -d '\r')
  
  # Write results to files
  echo "$http_code" >> "$RESPONSE_CODES_FILE"
  if [[ -n "$rate_limit_remaining" ]]; then
    echo "$rate_limit_remaining" >> "$RATE_LIMITS_FILE"
  fi
  
  # Classify response
  if [[ "$http_code" -eq 429 ]]; then
    echo -n "█" # Rate limited
    ((RATE_LIMITED_REQUESTS++))
  elif [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
    echo -n "▪" # Success
    ((SUCCESSFUL_REQUESTS++))
  else
    echo -n "✕" # Failed
    ((FAILED_REQUESTS++))
  fi
}

# Start load test
echo -e "\n${GREEN}Starting load test...${NC}"
echo -e "${YELLOW}Each symbol represents one request: ▪=success █=rate-limited ✕=error${NC}\n"

start_time=$(date +%s)
requests_sent=0
dots_per_line=100

# Create background jobs for concurrent requests
for ((i=1; i<=TOTAL_REQUESTS; i++)); do
  # Calculate delay based on requests per second and concurrency
  if (( i % CONCURRENCY == 0 )); then
    sleep $(bc -l <<< "1/$REQUESTS_PER_SECOND")
  fi
  
  make_request &
  
  ((requests_sent++))
  
  # Print newline every 100 requests for readability
  if (( requests_sent % dots_per_line == 0 )); then
    echo " $requests_sent"
  fi
  
  # Check if test duration has been reached
  current_time=$(date +%s)
  elapsed=$((current_time - start_time))
  if (( elapsed >= TEST_DURATION )); then
    break
  fi
done

# Wait for all background jobs to complete
wait

# Calculate final stats
end_time=$(date +%s)
total_time=$((end_time - start_time))
TOTAL_COMPLETED=$((SUCCESSFUL_REQUESTS + RATE_LIMITED_REQUESTS + FAILED_REQUESTS))

# Calculate average requests per second
RPS=$(bc -l <<< "$TOTAL_COMPLETED/$total_time")
RPS=$(printf "%.2f" $RPS)

# Calculate rate limit percentage
RATE_LIMIT_PCT=$(bc -l <<< "$RATE_LIMITED_REQUESTS*100/$TOTAL_COMPLETED")
RATE_LIMIT_PCT=$(printf "%.2f" $RATE_LIMIT_PCT)

# Calculate success percentage
SUCCESS_PCT=$(bc -l <<< "$SUCCESSFUL_REQUESTS*100/$TOTAL_COMPLETED")
SUCCESS_PCT=$(printf "%.2f" $SUCCESS_PCT)

# Calculate error percentage
ERROR_PCT=$(bc -l <<< "$FAILED_REQUESTS*100/$TOTAL_COMPLETED")
ERROR_PCT=$(printf "%.2f" $ERROR_PCT)

# Print results
echo -e "\n\n${GREEN}Load Test Results:${NC}"
echo -e "  Test duration:        ${BLUE}${total_time} seconds${NC}"
echo -e "  Total requests:       ${BLUE}${TOTAL_COMPLETED}${NC}"
echo -e "  Requests per second:  ${BLUE}${RPS}${NC}"
echo -e "  Successful requests:  ${BLUE}${SUCCESSFUL_REQUESTS} (${SUCCESS_PCT}%)${NC}"
echo -e "  Rate limited:         ${YELLOW}${RATE_LIMITED_REQUESTS} (${RATE_LIMIT_PCT}%)${NC}"
echo -e "  Failed requests:      ${RED}${FAILED_REQUESTS} (${ERROR_PCT}%)${NC}"

# Display rate limit analysis if we have data
if [[ -f "$RATE_LIMITS_FILE" && -s "$RATE_LIMITS_FILE" ]]; then
  echo -e "\n${GREEN}Rate Limit Analysis:${NC}"
  
  # Find min, max, and average remaining limits
  REMAINING_MIN=$(sort -n "$RATE_LIMITS_FILE" | head -n 1)
  REMAINING_MAX=$(sort -n "$RATE_LIMITS_FILE" | tail -n 1)
  REMAINING_SUM=0
  COUNT=0
  
  while read -r value; do
    REMAINING_SUM=$((REMAINING_SUM + value))
    ((COUNT++))
  done < "$RATE_LIMITS_FILE"
  
  if [[ $COUNT -gt 0 ]]; then
    REMAINING_AVG=$(bc -l <<< "$REMAINING_SUM/$COUNT")
    REMAINING_AVG=$(printf "%.2f" $REMAINING_AVG)
    
    echo -e "  Min remaining:       ${BLUE}${REMAINING_MIN}${NC}"
    echo -e "  Max remaining:       ${BLUE}${REMAINING_MAX}${NC}"
    echo -e "  Avg remaining:       ${BLUE}${REMAINING_AVG}${NC}"
  fi
fi

# Display response code distribution
if [[ -f "$RESPONSE_CODES_FILE" && -s "$RESPONSE_CODES_FILE" ]]; then
  echo -e "\n${GREEN}Response Code Distribution:${NC}"
  
  for code in $(sort "$RESPONSE_CODES_FILE" | uniq); do
    code_count=$(grep -c "^$code$" "$RESPONSE_CODES_FILE")
    code_pct=$(bc -l <<< "$code_count*100/$TOTAL_COMPLETED")
    code_pct=$(printf "%.2f" $code_pct)
    
    if [[ "$code" -eq 429 ]]; then
      echo -e "  ${YELLOW}429 (Rate Limited):  ${code_count} (${code_pct}%)${NC}"
    elif [[ "$code" -ge 200 && "$code" -lt 300 ]]; then
      echo -e "  ${GREEN}${code}:                ${code_count} (${code_pct}%)${NC}"
    else
      echo -e "  ${RED}${code}:                ${code_count} (${code_pct}%)${NC}"
    fi
  done
fi

# Clean up temp files
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}Load test completed!${NC}"

# Provide Redis commands to check rate limiting
echo -e "\n${GREEN}Suggested Redis Commands to Check Rate Limiting:${NC}"
echo -e "  ${BLUE}redis-cli keys \"vibewell:ratelimit:*\"${NC} - List all rate limit keys"
echo -e "  ${BLUE}redis-cli keys \"vibewell:ratelimit:blocked:*\"${NC} - List blocked IPs"
echo -e "  ${BLUE}redis-cli info${NC} - Check overall Redis stats"

echo -e "\nRemember to clear test rate limit data if needed:"
echo -e "  ${BLUE}redis-cli --scan --pattern \"vibewell:ratelimit:*\" | xargs redis-cli del${NC}") 