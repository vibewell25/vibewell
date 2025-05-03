#!/bin/bash

# Convert JavaScript files to TypeScript in the test utils directory
# This script should be run from the project root

set -e

echo "Converting JavaScript files to TypeScript in test-utils directory..."

# Get a list of all JS files (excluding index.js which we'll handle separately)
JS_FILES=$(find src/test-utils -name "*.js" | grep -v "index.js")

for file in $JS_FILES; do
    ts_file="${file%.js}.ts"
    echo "Converting $file to $ts_file"
    
    # Create a TypeScript version (we'll need to manually add types later)
    cp "$file" "$ts_file"
    
    echo "Created $ts_file"
    echo "NOTE: You'll need to manually add type annotations to $ts_file"
done

# Convert index.js to index.ts last
if [ -f src/test-utils/index.js ]; then
    echo "Converting index.js to index.ts"
    cp src/test-utils/index.js src/test-utils/index.ts
    echo "Created src/test-utils/index.ts"
fi

echo "Conversion complete! Please review the TypeScript files and add proper type annotations."
echo "After verifying the TypeScript files work correctly, you can remove the original JS files." 