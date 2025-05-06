#!/bin/bash

echo "Setting up backup and recovery procedures..."

# Create backup configuration
cat > config/backup-config.json << EOL
{
  "backup": {
    "schedule": "0 0 * * *",
    "retentionDays": 30,
    "locations": {
      "local": "/backups/local",
      "remote": "s3://backup-bucket"
    },
    "databases": {
      "redis": true,
      "postgres": true
    },
    "verification": {
      "enabled": true,
      "frequency": "daily"
    }
  }
}
EOL

# Create backup script
cat > scripts/backup.sh << EOL
#!/bin/bash

timestamp=\$(date +"%Y-%m-%d_%H-%M-%S")
backup_dir="/backups/local/\$timestamp"

# Create backup directory
mkdir -p \$backup_dir

# Backup Redis
redis-cli SAVE
cp /var/lib/redis/dump.rdb \$backup_dir/redis.rdb

# Backup PostgreSQL
pg_dump -U postgres -F c -b -v -f \$backup_dir/postgres.dump

# Verify backups
if [ -f \$backup_dir/redis.rdb ] && [ -f \$backup_dir/postgres.dump ]; then
  echo "Backup verification successful"
  # Upload to remote storage
  aws s3 cp \$backup_dir s3://backup-bucket/\$timestamp --recursive
else
  echo "Backup verification failed"
  exit 1
fi

# Clean up old backups
find /backups/local -type d -mtime +30 -exec rm -rf {} \;
EOL

# Create recovery script
cat > scripts/recover.sh << EOL
#!/bin/bash

if [ -z "\$1" ]; then
  echo "Usage: \$0 <backup_timestamp>"
  exit 1
fi

backup_timestamp=\$1
backup_dir="/backups/local/\$backup_timestamp"

# Verify backup exists
if [ ! -d "\$backup_dir" ]; then
  echo "Backup not found: \$backup_dir"
  exit 1
fi

# Stop services
systemctl stop redis
systemctl stop postgresql

# Restore Redis
cp \$backup_dir/redis.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb

# Restore PostgreSQL
pg_restore -U postgres -d postgres -v \$backup_dir/postgres.dump

# Start services
systemctl start redis
systemctl start postgresql

echo "Recovery completed successfully"
EOL

chmod +x scripts/backup.sh
chmod +x scripts/recover.sh

echo "Backup and recovery setup complete" 