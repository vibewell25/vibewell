#!/bin/bash

# Script to identify files that should use .ts extension because they don't contain JSX

# Find all .tsx files in the utils directory
echo "Checking files in src/utils..."
for file in $(find src/utils -type f -name "*.tsx"); do
  # Skip files that explicitly contain JSX
  if grep -q "React\.createElement\|<[A-Za-z][a-zA-Z0-9]*\|<>\|<\/\|<React\." "$file"; then
    echo "✅ $file - Contains JSX elements (keeping as .tsx)"
  else
    # These files don't contain JSX and should be .ts files
    echo "🔄 $file - No JSX found (should be .ts)"
    new_name="${file%.tsx}.ts"
    echo "   Renaming to: $new_name"
    mv "$file" "$new_name"
  fi
done

echo "Done checking all files." 