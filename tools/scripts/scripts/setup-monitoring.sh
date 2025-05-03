#!/bin/bash

# Vibewell Monitoring and Logging Setup Script
# This script implements the monitoring and logging configuration 
# as described in docs/monitoring-logging.md

echo "Setting up Vibewell Monitoring and Logging Systems..."

# Create necessary directories
mkdir -p ./monitoring/config
mkdir -p ./monitoring/dashboards
mkdir -p ./monitoring/alerts

# Setup Environment Variables
cat > .env.monitoring << EOF
# New Relic Configuration
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_APP_NAME=Vibewell-Production
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true

# AWS CloudWatch Configuration
AWS_CLOUDWATCH_NAMESPACE=Vibewell
AWS_CLOUDWATCH_REGION=us-east-1

# Elasticsearch Configuration
ELASTICSEARCH_URL=https://elasticsearch.vibewell.com
ELASTICSEARCH_USER=elastic_user
ELASTICSEARCH_PASSWORD=elastic_password

# Grafana Configuration
GRAFANA_URL=https://grafana.vibewell.com
GRAFANA_API_KEY=grafana_api_key

# PagerDuty Configuration
PAGERDUTY_ROUTING_KEY=pagerduty_key
EOF

echo "Environment configuration created: .env.monitoring"

# Create New Relic APM Configuration
cat > ./monitoring/config/newrelic.js << EOF
'use strict'

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Vibewell-Production'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  distributed_tracing: {
    enabled: true
  },
  transaction_tracer: {
    record_sql: 'obfuscated',
    explain_threshold: 500
  },
  slow_sql: {
    enabled: true,
    max_samples: 10
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [401, 404]
  }
}
EOF

echo "New Relic APM configuration created"

# Create CloudWatch Alarms Configuration Template
cat > ./monitoring/config/cloudwatch-alarms.json << EOF
{
  "Alarms": [
    {
      "Name": "HighCPUUtilization",
      "Metric": "CPUUtilization",
      "Namespace": "AWS/ECS",
      "Statistic": "Average",
      "Period": 300,
      "Threshold": 80,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 2,
      "AlarmActions": ["arn:aws:sns:us-east-1:123456789012:vibewell-alerts"],
      "Severity": "Warning"
    },
    {
      "Name": "CriticalCPUUtilization",
      "Metric": "CPUUtilization",
      "Namespace": "AWS/ECS",
      "Statistic": "Average",
      "Period": 300,
      "Threshold": 90,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 1,
      "AlarmActions": ["arn:aws:sns:us-east-1:123456789012:vibewell-critical-alerts"],
      "Severity": "Critical"
    },
    {
      "Name": "HighMemoryUtilization",
      "Metric": "MemoryUtilization",
      "Namespace": "AWS/ECS",
      "Statistic": "Average",
      "Period": 300,
      "Threshold": 85,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 2,
      "AlarmActions": ["arn:aws:sns:us-east-1:123456789012:vibewell-alerts"],
      "Severity": "Warning"
    },
    {
      "Name": "HTTP5xxErrors",
      "Metric": "HTTPCode_ELB_5XX_Count",
      "Namespace": "AWS/ApplicationELB",
      "Statistic": "Sum",
      "Period": 300,
      "Threshold": 10,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 1,
      "AlarmActions": ["arn:aws:sns:us-east-1:123456789012:vibewell-critical-alerts"],
      "Severity": "Critical"
    },
    {
      "Name": "APILatency",
      "Metric": "p95LatencyTime",
      "Namespace": "AWS/ApiGateway",
      "Statistic": "p95",
      "Period": 300,
      "Threshold": 500,
      "ComparisonOperator": "GreaterThanThreshold",
      "EvaluationPeriods": 3,
      "AlarmActions": ["arn:aws:sns:us-east-1:123456789012:vibewell-alerts"],
      "Severity": "Warning"
    }
  ]
}
EOF

echo "CloudWatch alarms configuration created"

# Create Grafana Dashboard Configuration (sample)
cat > ./monitoring/dashboards/main-dashboard.json << EOF
{
  "dashboard": {
    "id": null,
    "title": "Vibewell Operations Dashboard",
    "tags": ["vibewell", "production"],
    "timezone": "browser",
    "schemaVersion": 22,
    "version": 0,
    "refresh": "5m",
    "panels": [
      {
        "title": "System CPU Utilization",
        "type": "graph",
        "datasource": "CloudWatch",
        "targets": [
          {
            "namespace": "AWS/ECS",
            "metricName": "CPUUtilization",
            "statistics": ["Average"],
            "dimensions": {
              "ServiceName": "vibewell-api"
            }
          }
        ]
      },
      {
        "title": "Memory Utilization",
        "type": "graph",
        "datasource": "CloudWatch",
        "targets": [
          {
            "namespace": "AWS/ECS",
            "metricName": "MemoryUtilization",
            "statistics": ["Average"],
            "dimensions": {
              "ServiceName": "vibewell-api"
            }
          }
        ]
      },
      {
        "title": "HTTP Response Codes",
        "type": "graph",
        "datasource": "CloudWatch",
        "targets": [
          {
            "namespace": "AWS/ApplicationELB",
            "metricName": "HTTPCode_Target_2XX_Count",
            "statistics": ["Sum"]
          },
          {
            "namespace": "AWS/ApplicationELB",
            "metricName": "HTTPCode_Target_4XX_Count",
            "statistics": ["Sum"]
          },
          {
            "namespace": "AWS/ApplicationELB",
            "metricName": "HTTPCode_Target_5XX_Count",
            "statistics": ["Sum"]
          }
        ]
      },
      {
        "title": "API Latency",
        "type": "graph",
        "datasource": "New Relic",
        "targets": [
          {
            "query": "SELECT average(duration) FROM Transaction WHERE appName = 'Vibewell-Production' FACET name TIMESERIES"
          }
        ]
      }
    ]
  }
}
EOF

echo "Grafana dashboard configuration created"

# Setup Elasticsearch index template for logs
cat > ./monitoring/config/elasticsearch-log-template.json << EOF
{
  "index_patterns": ["vibewell-logs-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "5s"
  },
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "traceId": { "type": "keyword" },
      "userId": { "type": "keyword" },
      "message": { "type": "text" },
      "data": { "type": "object", "dynamic": true }
    }
  }
}
EOF

echo "Elasticsearch log template created"

# Create a basic log shipper configuration (Filebeat)
cat > ./monitoring/config/filebeat.yml << EOF
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/vibewell/*.log
  json.keys_under_root: true
  json.add_error_key: true

output.elasticsearch:
  hosts: ["${ELASTICSEARCH_URL}"]
  username: "${ELASTICSEARCH_USER}"
  password: "${ELASTICSEARCH_PASSWORD}"
  index: "vibewell-logs-%{+yyyy.MM.dd}"
EOF

echo "Filebeat configuration created"

# Create PagerDuty alert configuration
cat > ./monitoring/alerts/pagerduty-rules.json << EOF
{
  "services": [
    {
      "name": "Vibewell-Production",
      "escalation_policy_id": "EXAMPLE123",
      "alert_creation": "create_alerts_and_incidents",
      "alert_grouping": "intelligent"
    }
  ],
  "event_rules": [
    {
      "conditions": [
        {
          "expression": "event.severity matches 'critical'"
        }
      ],
      "actions": [
        {
          "route_to": "EXAMPLE123"
        }
      ]
    },
    {
      "conditions": [
        {
          "expression": "event.severity matches 'warning'"
        }
      ],
      "actions": [
        {
          "route_to": "EXAMPLE456"
        }
      ]
    }
  ]
}
EOF

echo "PagerDuty alert configuration created"

# Create sample Node.js logging middleware
cat > ./monitoring/config/logger.js << EOF
const winston = require('winston');
const { format } = winston;

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'vibewell-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});

// Express middleware
const loggerMiddleware = (req, res, next) => {
  // Assign a unique ID to each request
  req.requestId = req.headers['x-request-id'] || 
                 req.headers['x-correlation-id'] || 
                 require('crypto').randomBytes(16).toString('hex');

  // Log the request
  logger.info({
    message: \`Request received: \${req.method} \${req.path}\`,
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    userId: req.user ? req.user.id : 'anonymous',
    userAgent: req.headers['user-agent']
  });

  // Capture the response time
  const start = Date.now();
  
  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - start;
    
    logger.info({
      message: \`Request completed: \${req.method} \${req.path}\`,
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime,
      userId: req.user ? req.user.id : 'anonymous'
    });
    
    res.end = originalEnd;
    return res.end(chunk, encoding);
  };
  
  next();
};

module.exports = { logger, loggerMiddleware };
EOF

echo "Node.js logging middleware created"

# Generate a CloudWatch agent configuration file
cat > ./monitoring/config/cloudwatch-agent.json << EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "namespace": "Vibewell",
    "metrics_collected": {
      "cpu": {
        "resources": ["*"],
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "totalcpu": true
      },
      "mem": {
        "measurement": [
          "mem_used_percent",
          "mem_available",
          "mem_total"
        ]
      },
      "disk": {
        "resources": ["/"],
        "measurement": [
          "disk_used_percent",
          "disk_free",
          "disk_total"
        ]
      },
      "diskio": {
        "resources": ["*"],
        "measurement": [
          "diskio_reads",
          "diskio_writes"
        ]
      },
      "netstat": {
        "measurement": [
          "tcp_established",
          "tcp_time_wait"
        ]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/vibewell/*.log",
            "log_group_name": "vibewell-application-logs",
            "log_stream_name": "{instance_id}-{hostname}-{ip_address}",
            "retention_in_days": 30
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "vibewell-nginx-access-logs",
            "log_stream_name": "{instance_id}-{hostname}-{ip_address}",
            "retention_in_days": 30
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "vibewell-nginx-error-logs",
            "log_stream_name": "{instance_id}-{hostname}-{ip_address}",
            "retention_in_days": 30
          }
        ]
      }
    }
  }
}
EOF

echo "CloudWatch agent configuration created"

echo "Creating synthetic monitoring checks configuration..."
cat > ./monitoring/config/synthetic-checks.js << EOF
module.exports = {
  checks: [
    {
      name: 'Vibewell Homepage',
      url: 'https://vibewell.com',
      frequency: 1,
      locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      assertions: [
        { type: 'statusCode', value: 200 },
        { type: 'maxResponseTime', value: 3000 }
      ]
    },
    {
      name: 'Vibewell API Health',
      url: 'https://api.vibewell.com/health',
      frequency: 1,
      locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      assertions: [
        { type: 'statusCode', value: 200 },
        { type: 'maxResponseTime', value: 1000 },
        { type: 'bodyContains', value: '"status":"healthy"' }
      ]
    },
    {
      name: 'Vibewell Login Flow',
      type: 'browser',
      script: './monitoring/scripts/login-check.js',
      frequency: 5,
      locations: ['us-east-1']
    }
  ]
};
EOF

echo "Synthetic checks configuration created"

# Create the login check script
mkdir -p ./monitoring/scripts
cat > ./monitoring/scripts/login-check.js << EOF
async function loginCheck({ page }) {
  await page.goto('https://vibewell.com/login');
  
  // Wait for login form to load
  await page.waitForSelector('input[name="email"]');
  
  // Fill in login credentials (use test account)
  await page.type('input[name="email"]', 'test@example.com');
  await page.type('input[name="password"]', 'TestPassword123');
  
  // Click the login button
  await page.click('button[type="submit"]');
  
  // Wait for successful login redirect
  await page.waitForNavigation();
  
  // Check if we're on the dashboard page
  const url = page.url();
  if (!url.includes('/dashboard')) {
    throw new Error('Login failed - not redirected to dashboard');
  }
  
  // Check for element that should be present after login
  await page.waitForSelector('[data-testid="user-greeting"]');
  
  return {
    success: true
  };
}

module.exports = loginCheck;
EOF

echo "Login check script created"

# Create a basic README for the monitoring setup
cat > ./monitoring/README.md << EOF
# Vibewell Monitoring and Logging

This directory contains the configuration files and scripts for the Vibewell monitoring and logging setup.

## Components

- **New Relic APM**: Application performance monitoring
- **CloudWatch**: Infrastructure monitoring and logs
- **Elasticsearch**: Log aggregation and searching
- **Grafana**: Dashboards and visualization
- **PagerDuty**: Alerting and incident management

## Setup

1. Update the environment variables in \`.env.monitoring\`
2. Run the setup-monitoring.sh script
3. Deploy the configurations to your environment

## Directory Structure

- \`config/\`: Configuration files for monitoring tools
- \`dashboards/\`: Grafana dashboard definitions
- \`alerts/\`: Alert configurations
- \`scripts/\`: Synthetic monitoring scripts

## Contact

For questions or issues, contact the DevOps team.
EOF

# Create a simple deployment script for the monitoring setup
cat > ./monitoring/deploy.sh << EOF
#!/bin/bash

# Load environment variables
source .env.monitoring

echo "Deploying Vibewell monitoring and logging configuration..."

# AWS CloudWatch deployment
echo "Deploying CloudWatch configuration..."
aws cloudwatch put-dashboard \
  --dashboard-name "Vibewell-Main" \
  --dashboard-body file://monitoring/dashboards/main-dashboard.json

# Create alarm from template
echo "Creating CloudWatch alarms..."
for alarm in \$(jq -c '.Alarms[]' monitoring/config/cloudwatch-alarms.json); do
  name=\$(echo \$alarm | jq -r '.Name')
  metric=\$(echo \$alarm | jq -r '.Metric')
  namespace=\$(echo \$alarm | jq -r '.Namespace')
  statistic=\$(echo \$alarm | jq -r '.Statistic')
  period=\$(echo \$alarm | jq -r '.Period')
  threshold=\$(echo \$alarm | jq -r '.Threshold')
  comparison=\$(echo \$alarm | jq -r '.ComparisonOperator')
  eval_periods=\$(echo \$alarm | jq -r '.EvaluationPeriods')
  actions=\$(echo \$alarm | jq -r '.AlarmActions[]')
  
  aws cloudwatch put-metric-alarm \
    --alarm-name "\$name" \
    --metric-name "\$metric" \
    --namespace "\$namespace" \
    --statistic "\$statistic" \
    --period "\$period" \
    --threshold "\$threshold" \
    --comparison-operator "\$comparison" \
    --evaluation-periods "\$eval_periods" \
    --alarm-actions "\$actions"
done

echo "CloudWatch configuration deployed"

echo "Monitoring and logging deployment complete!"

# Instructions for next steps
echo ""
echo "Next steps:"
echo "1. Set up the New Relic integration in your application"
echo "2. Configure your CI/CD pipeline to update these configurations"
echo "3. Set up PagerDuty integrations for your team"
echo "4. Customize the dashboards for your specific needs"
echo ""
EOF

chmod +x ./monitoring/deploy.sh

echo "Monitoring setup script completed successfully!"
echo "The implementation includes:"
echo "- New Relic APM configuration"
echo "- CloudWatch metrics and alarms setup"
echo "- Elasticsearch log templates"
echo "- Grafana dashboards"
echo "- Synthetic monitoring checks"
echo "- PagerDuty alerting configuration"
echo ""
echo "To deploy this monitoring setup, run: ./monitoring/deploy.sh"
echo "Make sure to update the .env.monitoring file with your actual credentials first."

# Make the script executable
chmod +x scripts/setup-monitoring.sh 