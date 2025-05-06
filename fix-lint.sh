#!/bin/bash

# Fix ESLint issues that can be automatically fixed
echo "Fixing ESLint issues..."
npx eslint --fix .

# Fix Prettier formatting issues
echo "Fixing Prettier formatting issues..."
npx prettier --write .

# Fix TypeScript type issues
echo "Running TypeScript type check..."
npx tsc --noEmit

# Remove unused files
echo "Removing unused files..."
find . -name "*.bak" -type f -delete
find . -name "*.test.js.bak" -type f -delete
find . -name "*.spec.js.bak" -type f -delete

# Clean up duplicate configuration files
echo "Cleaning up duplicate configuration files..."
rm -f jest.config.js jest.post-deploy.config.js jest.smoke.config.js.bak jest.enhanced-setup.js .eslintrc.js

# Update dependencies
echo "Updating dependencies..."
npm update

echo "Done!" 