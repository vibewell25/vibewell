# Vibewell Monitoring and Logging Configuration

## Overview

This document outlines the monitoring and logging strategy for the Vibewell platform, ensuring reliable operations, quick problem detection, and comprehensive visibility into system performance and user behavior.

## Monitoring Architecture

### Key Components

- **Infrastructure Monitoring**: AWS CloudWatch
- **Application Performance Monitoring**: New Relic
- **Real User Monitoring**: New Relic Browser
- **Log Management**: CloudWatch Logs + Elasticsearch
- **Synthetic Testing**: Checkly
- **Status Page**: Statuspage.io

### System Architecture

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│  AWS CloudWatch │     │   New Relic   │     │  Elasticsearch  │
│  (Infra Metrics)│     │  (APM Metrics) │     │   (Log Data)   │
└────────┬────────┘     └───────┬───────┘     └────────┬───────┘
         │                      │                      │
         ▼                      ▼                      ▼
      ┌─────────────────────────────────────────────────────┐
      │                Grafana Dashboards                   │
      └──────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
      ┌─────────────────────────────────────────────────────┐
      │              PagerDuty/Slack/Email                  │
      │                  (Alerting)                         │
      └─────────────────────────────────────────────────────┘
```

## Infrastructure Monitoring

### CloudWatch Configuration

#### Metrics Collection

```yaml
# Core infrastructure metrics to collect
core_metrics:
  - CPUUtilization
  - MemoryUtilization
  - DiskIOPS
  - NetworkIn/Out
  - RequestCount
  - TargetResponseTime
  - HTTPCode_ELB_4XX/5XX
  - DatabaseConnections
  - CacheHitRate
```

#### Metric Namespaces

- AWS/ECS
- AWS/Lambda
- AWS/RDS
- AWS/ElastiCache
- AWS/ApiGateway
- AWS/ApplicationELB
- Custom/Vibewell

#### CloudWatch Alarms

| Metric | Threshold | Period | Actions |
|--------|-----------|--------|---------|
| CPUUtilization | >80% | 5 min | Warning alert |
| CPUUtilization | >90% | 5 min | Critical alert |
| MemoryUtilization | >85% | 5 min | Warning alert |
| HTTP 5XX errors | >1% of requests | 5 min | Critical alert |
| API Latency | >500ms (p95) | 5 min | Warning alert |

## Application Performance Monitoring

### New Relic APM

#### Agent Configuration

```javascript
// New Relic Node.js agent configuration
newrelic.config.js:

exports.config = {
  app_name: ['Vibewell-Production'],
  license_key: '${NEW_RELIC_LICENSE_KEY}',
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
```

#### Key Transactions

Configure the following as key transactions with enhanced monitoring:

- User login process
- Booking creation
- Payment processing
- AR model loading
- Provider search

#### Custom Attributes

Capture these custom attributes for enhanced troubleshooting:

- userId (anonymized)
- userRole
- planTier
- deviceType
- pageType
- featureFlags

## Real User Monitoring

### Browser Monitoring

```html
<!-- New Relic Browser Agent -->
<script type="text/javascript">
window.NREUM||(NREUM={}),__nr_require=function(){/* Agent code injected by New Relic */};
</script>
```

#### Core Web Vitals Tracking

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)

#### Custom Events

```javascript
// Track AR feature usage
newrelic.addPageAction('ARFeatureUsed', {
  modelId: '12345',
  deviceType: 'mobile',
  loadTime: 1250,
  userSegment: 'premium'
});
```

## Log Management

### Log Sources

| Source | Log Type | Storage |
|--------|----------|---------|
| ECS Tasks | Application logs | CloudWatch Logs |
| Lambda | Function logs | CloudWatch Logs |
| ALB | Access logs | S3 → Elasticsearch |
| CloudFront | Access logs | S3 → Elasticsearch |
| API Gateway | Execution logs | CloudWatch Logs |
| RDS | Database logs | CloudWatch Logs |
| WAF | Security logs | S3 → Elasticsearch |

### Log Format

Standardized JSON log format:

```json
{
  "timestamp": "2023-04-12T15:22:31.123Z",
  "level": "info",
  "service": "booking-service",
  "traceId": "abc123",
  "userId": "user_anonymized",
  "message": "Booking created successfully",
  "data": {
    "bookingId": "booking_123",
    "serviceType": "haircut",
    "processingTime": 230
  }
}
```

### Log Retention

- Hot storage (CloudWatch Logs): 30 days
- Warm storage (Elasticsearch): 90 days
- Cold storage (S3): 1 year
- Archived storage (S3 Glacier): 7 years for compliance data

### Log Processing

1. Logs collected in CloudWatch Logs
2. Subscription filter to Lambda
3. Lambda processes logs (PII removal, enrichment)
4. Processed logs sent to Elasticsearch
5. Retention policies applied at each stage

## Alert Management

### Alert Levels

| Level | Response Time | Notification Channels | Examples |
|-------|---------------|------------------------|----------|
| P1: Critical | Immediate (24/7) | PagerDuty, SMS, Slack | Service down, data loss, security breach |
| P2: High | <1 hour (business hours) | PagerDuty, Slack | Performance degradation, non-critical feature failure |
| P3: Medium | Same business day | Slack, Email | Warning thresholds, minor issues |
| P4: Low | Next business day | Email | Informational, trend analysis |

### Alert Workflows

```
1. Alert triggered
   │
   ▼
2. Initial notification sent
   │
   ▼
3. Acknowledgment required (P1/P2)
   │
   ▼
4. Escalation after 15 mins if not acknowledged
   │
   ▼
5. Resolution workflow
   │
   ▼
6. Post-incident review for P1/P2
```

### Alert Tuning

- Review alert noise weekly
- Tune thresholds monthly based on patterns
- Implement alert correlation to reduce duplicate alerts
- Document alert response runbooks

## Dashboard Configuration

### Executive Dashboard

Key metrics for leadership visibility:
- Service uptime
- User activity trends
- Conversion rates
- Error rates
- Performance scores

### Operations Dashboard

Detailed metrics for operations team:
- Real-time user count
- Active service status
- Resource utilization
- Error breakdown
- Deployment status

### Developer Dashboard

Metrics for engineering teams:
- Code-level performance
- API latency by endpoint
- Database query performance
- Memory leak detection
- Error stack traces

## Synthetic Monitoring

### Key User Journeys

Automated tests every 5 minutes for critical paths:
1. Homepage load and navigation
2. User registration
3. Login process
4. Service search and filtering
5. Booking creation
6. Payment process (test mode)
7. AR model loading

### Configuration

```yaml
# Checkly configuration
checks:
  - name: "Homepage Availability"
    frequency: 5
    locations:
      - us-east-1
      - us-west-1
      - eu-west-1
    script: |
      const assert = require('chai').assert;
      const response = await page.goto('https://vibewell.com');
      assert.equal(response.status(), 200);
      await page.waitForSelector('.hero-section');
```

## Health Checks

### API Health Endpoints

- `/api/health` - Basic health check
- `/api/health/detailed` - Comprehensive check (internal only)

```javascript
// Health check implementation
app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION
  });
});

app.get('/api/health/detailed', authMiddleware, async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  const cacheStatus = await checkRedisConnection();
  
  res.status(200).json({
    status: dbStatus.ok && cacheStatus.ok ? 'ok' : 'degraded',
    components: {
      database: dbStatus,
      cache: cacheStatus,
      storage: await checkS3Access(),
      externalServices: await checkExternalServices()
    },
    metrics: {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
});
```

## Implementation Plan

### Phase 1: Core Monitoring

1. Set up CloudWatch metrics and basic alerts
2. Configure application logging to CloudWatch
3. Implement basic health checks
4. Create operational dashboards

### Phase 2: Enhanced Monitoring

1. Integrate New Relic APM
2. Set up Elasticsearch for log aggregation
3. Configure synthetic checks for critical paths
4. Implement real user monitoring

### Phase 3: Advanced Features

1. Set up anomaly detection
2. Implement predictive alerting
3. Create business metrics correlation
4. Develop custom dashboard for business stakeholders

## Best Practices

### Reducing Alert Fatigue

- Implement alert clustering
- Use dynamic thresholds based on baselines
- Create actionable alerts with clear ownership
- Regular review and pruning of alert rules

### Security Considerations

- Scrub PII/sensitive data from logs
- Implement role-based access to monitoring tools
- Audit access to logging and monitoring systems
- Regular rotation of API keys and credentials

### Documentation

- Maintain runbooks for common alerts
- Document dashboard interpretations
- Create troubleshooting guides linked from alerts
- Regular training on monitoring tools

## Appendix: Useful Queries

### CloudWatch Logs Insights

```
# Find all errors for a specific user
fields @timestamp, @message
| filter @message like /error/i
| filter userIdentifier = "user_123"
| sort @timestamp desc
| limit 100

# Performance analysis for slow API endpoints
fields @timestamp, apiPath, duration
| filter duration > 1000
| stats count(*) as requestCount, avg(duration) as avgDuration, max(duration) as maxDuration by apiPath
| sort avgDuration desc
```

### New Relic NRQL

```
# Apdex score by page type
SELECT apdex(duration, t:0.5) FROM PageView FACET pageType TIMESERIES

# Error rates by service
SELECT percentage(count(*), WHERE error IS true) FROM Transaction FACET appName TIMESERIES
``` 