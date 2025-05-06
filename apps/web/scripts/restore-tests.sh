#!/usr/bin/env bash
set -e

# Restore archived test files to their original locations
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE_DIR="$BASE_DIR/test-archive"

echo "Restoring test files from $ARCHIVE_DIR to $BASE_DIR/src"

if [ ! -d "$ARCHIVE_DIR" ]; then
  echo "Archive directory does not exist: $ARCHIVE_DIR"
  exit 1
fi

find "$ARCHIVE_DIR" -type f -print0 | \
  while IFS= read -r -d '' file; do
    rel_path="${file#$ARCHIVE_DIR/}"
    dest_file="$BASE_DIR/src/$rel_path"
    mkdir -p "$(dirname "$dest_file")"
    mv "$file" "$dest_file"
  done

echo "Restore complete. Review moved files and delete $ARCHIVE_DIR if satisfied." 