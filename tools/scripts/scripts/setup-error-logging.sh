#!/bin/bash

echo "Setting up error logging and monitoring..."

# Create error logging directory
mkdir -p logs/error
mkdir -p logs/performance

# Set up error tracking configuration
cat > config/error-tracking.json << EOL
{
  "errorTracking": {
    "enabled": true,
    "logLevel": "info",
    "maxLogSize": "100MB",
    "retentionDays": 30,
    "alertThresholds": {
      "critical": 5,
      "warning": 10
    },
    "notifications": {
      "email": true,
      "slack": true
    }
  }
}
EOL

# Set up performance monitoring
cat > config/performance-monitoring.json << EOL
{
  "performance": {
    "metrics": {
      "responseTime": true,
      "memoryUsage": true,
      "cpuUsage": true,
      "networkLatency": true
    },
    "alertThresholds": {
      "responseTime": 1000,
      "memoryUsage": 80,
      "cpuUsage": 70
    },
    "samplingRate": 1
  }
}
EOL

# Create error logging script
cat > scripts/log-error.sh << EOL
#!/bin/bash

timestamp=\$(date +"%Y-%m-%d %H:%M:%S")
log_file="logs/error/error-\$(date +"%Y-%m-%d").log"

echo "[\$timestamp] \$1" >> \$log_file

# Check if error count exceeds threshold
error_count=\$(grep -c "ERROR" \$log_file)
if [ \$error_count -gt 5 ]; then
  echo "High error count detected: \$error_count" | mail -s "Error Alert" admin@example.com
fi
EOL

chmod +x scripts/log-error.sh

echo "Error logging setup complete" 