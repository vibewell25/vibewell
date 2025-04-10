#!/bin/bash

# Check if Redis is running
echo "Checking if Redis is running..."
REDIS_RUNNING=$(docker ps -q -f name=redis)

if [ -z "$REDIS_RUNNING" ]; then
  echo "Redis is not running. Starting Redis container..."
  docker run --name redis -p 6379:6379 -d redis
  
  if [ $? -ne 0 ]; then
    echo "Failed to start Redis container. Checking if it exists but stopped..."
    REDIS_EXISTS=$(docker ps -aq -f name=redis)
    
    if [ -n "$REDIS_EXISTS" ]; then
      echo "Redis container exists but is stopped. Starting it..."
      docker start redis
    else
      echo "Error: Could not start Redis container. Please install Docker or start Redis manually."
      exit 1
    fi
  else
    echo "Redis container started successfully."
  fi
else
  echo "Redis is already running."
fi

# Check if k6 is installed
echo "Checking if k6 is installed..."
if ! command -v k6 &> /dev/null; then
  echo "k6 is not installed. Please install k6:"
  echo "macOS: brew install k6"
  echo "Linux: sudo apt-get install k6"
  echo "Windows: choco install k6"
  echo "Or follow installation instructions at: https://k6.io/docs/getting-started/installation/"
  exit 1
fi
echo "k6 is installed."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local from template..."
  cp .env.local.example .env.local
  echo ".env.local created. Please review and adjust settings if needed."
else
  echo ".env.local already exists."
fi

# Create results directory
RESULTS_DIR="./load-test-results"
mkdir -p $RESULTS_DIR
echo "Created results directory at $RESULTS_DIR"

# Final instructions
echo ""
echo "============================================"
echo "Environment setup complete!"
echo "To run the load tests:"
echo "1. Make sure your application is running: npm run dev"
echo "2. Run: ./scripts/load-testing.sh"
echo "============================================" 