#!/bin/bash

# Script to rename .ts files that contain JSX syntax to .tsx
set -e

# Function to check if file contains JSX syntax
contains_jsx() {
  grep -q -E "<[A-Za-z]+[^>]*>|<\/[A-Za-z]+>" "$1"
  return $?
}

# Process test-utils directory
process_dir() {
  local dir=$1
  echo "Processing directory: $dir"
  
  # Find all .ts files and check for JSX
  for file in $(find "$dir" -type f -name "*.ts" | grep -v "node_modules" | grep -v ".d.ts"); do
    if contains_jsx "$file"; then
      # File contains JSX, rename to .tsx
      new_file="${file%.ts}.tsx"
      echo "Renaming: $file -> $new_file (contains JSX)"
      mv "$file" "$new_file"
    fi
  done
}

# Files to process
process_dir "src/test-utils"
process_dir "src/utils"

echo "File renaming completed!" 