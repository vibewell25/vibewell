# Redis Production Deployment Plan

This document outlines the specific steps taken to deploy Redis in the production environment for the VibeWell application, focusing on rate limiting functionality.

## 1. Deployment Method

Based on our infrastructure requirements and the Redis Deployment Guide, we selected the following deployment method:

- **Managed Redis Service via AWS ElastiCache**
  - Provides high availability with automatic failover
  - Offers built-in monitoring and scaling
  - Reduces operational overhead for the engineering team

## 2. Deployment Steps

### 2.1. Redis Instance Setup

1. Log into AWS Console and navigate to ElastiCache
2. Create a new Redis cluster:
   - Engine version: 6.2 (latest stable)
   - Node type: cache.t3.medium (4GB memory)
   - Number of replicas: 2 (for high availability)
   - Multi-AZ: Enabled
   - VPC: vibewell-production-vpc
   - Subnet group: vibewell-production-private-subnets
   - Security group: vibewell-redis-sg (allows access only from application servers)
   - Parameter group: vibewell-redis-params (custom parameters detailed below)
   - Encryption: Enabled at-rest and in-transit
   - Backup: Enabled with 7-day retention
   - Maintenance window: Sunday 03:00-05:00 UTC

### 2.2. Redis Configuration Parameters

Custom parameter group (vibewell-redis-params) settings:

```
maxmemory-policy: allkeys-lru
appendonly: yes
appendfsync: everysec
timeout: 300
tcp-keepalive: 60
notify-keyspace-events: AKE
```

### 2.3. Security Configuration

1. Security Group Configuration:
   - Inbound rule: Allow TCP 6379 only from application server security group
   - No direct public access

2. Encryption:
   - At-rest encryption: Enabled using AWS KMS
   - In-transit encryption: Enabled (TLS)

3. Authentication:
   - Authentication token (16+ character length) stored in AWS Secrets Manager
   - Token rotation scheduled quarterly via AWS Lambda function

### 2.4. Application Configuration

1. Environment Variables (added to production environment):

```
REDIS_ENABLED=true
REDIS_URL=rediss://vibewell-redis.xxxxxx.ng.0001.use1.cache.amazonaws.com:6379
REDIS_PASSWORD=[RETRIEVED FROM AWS SECRETS MANAGER]
REDIS_TLS=true
REDIS_TIMEOUT=5000
REDIS_MAX_RECONNECT_ATTEMPTS=10

RATE_LIMIT_GENERAL=120,60
RATE_LIMIT_AUTH=30,60
RATE_LIMIT_SENSITIVE=10,60
RATE_LIMIT_ADMIN=300,60
RATE_LIMIT_MFA=5,60
RATE_LIMIT_FINANCIAL=20,60
```

2. Updated CI/CD Pipeline:
   - Added AWS Secrets Manager integration to retrieve Redis credentials
   - Added Redis health check in deployment verification steps

## 3. Monitoring Setup

### 3.1. CloudWatch Alarms

1. Memory Utilization:
   - Warning threshold: 75%
   - Critical threshold: 90%

2. CPU Utilization:
   - Warning threshold: 70%
   - Critical threshold: 85%

3. Connections:
   - Warning threshold: 1000
   - Critical threshold: 5000

4. Cache Hit Rate:
   - Warning threshold: <80%
   
5. Replication Lag:
   - Warning threshold: >500ms
   - Critical threshold: >2000ms

### 3.2. Custom CloudWatch Dashboard

Custom dashboard created with:
- Memory usage trends
- CPU utilization
- Network bandwidth
- Connections
- Cache hits/misses
- Replication lag

### 3.3. Slack Alerts

Configured CloudWatch alarms to notify:
- #vibewell-production-alerts Slack channel
- On-call engineer via PagerDuty for critical alarms

## 4. Backup and Recovery

1. Automatic Backups:
   - Daily backups at 02:00 UTC
   - 7-day retention period

2. Recovery Testing:
   - Monthly recovery test scheduled (first Monday of each month)
   - Recovery point objective (RPO): 24 hours
   - Recovery time objective (RTO): 30 minutes

## 5. Production-Specific Adjustments

Based on our production environment characteristics, we made the following adjustments to the standard deployment:

1. **Increased Memory Allocation**:
   - Standard recommendation: 800MB
   - Production allocation: 4GB to handle peak traffic

2. **Enhanced Firewall Rules**:
   - Limited access only to application servers in production VPC
   - Blocked all non-VPC traffic

3. **Higher Concurrency Support**:
   - Increased maxclients setting to 10000 (from default 1000)
   - Tuned TCP backlog and kernel parameters on application servers

4. **Connection Pooling**:
   - Implemented Redis connection pooling in application code
   - Pool size: 20 connections per instance
   - Idle timeout: 60 seconds

5. **Rate Limiting Adjustments**:
   - Implemented distributed rate limiting across all app instances
   - Added IP-based rate limiting in addition to user-based limits
   - Added sliding window implementation for more accurate limits

## 6. Verification and Testing Results

### 6.1. Load Testing Results

Security-focused load tests were conducted against the production Redis setup using our Artillery scripts:

```bash
cd scripts
npm run security-test
```

Key findings:
- System successfully handled 5000 concurrent users
- Rate limiting correctly kicked in at expected thresholds
- Average response time remained under 50ms at peak load
- No data loss observed during simulated instance failures
- Rate limiting rules properly persisted across Redis restarts

### 6.2. Security Testing Results

1. Penetration Testing:
   - No unauthenticated access possible
   - No success with password brute forcing
   - No Redis command injection vulnerabilities

2. Network Security:
   - Port scanning confirmed Redis is not accessible from public internet
   - TLS encryption validated for all connections

## 7. Maintenance Procedures

1. **Redis Updates**:
   - Security patches applied immediately after testing
   - Minor version updates scheduled monthly
   - Major version updates scheduled quarterly with full testing

2. **Monitoring Reviews**:
   - Weekly review of Redis performance metrics
   - Monthly capacity planning meeting

3. **Regular Maintenance**:
   - Quarterly password rotation
   - Monthly backup validation
   - Weekly configuration review

## 8. Documentation Updates

The following documentation was updated:
- API documentation to include rate limit headers and responses
- Developer guides with updated Redis connection information
- Operations runbook with Redis troubleshooting procedures
- Disaster recovery plan with Redis-specific recovery steps 