#!/bin/bash

# Set up a cron job for regular backup monitoring
# This script adds a daily cron job to run the backup monitoring script

# Get the absolute path to the project directory
PROJECT_DIR="$(pwd)"

# Create the cron job entry (runs daily at 7 AM)
CRON_JOB="0 7 * * * cd $PROJECT_DIR && npm run backup:monitor >> $PROJECT_DIR/logs/backup-monitoring.log 2>&1"

# Check if logs directory exists, if not create it
mkdir -p "$PROJECT_DIR/logs"

# Check if the cron job already exists to avoid duplicates
if (crontab -l 2>/dev/null | grep -F "$CRON_JOB" > /dev/null); then
  echo "Backup monitoring cron job already exists"
else
  # Add the new cron job
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "Backup monitoring cron job added successfully"
fi

# Set up log rotation for backup monitoring logs
cat > /tmp/backup-monitoring-logrotate << EOF
$PROJECT_DIR/logs/backup-monitoring.log {
  daily
  rotate 14
  compress
  missingok
  notifempty
  create 0640 $(whoami) $(id -gn)
}
EOF

# Check if we have permission to set up logrotate
if [ -w /etc/logrotate.d/ ]; then
  sudo mv /tmp/backup-monitoring-logrotate /etc/logrotate.d/backup-monitoring
  echo "Log rotation for backup monitoring logs set up"
else
  echo "Logrotate configuration created at /tmp/backup-monitoring-logrotate"
  echo "You may need sudo permissions to move it to /etc/logrotate.d/"
fi

echo "Setup complete. Backup monitoring will run daily at 7 AM."
echo "Logs will be saved to $PROJECT_DIR/logs/backup-monitoring.log"

# Also initialize the backup system right now if the application is running
if curl -s http://localhost:3000 > /dev/null; then
  echo "Initializing backup system..."
  npm run backup:init
else
  echo "Application does not appear to be running. Please start the application and run 'npm run backup:init' manually."
fi 