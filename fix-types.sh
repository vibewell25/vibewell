#!/bin/bash

# Find all TypeScript files with 'any' types
echo "Finding files with 'any' types..."
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "any"

# Run TypeScript strict checks
echo "Running TypeScript strict checks..."
npx tsc --noEmit --strict

# Generate TypeScript declaration files
echo "Generating TypeScript declaration files..."
npx tsc --declaration --emitDeclarationOnly

# Run ESLint with TypeScript rules
echo "Running ESLint with TypeScript rules..."
npx eslint . --ext .ts,.tsx --fix

echo "Done! Please review the files listed above and replace 'any' types with proper types." 