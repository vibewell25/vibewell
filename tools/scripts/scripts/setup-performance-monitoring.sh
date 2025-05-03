#!/bin/bash

echo "Setting up performance monitoring and dashboards..."

# Create performance monitoring configuration
cat > config/performance-dashboard.json << EOL
{
  "dashboard": {
    "refreshInterval": 60,
    "metrics": {
      "responseTime": {
        "enabled": true,
        "threshold": 1000
      },
      "memoryUsage": {
        "enabled": true,
        "threshold": 80
      },
      "cpuUsage": {
        "enabled": true,
        "threshold": 70
      },
      "networkLatency": {
        "enabled": true,
        "threshold": 200
      }
    },
    "alerts": {
      "email": true,
      "slack": true,
      "threshold": 80
    }
  }
}
EOL

# Create performance monitoring script
cat > scripts/monitor-performance.sh << EOL
#!/bin/bash

while true; do
  timestamp=\$(date +"%Y-%m-%d %H:%M:%S")
  
  # Collect performance metrics
  response_time=\$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000)
  memory_usage=\$(free | grep Mem | awk '{print \$3/\$2 * 100.0}')
  cpu_usage=\$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}')
  
  # Log metrics
  echo "[\$timestamp] Response Time: \$response_time ms, Memory Usage: \$memory_usage%, CPU Usage: \$cpu_usage%" >> logs/performance/performance-\$(date +"%Y-%m-%d").log
  
  # Check thresholds
  if (( \$(echo "\$response_time > 1000" | bc -l) )); then
    echo "High response time detected: \$response_time ms" | mail -s "Performance Alert" admin@example.com
  fi
  
  if (( \$(echo "\$memory_usage > 80" | bc -l) )); then
    echo "High memory usage detected: \$memory_usage%" | mail -s "Performance Alert" admin@example.com
  fi
  
  if (( \$(echo "\$cpu_usage > 70" | bc -l) )); then
    echo "High CPU usage detected: \$cpu_usage%" | mail -s "Performance Alert" admin@example.com
  fi
  
  sleep 60
done
EOL

chmod +x scripts/monitor-performance.sh

echo "Performance monitoring setup complete" 