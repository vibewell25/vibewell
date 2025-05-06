#!/bin/bash

# Setup script for Redis rate limiting load tests
# This script prepares your environment for load testing

set -e

echo "Setting up environment for Redis rate limiting load tests..."

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "Redis CLI not found. Please install Redis first."
    echo "On macOS: brew install redis"
    echo "On Ubuntu/Debian: sudo apt install redis-server"
    exit 1
fi

# Create directories if they don't exist
mkdir -p ./load-test-results
mkdir -p ./tests/rate-limiting/k6-scripts

# Check if .env.local exists, create if not
if [ ! -f ./.env.local ]; then
    echo "Creating .env.local file with Redis configuration"
    cat > ./.env.local << EOL
# Redis configuration for rate limiting
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# Rate limiting settings
RATE_LIMIT_GENERAL=60
RATE_LIMIT_AUTH=10
RATE_LIMIT_SENSITIVE=30
RATE_LIMIT_ADMIN=30

# Enable Redis logging
REDIS_LOGGING_ENABLED=true
EOL
else
    echo ".env.local already exists. Please ensure it contains Redis configuration."
fi

# Make load testing script executable
chmod +x ./scripts/load-testing.sh

# Make this script executable
chmod +x ./tests/rate-limiting/setup-env.sh

# Start Redis if it's not running (macOS/Linux)
if ! redis-cli ping &> /dev/null; then
    echo "Starting Redis server..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start redis
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start redis-server
    else
        echo "Please start Redis manually on your platform"
    fi
else
    echo "Redis server is already running"
fi

# Verify Redis connection
if redis-cli ping &> /dev/null; then
    echo "Redis connection successful"
else
    echo "Warning: Could not connect to Redis server"
    echo "Please ensure Redis is running before starting load tests"
fi

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "k6 is not installed. Please install it before running load tests:"
    echo "Visit: https://k6.io/docs/getting-started/installation/"
else
    echo "k6 is installed and ready for testing"
fi

echo "Environment setup complete. You can now run the load tests with:"
echo "./scripts/load-testing.sh" 