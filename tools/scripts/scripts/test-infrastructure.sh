#!/bin/bash

# Test Infrastructure Script
# This script verifies that our testing infrastructure is properly set up

echo "🧪 Testing infrastructure verification script"
echo "============================================="

# Check that required test config files exist
echo "Checking test configuration files..."
FILES_TO_CHECK=(
  "jest.enhanced.config.js"
  "jest.enhanced-setup.js"
  "__mocks__/three.js"
  "__mocks__/GLTFLoader.js"
  "__mocks__/DRACOLoader.js"
  "__mocks__/fileMock.js"
  "__mocks__/styleMock.js"
  "src/types/jest-dom.d.ts"
  "src/types/jest-axe.d.ts"
  "src/types/user-event.d.ts"
)

ALL_FILES_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file is missing"
    ALL_FILES_EXIST=false
  fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
  echo "Some required files are missing. Please run the setup script first."
  exit 1
fi

# Check for required npm packages
echo "Checking required npm packages..."
PACKAGES_TO_CHECK=(
  "@testing-library/jest-dom"
  "@testing-library/react"
  "@testing-library/user-event"
  "jest-axe"
  "msw"
  "identity-obj-proxy"
)

MISSING_PACKAGES=()
for package in "${PACKAGES_TO_CHECK[@]}"; do
  if grep -q "\"$package\"" package.json; then
    echo "✅ $package is installed"
  else
    echo "❌ $package is missing"
    MISSING_PACKAGES+=("$package")
  fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
  echo "Some required packages are missing. Please run:"
  echo "npm install --save-dev ${MISSING_PACKAGES[*]}"
  exit 1
fi

echo "✅ All testing infrastructure is properly set up!"
echo "You can now run 'npm run test:enhanced' to use the enhanced testing configuration." 