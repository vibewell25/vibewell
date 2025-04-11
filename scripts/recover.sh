#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_timestamp>"
  exit 1
fi

backup_timestamp=$1
backup_dir="backups/local/$backup_timestamp"

# Verify backup exists
if [ ! -d "$backup_dir" ]; then
  echo "Backup not found: $backup_dir"
  exit 1
fi

# Verify manifest exists
if [ ! -f "$backup_dir/manifest.json" ]; then
  echo "Invalid backup: manifest.json not found"
  exit 1
fi

echo "Starting recovery from backup: $backup_timestamp"

# Restore configuration files
if [ -d "$backup_dir/config" ]; then
  echo "Restoring configuration files..."
  cp -r "$backup_dir/config"/* config/ 2>/dev/null || true
fi

# Restore scripts
if [ -d "$backup_dir/scripts" ]; then
  echo "Restoring scripts..."
  cp -r "$backup_dir/scripts"/* scripts/ 2>/dev/null || true
  chmod +x scripts/*.sh
fi

# Restore documentation
if [ -d "$backup_dir/docs" ]; then
  echo "Restoring documentation..."
  cp -r "$backup_dir/docs"/* docs/ 2>/dev/null || true
fi

echo "Recovery completed successfully"
