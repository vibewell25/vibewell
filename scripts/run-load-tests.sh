#!/bin/bash
# Script to run load tests for Redis rate limiting

# Set up colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create results directory if it doesn't exist
mkdir -p ./load-test-results

# Print header
echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}     Vibewell Redis Rate Limiting Load Tests          ${NC}"
echo -e "${GREEN}======================================================${NC}"

# Check if Redis is running
echo -e "${YELLOW}Checking Redis connection...${NC}"
if ! ./redis-stable/src/redis-cli ping > /dev/null; then
    echo -e "${RED}Error: Redis does not appear to be running.${NC}"
    echo -e "Starting Redis server..."
    ./redis-stable/src/redis-server --daemonize yes
    sleep 1
    if ! ./redis-stable/src/redis-cli ping > /dev/null; then
        echo -e "${RED}Failed to start Redis server. Please start it manually:${NC}"
        echo -e "./redis-stable/src/redis-server --daemonize yes"
        exit 1
    else
        echo -e "${GREEN}✓ Redis started successfully.${NC}"
    fi
else
    echo -e "${GREEN}✓ Redis is running.${NC}"
fi

# Check environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ -f .env.local ]; then
    echo -e "${BLUE}Contents of .env.local:${NC}"
    cat .env.local
    
    # Check specific variables
    if grep -q "REDIS_URL=" .env.local && grep -q "REDIS_ENABLED=true" .env.local; then
        echo -e "${GREEN}✓ Redis environment variables are configured correctly.${NC}"
    else
        echo -e "${YELLOW}Warning: Redis environment variables may be missing or incorrect.${NC}"
        echo -e "Updating .env.local file..."
        echo "NODE_ENV=production" > .env.local
        echo "REDIS_URL=redis://localhost:6379" >> .env.local
        echo "REDIS_ENABLED=true" >> .env.local
        echo -e "${GREEN}✓ Environment variables updated.${NC}"
    fi
else
    echo -e "${YELLOW}Warning: .env.local file not found.${NC}"
    echo -e "Creating .env.local file..."
    echo "NODE_ENV=production" > .env.local
    echo "REDIS_URL=redis://localhost:6379" >> .env.local
    echo "REDIS_ENABLED=true" >> .env.local
    echo -e "${GREEN}✓ .env.local file created.${NC}"
fi

# Check API test routes
echo -e "\n${YELLOW}Checking API test routes...${NC}"
TEST_ROUTES=(
    "src/app/api/test/general/route.ts"
    "src/app/api/test/auth/route.ts"
    "src/app/api/test/sensitive/route.ts"
    "src/app/api/test/admin/route.ts"
)

for route in "${TEST_ROUTES[@]}"; do
    if [ -f "$route" ]; then
        echo -e "${GREEN}✓ Found test route: $route${NC}"
    else
        echo -e "${RED}✗ Missing test route: $route${NC}"
    fi
done

# Check load test scripts
echo -e "\n${YELLOW}Checking load test scripts...${NC}"
TEST_SCRIPTS=(
    "scripts/load-tests/general-api.js"
    "scripts/load-tests/auth-api.js"
    "scripts/load-tests/sensitive-api.js"
    "scripts/load-tests/admin-api.js"
    "scripts/load-tests/all-tests.js"
)

for script in "${TEST_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}✓ Found test script: $script${NC}"
    else
        echo -e "${RED}✗ Missing test script: $script${NC}"
    fi
done

# Find k6 binary
K6_PATH=""
if command -v k6 &> /dev/null; then
    K6_PATH="k6"
    echo -e "\n${GREEN}✓ k6 found in PATH.${NC}"
elif [ -f "./k6" ] && [ -x "./k6" ]; then
    K6_PATH="./k6"
    echo -e "\n${GREEN}✓ k6 found in current directory.${NC}"
elif [ -f "./k6-v"*"/k6" ]; then
    K6_PATH=$(find . -name "k6-v*" -type d | head -n 1)/k6
    if [ -x "$K6_PATH" ]; then
        echo -e "\n${GREEN}✓ k6 found in ${K6_PATH}.${NC}"
    else
        K6_PATH=""
    fi
else
    echo -e "\n${YELLOW}k6 not found. Would you like to download it? (y/n)${NC}"
    read -r download_k6
    if [[ "$download_k6" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Downloading k6...${NC}"
        if [[ "$(uname)" == "Darwin" ]]; then
            # macOS
            curl -L https://github.com/grafana/k6/releases/download/v0.44.1/k6-v0.44.1-macos-amd64.zip -o k6.zip
            unzip -o k6.zip
            K6_PATH="./k6-v0.44.1-macos-amd64/k6"
            chmod +x "$K6_PATH"
        elif [[ "$(uname)" == "Linux" ]]; then
            # Linux
            curl -L https://github.com/grafana/k6/releases/download/v0.44.1/k6-v0.44.1-linux-amd64.tar.gz -o k6.tar.gz
            tar xzf k6.tar.gz
            K6_PATH="./k6-v0.44.1-linux-amd64/k6"
            chmod +x "$K6_PATH"
        else
            echo -e "${RED}Unsupported OS. Please download k6 manually from https://k6.io/docs/getting-started/installation/${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ k6 downloaded successfully.${NC}"
    else
        echo -e "${RED}k6 is required for load testing. Please install it manually.${NC}"
        echo -e "Visit: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
fi

# Get current timestamp for unique filenames
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ask user which tests to run
echo -e "\n${YELLOW}Which tests would you like to run?${NC}"
echo -e "1. Run all tests"
echo -e "2. Run general API test only"
echo -e "3. Run auth API test only"
echo -e "4. Run sensitive API test only"
echo -e "5. Run admin API test only"
echo -e "6. Exit without running tests"
read -r test_choice

case $test_choice in
    1)
        echo -e "\n${BLUE}Running all tests...${NC}"
        "$K6_PATH" run --out json=./load-test-results/all-tests-${TIMESTAMP}.json scripts/load-tests/all-tests.js
        ;;
    2)
        echo -e "\n${BLUE}Running general API load test...${NC}"
        "$K6_PATH" run --out json=./load-test-results/general-api-${TIMESTAMP}.json scripts/load-tests/general-api.js
        ;;
    3)
        echo -e "\n${BLUE}Running authentication API load test...${NC}"
        "$K6_PATH" run --out json=./load-test-results/auth-api-${TIMESTAMP}.json scripts/load-tests/auth-api.js
        ;;
    4)
        echo -e "\n${BLUE}Running sensitive operations load test...${NC}"
        "$K6_PATH" run --out json=./load-test-results/sensitive-api-${TIMESTAMP}.json scripts/load-tests/sensitive-api.js
        ;;
    5)
        echo -e "\n${BLUE}Running admin operations load test...${NC}"
        "$K6_PATH" run --out json=./load-test-results/admin-api-${TIMESTAMP}.json scripts/load-tests/admin-api.js
        ;;
    6)
        echo -e "\n${YELLOW}Exiting without running tests.${NC}"
        exit 0
        ;;
    *)
        echo -e "\n${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Create a simple HTML report
echo -e "\n${BLUE}Creating HTML summary report...${NC}"
cat > ./load-test-results/report-${TIMESTAMP}.html << EOL
<!DOCTYPE html>
<html>
<head>
    <title>Vibewell Rate Limiting Load Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .summary { background: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test-group { margin-bottom: 30px; }
        .timestamp { color: #888; font-size: 0.9em; }
        .recommendations { background: #e9f7ef; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Vibewell Rate Limiting Load Test Results</h1>
        
        <div class="timestamp">Generated on: $(date)</div>
        
        <div class="summary">
            <h2>Test Summary</h2>
            <p>The load tests were executed against your rate limiting implementation. Check the individual JSON result files for detailed metrics.</p>
        </div>
        
        <div class="test-group">
            <h2>Tests Executed</h2>
            <ul>
                <li>General API Test: Testing the general API rate limiting</li>
                <li>Authentication API Test: Testing the authentication rate limiting</li>
                <li>Sensitive Operations Test: Testing the sensitive operations rate limiting</li>
                <li>Admin Operations Test: Testing the admin operations rate limiting</li>
                <li>Combined Test: Testing all endpoints in parallel</li>
            </ul>
        </div>
        
        <div class="recommendations">
            <h2>Recommendations</h2>
            <p>To analyze the results in detail:</p>
            <ol>
                <li>Review the JSON result files in the load-test-results directory</li>
                <li>Look for rate limited requests (HTTP 429 responses)</li>
                <li>Check response time distributions</li>
                <li>Adjust rate limiting thresholds based on your findings</li>
                <li>Monitor Redis memory usage during tests</li>
            </ol>
        </div>
    </div>
</body>
</html>
EOL

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}     Load Testing Complete!                          ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "${BLUE}Results saved to: ./load-test-results/${NC}"
echo -e "${BLUE}HTML Report: ./load-test-results/report-${TIMESTAMP}.html${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review the test results to analyze rate limiting effectiveness"
echo -e "2. Adjust rate limit configurations if needed"
echo -e "3. Consider running additional tests with different parameters"
echo -e "4. Check Redis memory usage and performance"
echo -e "\n${YELLOW}To stop Redis when you're done:${NC}"
echo -e "./redis-stable/src/redis-cli shutdown" 