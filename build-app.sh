#!/bin/bash
set -e

# Step 3: Build Application
echo "Step 3: Building Application"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file is missing. Please run ./environment-setup.sh first."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

echo "Application build completed successfully!"
echo ""
echo "To start the application in development mode, run: npm run dev"
echo "To start the application in production mode, run: npm start" 