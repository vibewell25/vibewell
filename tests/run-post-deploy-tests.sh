#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Run the post-deploy tests
echo "Running post-deploy tests..."
npm run test:post-deploy

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ All post-deploy tests passed!"
  exit 0
else
  echo "❌ Some post-deploy tests failed!"
  exit 1
fi 