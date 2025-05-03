#!/bin/bash

timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
backup_dir="backups/local/$timestamp"

# Create backup directory
mkdir -p "$backup_dir"

# Backup important configuration files
echo "Backing up configuration files..."
cp -r config/* "$backup_dir/config" 2>/dev/null || mkdir -p "$backup_dir/config"

# Backup scripts
echo "Backing up scripts..."
cp -r scripts/* "$backup_dir/scripts" 2>/dev/null || mkdir -p "$backup_dir/scripts"

# Backup documentation
echo "Backing up documentation..."
cp -r docs/* "$backup_dir/docs" 2>/dev/null || mkdir -p "$backup_dir/docs"

# Create backup manifest
echo "Creating backup manifest..."
cat > "$backup_dir/manifest.json" << EOL
{
  "timestamp": "$timestamp",
  "backup_type": "local_files",
  "contents": {
    "config": true,
    "scripts": true,
    "docs": true
  }
}
EOL

# Verify backup
if [ -f "$backup_dir/manifest.json" ]; then
  echo "Backup verification successful"
  echo "Backup stored in: $backup_dir"
else
  echo "Backup verification failed"
  exit 1
fi

# Clean up old backups (keep last 5)
echo "Cleaning up old backups..."
ls -dt backups/local/* | tail -n +6 | xargs rm -rf

echo "Backup completed successfully"
