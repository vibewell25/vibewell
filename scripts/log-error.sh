#!/bin/bash

timestamp=$(date +"%Y-%m-%d %H:%M:%S")
log_file="logs/error/error-$(date +"%Y-%m-%d").log"

echo "[$timestamp] $1" >> $log_file

# Check if error count exceeds threshold
error_count=$(grep -c "ERROR" $log_file)
if [ $error_count -gt 5 ]; then
  echo "High error count detected: $error_count" | mail -s "Error Alert" admin@example.com
fi
