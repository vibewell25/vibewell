#!/usr/bin/env bash
set -e

# Archive and remove all test files in the web app
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE_DIR="$BASE_DIR/test-archive"

echo "Archiving test files to $ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"

# Find and move all .test.* and .spec.* files without hitting command-line limits
find "$BASE_DIR/src" -type f \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' \) -print0 |
  while IFS= read -r -d '' file; do
    # compute relative path and destination
    rel="${file#$BASE_DIR/}"
    dest_dir="$ARCHIVE_DIR/$(dirname "$rel")"
    mkdir -p "$dest_dir"
    mv "$file" "$dest_dir/$(basename "$file")"
  done

echo "Archive complete. Run 'npm test' to confirm no tests remain." 