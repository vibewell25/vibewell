#!/bin/bash
#
# VibeWell Security Audit Script
# This script performs security testing for Redis rate limiting and other critical systems
#

set -e  # Exit on error

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}VibeWell Security Audit${NC}"
echo "=========================="
echo ""

# Check if required tools are installed
declare -a REQUIRED_TOOLS=("curl" "nmap" "redis-cli" "jq" "ab")
for tool in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v $tool &> /dev/null; then
    echo -e "${YELLOW}Warning: $tool is not installed. Some tests may fail.${NC}"
  fi
done

# Redis Security Tests
run_redis_security_tests() {
  echo -e "\n${BLUE}Running Redis Security Tests...${NC}"
  
  # Get Redis connection details
  read -p "Enter Redis host (default: localhost): " REDIS_HOST
  REDIS_HOST=${REDIS_HOST:-localhost}
  
  read -p "Enter Redis port (default: 6379): " REDIS_PORT
  REDIS_PORT=${REDIS_PORT:-6379}
  
  read -sp "Enter Redis password: " REDIS_PASSWORD
  echo ""
  
  # Test 1: Check if Redis is protected by password
  echo -e "\n1. Testing password protection..."
  if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping &> /dev/null; then
    echo -e "${RED}FAIL: Redis allows connections without authentication${NC}"
  else
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" ping &> /dev/null; then
      echo -e "${GREEN}PASS: Redis requires password authentication${NC}"
    else
      echo -e "${RED}FAIL: Could not connect to Redis with provided password${NC}"
    fi
  fi
  
  # Test 2: Check Redis network exposure
  echo -e "\n2. Checking network exposure..."
  if command -v nmap &> /dev/null; then
    # Only scan if nmap is available
    EXPOSED_REDIS=$(nmap -p $REDIS_PORT $REDIS_HOST | grep -i "open")
    
    if [[ -n "$EXPOSED_REDIS" ]]; then
      if [[ "$REDIS_HOST" == "localhost" || "$REDIS_HOST" == "127.0.0.1" ]]; then
        echo -e "${GREEN}PASS: Redis only listening on localhost${NC}"
      else
        echo -e "${YELLOW}WARNING: Redis port is exposed outside localhost${NC}"
        echo -e "  Consider using firewall rules to restrict access"
      fi
    else
      echo -e "${GREEN}PASS: Redis port is not openly accessible${NC}"
    fi
  else
    echo -e "${YELLOW}SKIP: nmap not available for network exposure test${NC}"
  fi
  
  # Test 3: Check Redis configuration security
  echo -e "\n3. Checking Redis configuration security..."
  
  # Check protected mode
  PROTECTED_MODE=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" config get protected-mode | awk 'NR==2')
  if [[ "$PROTECTED_MODE" == "yes" ]]; then
    echo -e "${GREEN}PASS: Redis protected mode is enabled${NC}"
  else
    echo -e "${RED}FAIL: Redis protected mode is disabled${NC}"
  fi
  
  # Check if dangerous commands are renamed
  DANGEROUS_COMMANDS=("FLUSHALL" "FLUSHDB" "CONFIG" "KEYS")
  
  for cmd in "${DANGEROUS_COMMANDS[@]}"; do
    COMMAND_STATUS=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" command info $cmd 2>/dev/null)
    
    if [[ -z "$COMMAND_STATUS" ]]; then
      echo -e "${GREEN}PASS: $cmd command is renamed or disabled${NC}"
    else
      echo -e "${YELLOW}WARNING: $cmd command is enabled - consider disabling in production${NC}"
    fi
  done
  
  # Test 4: Check Redis memory limits
  echo -e "\n4. Checking Redis memory configuration..."
  
  MAXMEMORY=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" config get maxmemory | awk 'NR==2')
  MAXMEMORY_POLICY=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" config get maxmemory-policy | awk 'NR==2')
  
  if [[ "$MAXMEMORY" == "0" ]]; then
    echo -e "${RED}FAIL: No memory limit set for Redis${NC}"
  else
    echo -e "${GREEN}PASS: Redis memory limit is set to $MAXMEMORY bytes${NC}"
  fi
  
  if [[ "$MAXMEMORY_POLICY" == "noeviction" ]]; then
    echo -e "${YELLOW}WARNING: Redis memory policy is set to 'noeviction' - this may cause issues if memory limit is reached${NC}"
    echo -e "  Recommendation: Use 'allkeys-lru' for rate limiting use case"
  else
    echo -e "${GREEN}PASS: Redis memory policy is set to '$MAXMEMORY_POLICY'${NC}"
  fi
  
  # Test 5: Check Redis persistence configuration
  echo -e "\n5. Checking Redis persistence configuration..."
  
  APPENDONLY=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" config get appendonly | awk 'NR==2')
  APPENDFSYNC=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" config get appendfsync | awk 'NR==2')
  
  if [[ "$APPENDONLY" == "yes" ]]; then
    echo -e "${GREEN}PASS: Redis AOF persistence is enabled${NC}"
    
    if [[ "$APPENDFSYNC" == "everysec" ]]; then
      echo -e "${GREEN}PASS: Redis appendfsync is set to 'everysec' (good balance of performance and durability)${NC}"
    elif [[ "$APPENDFSYNC" == "always" ]]; then
      echo -e "${YELLOW}NOTE: Redis appendfsync is set to 'always' (most durable but may impact performance)${NC}"
    else
      echo -e "${YELLOW}WARNING: Redis appendfsync is set to '$APPENDFSYNC' (may risk data loss on crash)${NC}"
    fi
  else
    echo -e "${YELLOW}WARNING: Redis AOF persistence is disabled${NC}"
    echo -e "  Recommendation: Enable AOF persistence for rate limiting data durability"
  fi
}

# Rate Limiting Security Tests
run_rate_limiting_tests() {
  echo -e "\n${BLUE}Running Rate Limiting Security Tests...${NC}"
  
  # Get API endpoint details
  read -p "Enter API base URL (default: http://localhost:3000): " API_URL
  API_URL=${API_URL:-http://localhost:3000}
  
  read -p "Enter endpoint to test (default: /api/products): " TEST_ENDPOINT
  TEST_ENDPOINT=${TEST_ENDPOINT:-/api/products}
  
  read -p "Enter number of requests to send (default: 150): " NUM_REQUESTS
  NUM_REQUESTS=${NUM_REQUESTS:-150}
  
  # Test 1: Check if rate limiting is working
  echo -e "\n1. Testing rate limiting functionality..."
  
  # Simple curl-based test
  echo -e "   Sending $NUM_REQUESTS requests to $API_URL$TEST_ENDPOINT..."
  
  TEMP_FILE=$(mktemp)
  SUCCESS_COUNT=0
  RATE_LIMITED_COUNT=0
  
  for i in $(seq 1 $NUM_REQUESTS); do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Test-Client: security-test" $API_URL$TEST_ENDPOINT)
    echo $STATUS_CODE >> $TEMP_FILE
    
    if [[ "$STATUS_CODE" -eq 429 ]]; then
      RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
    elif [[ "$STATUS_CODE" -ge 200 && "$STATUS_CODE" -lt 300 ]]; then
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
    
    # Print progress
    if [[ $((i % 10)) -eq 0 ]]; then
      echo -ne "   Progress: $i/$NUM_REQUESTS requests sent\r"
    fi
  done
  echo -e "   Completed: $NUM_REQUESTS/$NUM_REQUESTS requests sent    "
  
  # Calculate results
  if [[ $RATE_LIMITED_COUNT -gt 0 ]]; then
    echo -e "${GREEN}PASS: Rate limiting is active (received $RATE_LIMITED_COUNT '429 Too Many Requests' responses)${NC}"
  else
    echo -e "${RED}FAIL: No rate limiting detected after $NUM_REQUESTS requests${NC}"
    echo -e "   Check if REDIS_ENABLED and RATE_LIMIT_MODE are properly configured"
  fi
  
  # Test 2: Check rate limit headers
  echo -e "\n2. Checking rate limit headers..."
  
  HEADERS=$(curl -s -I -H "X-Test-Client: security-test" $API_URL$TEST_ENDPOINT)
  
  if echo "$HEADERS" | grep -q "X-RateLimit-Limit"; then
    echo -e "${GREEN}PASS: X-RateLimit-Limit header is present${NC}"
  else
    echo -e "${YELLOW}WARNING: X-RateLimit-Limit header is not present${NC}"
  fi
  
  if echo "$HEADERS" | grep -q "X-RateLimit-Remaining"; then
    echo -e "${GREEN}PASS: X-RateLimit-Remaining header is present${NC}"
  else
    echo -e "${YELLOW}WARNING: X-RateLimit-Remaining header is not present${NC}"
  fi
  
  if echo "$HEADERS" | grep -q "X-RateLimit-Reset"; then
    echo -e "${GREEN}PASS: X-RateLimit-Reset header is present${NC}"
  else
    echo -e "${YELLOW}WARNING: X-RateLimit-Reset header is not present${NC}"
  fi
  
  # Test 3: Check bypass attempts
  echo -e "\n3. Testing rate limit bypass attempts..."
  
  # Test with different IP headers to ensure proper client identification
  HEADERS_TO_TEST=(
    "X-Forwarded-For: 192.168.1.1"
    "X-Real-IP: 192.168.1.1" 
    "CF-Connecting-IP: 192.168.1.1"
  )
  
  BYPASS_POSSIBLE=false
  
  for header in "${HEADERS_TO_TEST[@]}"; do
    echo -e "   Testing with $header..."
    
    # Send requests with this header
    RATE_LIMITED=false
    for i in $(seq 1 30); do
      STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$header" -H "X-Test-Client: security-test" $API_URL$TEST_ENDPOINT)
      
      if [[ "$STATUS_CODE" -eq 429 ]]; then
        RATE_LIMITED=true
        break
      fi
    done
    
    if $RATE_LIMITED; then
      echo -e "${GREEN}   PASS: Rate limiting works with $header${NC}"
    else
      echo -e "${RED}   FAIL: No rate limiting with $header - possible bypass vector${NC}"
      BYPASS_POSSIBLE=true
    fi
  done
  
  if $BYPASS_POSSIBLE; then
    echo -e "${RED}FAIL: Possible rate limit bypass vectors detected${NC}"
  else
    echo -e "${GREEN}PASS: Rate limiting properly handles different IP headers${NC}"
  fi
  
  # Clean up
  rm -f $TEMP_FILE
}

# Load Testing for Rate Limiting
run_load_test() {
  echo -e "\n${BLUE}Running Load Tests for Rate Limiting...${NC}"
  
  if ! command -v ab &> /dev/null; then
    echo -e "${RED}FAIL: Apache Bench (ab) not found. Please install it to run load tests.${NC}"
    return
  fi
  
  # Get API endpoint details
  read -p "Enter API base URL (default: http://localhost:3000): " API_URL
  API_URL=${API_URL:-http://localhost:3000}
  
  read -p "Enter endpoint to test (default: /api/products): " TEST_ENDPOINT
  TEST_ENDPOINT=${TEST_ENDPOINT:-/api/products}
  
  read -p "Enter concurrency level (default: 10): " CONCURRENCY
  CONCURRENCY=${CONCURRENCY:-10}
  
  read -p "Enter number of requests (default: 1000): " NUM_REQUESTS
  NUM_REQUESTS=${NUM_REQUESTS:-1000}
  
  echo -e "\nRunning Apache Bench with $CONCURRENCY concurrent users and $NUM_REQUESTS requests..."
  echo -e "Target: $API_URL$TEST_ENDPOINT\n"
  
  # Run Apache Bench
  ab -n $NUM_REQUESTS -c $CONCURRENCY -H "X-Test-Client: load-test" $API_URL$TEST_ENDPOINT
  
  echo -e "\n${GREEN}Load test completed!${NC}"
  echo -e "Check the results for server stability and proper rate limiting under load"
}

# Redis Data Persistence Test
test_redis_persistence() {
  echo -e "\n${BLUE}Testing Redis Persistence...${NC}"
  
  # Get Redis connection details
  read -p "Enter Redis host (default: localhost): " REDIS_HOST
  REDIS_HOST=${REDIS_HOST:-localhost}
  
  read -p "Enter Redis port (default: 6379): " REDIS_PORT
  REDIS_PORT=${REDIS_PORT:-6379}
  
  read -sp "Enter Redis password: " REDIS_PASSWORD
  echo ""
  
  echo -e "\n1. Creating test data..."
  TEST_KEY="vibewell:persistence:test:$(date +%s)"
  TEST_VALUE="Security test performed at $(date)"
  
  # Set test key
  if redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" set $TEST_KEY "$TEST_VALUE" > /dev/null; then
    echo -e "${GREEN}PASS: Successfully stored test data${NC}"
  else
    echo -e "${RED}FAIL: Could not store test data${NC}"
    return
  fi
  
  echo -e "\n2. Triggering SAVE command..."
  if redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" SAVE > /dev/null; then
    echo -e "${GREEN}PASS: SAVE command executed successfully${NC}"
  else
    echo -e "${RED}FAIL: SAVE command failed${NC}"
    return
  fi
  
  echo -e "\n3. Requesting Redis restart..."
  echo -e "${YELLOW}Please restart your Redis server now manually.${NC}"
  read -p "Press Enter when Redis has been restarted..." 
  
  # Wait for Redis to come back
  echo -e "\nWaiting for Redis to come back online..."
  REDIS_UP=false
  for i in {1..30}; do
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" ping &> /dev/null; then
      REDIS_UP=true
      break
    fi
    sleep 1
    echo -ne "Attempt $i/30\r"
  done
  
  if ! $REDIS_UP; then
    echo -e "\n${RED}FAIL: Redis did not come back online after restart${NC}"
    return
  fi
  
  echo -e "\n4. Checking if test data persisted..."
  RETRIEVED_VALUE=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" get $TEST_KEY)
  
  if [[ "$RETRIEVED_VALUE" == "$TEST_VALUE" ]]; then
    echo -e "${GREEN}PASS: Data persisted successfully through Redis restart${NC}"
  else
    echo -e "${RED}FAIL: Data was lost during Redis restart${NC}"
    echo -e "  Check your Redis persistence configuration (appendonly and appendfsync settings)"
  fi
  
  # Clean up
  redis-cli -h $REDIS_HOST -p $REDIS_PORT -a "$REDIS_PASSWORD" del $TEST_KEY > /dev/null
}

# Main Menu
main_menu() {
  echo -e "\n${GREEN}VibeWell Security Audit Menu${NC}"
  echo "1. Run Redis Security Tests"
  echo "2. Run Rate Limiting Security Tests"
  echo "3. Run Load Tests for Rate Limiting"
  echo "4. Test Redis Persistence"
  echo "5. Run All Tests"
  echo "6. Exit"
  
  read -p "Enter your choice (1-6): " CHOICE
  
  case $CHOICE in
    1) run_redis_security_tests ;;
    2) run_rate_limiting_tests ;;
    3) run_load_test ;;
    4) test_redis_persistence ;;
    5)
      run_redis_security_tests
      run_rate_limiting_tests
      run_load_test
      test_redis_persistence
      ;;
    6) 
      echo -e "\n${GREEN}Security audit completed!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please try again.${NC}"
      main_menu
      ;;
  esac
  
  # Return to main menu after any test
  read -p "Press Enter to return to the main menu..."
  main_menu
}

# Start the security audit
main_menu 