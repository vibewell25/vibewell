# Redis Deployment and Configuration Guide

This guide details how to deploy, configure, and maintain Redis for the VibeWell application, specifically for rate limiting functionality.

## Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Configuration Options](#configuration-options)
4. [Security Best Practices](#security-best-practices)
5. [Monitoring and Metrics](#monitoring-and-metrics)
6. [Backup and Recovery](#backup-and-recovery)
7. [Scaling Redis](#scaling-redis)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance Tasks](#maintenance-tasks)

## Overview

Redis is used in the VibeWell application primarily for:

- **Rate limiting**: Tracking and enforcing API request limits
- **Distributed state**: Managing shared state across multiple application instances
- **Metrics collection**: Collecting operational metrics for monitoring

This implementation uses Redis 6.x with password authentication and persistence enabled.

## Deployment Options

### Docker Compose (Development/Testing)

The simplest method to deploy Redis is using Docker Compose, as configured in the project's `docker-compose.yml`:

```bash
docker-compose up -d redis redis-exporter prometheus grafana
```

This will start:
- Redis server on port 6379
- Redis Exporter for metrics on port 9121
- Prometheus for metrics collection on port 9090
- Grafana for visualization on port 3001

### Production Deployment Options

For production environments, consider:

1. **Managed Redis Service**:
   - AWS ElastiCache for Redis
   - Azure Cache for Redis
   - Redis Labs Redis Enterprise Cloud
   - Google Cloud Memorystore for Redis
   
2. **Self-Hosted on VM/Bare Metal**:
   - Follow the configuration in this guide
   - Consider using Redis Sentinel for high availability

### Environment Variables

The following environment variables configure Redis behavior:

| Variable | Description | Default |
|----------|-------------|---------|
| REDIS_ENABLED | Enable/disable Redis | true |
| REDIS_URL | Redis connection URL | redis://redis:6379 |
| REDIS_PASSWORD | Redis auth password | redis_password |
| REDIS_TLS | Enable TLS encryption | false |
| REDIS_TIMEOUT | Connection timeout (ms) | 5000 |
| RATE_LIMIT_MODE | Rate limit implementation | redis |

These should be set in your `.env.production` file or in your environment.

## Configuration Options

### Redis Configuration File

Our Redis configuration optimizes for:
- Memory usage (800MB limit)
- Data persistence (AOF + RDB snapshots)
- Security (disabled dangerous commands)

Key configuration options:

```
# Memory management
maxmemory 800mb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000

# Security features
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
rename-command DEBUG ""
```

### Rate Limiting Configuration

Rate limiting can be configured with these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| RATE_LIMIT_GENERAL | General API rate limit | 120,60 (120 requests per 60 seconds) |
| RATE_LIMIT_AUTH | Authentication rate limit | 30,60 (30 requests per 60 seconds) |
| RATE_LIMIT_SENSITIVE | Sensitive operation rate limit | 10,60 (10 requests per 60 seconds) |
| RATE_LIMIT_ADMIN | Admin operation rate limit | 300,60 (300 requests per 60 seconds) |
| RATE_LIMIT_MFA | Multi-factor auth rate limit | 5,60 (5 requests per 60 seconds) |
| RATE_LIMIT_FINANCIAL | Financial operation rate limit | 20,60 (20 requests per 60 seconds) |

## Security Best Practices

### Network Security

1. **Firewall Rules**:
   - Allow Redis access only from application servers
   - Block external access to Redis port (6379)
   
   Use the provided script to configure firewall:
   ```bash
   ./scripts/redis-firewall-setup.sh
   ```

2. **Authentication**:
   - Always use strong passwords (minimum 16 characters)
   - Rotate Redis passwords regularly (quarterly)

3. **TLS Encryption**:
   - For production, enable TLS (set `REDIS_TLS=true`)
   - Configure Redis with proper certificates

### Instance Security

1. **Disable dangerous commands** (done in redis.conf)
2. **Run Redis as non-root user**
3. **Set proper file permissions on Redis data**
4. **Separate Redis from other services if possible**

## Monitoring and Metrics

### Grafana Dashboard

A Grafana dashboard is configured to monitor:
- Memory usage
- Command throughput
- Network traffic
- Client connections
- Cache hit/miss ratio
- Key count

Access Grafana at: http://yourserver:3001 (default credentials: admin/admin)

### Critical Metrics to Watch

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Memory usage | 80% | 90% |
| Command rate | 1000/sec | 5000/sec |
| Connected clients | 1000 | 5000 |
| Blocked clients | 10 | 50 |
| Keyspace misses | 30% | 50% |

### Log Monitoring

Redis logs important events to the Docker logs. Monitor them with:

```bash
docker logs -f redis
```

## Backup and Recovery

### Automatic Backups

Redis is configured with both RDB and AOF persistence:

1. **RDB Snapshots**:
   - Point-in-time backups
   - Configured to save:
     - After 900 seconds (15 minutes) if at least 1 key changed
     - After 300 seconds (5 minutes) if at least 10 keys changed
     - After 60 seconds if at least 10000 keys changed

2. **AOF (Append Only File)**:
   - Logs every write operation
   - Higher durability than RDB alone
   - Syncs every second (balance between performance and durability)

### Manual Backup

To perform a manual backup:

```bash
docker exec redis redis-cli -a $REDIS_PASSWORD SAVE
docker cp redis:/data/dump.rdb /backup/redis/dump-$(date +%Y%m%d-%H%M%S).rdb
```

### Recovery

To restore from backup:

1. Stop Redis:
   ```bash
   docker-compose stop redis
   ```

2. Replace the dump.rdb file:
   ```bash
   docker cp /backup/redis/your-backup.rdb redis:/data/dump.rdb
   ```

3. Restart Redis:
   ```bash
   docker-compose start redis
   ```

## Scaling Redis

### Vertical Scaling

For simple deployments, increase memory allocation:
1. Update `maxmemory` in redis.conf
2. Update the resource limits in docker-compose.yml
3. Restart Redis

### Horizontal Scaling

For high traffic applications:
1. **Redis Cluster**: Configure a Redis cluster for sharding
2. **Redis Sentinel**: Set up Redis Sentinel for high availability
3. **Read Replicas**: Add read replicas for read-heavy workloads

## Troubleshooting

### Common Issues

1. **High Memory Usage**:
   - Check what keys are consuming memory: `redis-cli --bigkeys`
   - Consider adjusting expiry policies
   - Increase maxmemory if necessary

2. **Slow Performance**:
   - Monitor with `redis-cli --latency`
   - Use `SLOWLOG GET 10` to check slow commands
   - Consider optimizing your rate limiting algorithm

3. **Connection Issues**:
   - Verify firewall rules
   - Check network connectivity
   - Ensure correct password is being used

### Diagnostic Commands

```bash
# Check overall Redis stats
redis-cli -a $REDIS_PASSWORD INFO

# Check memory usage
redis-cli -a $REDIS_PASSWORD INFO memory

# Monitor commands in real-time
redis-cli -a $REDIS_PASSWORD MONITOR

# Check client connections
redis-cli -a $REDIS_PASSWORD CLIENT LIST
```

### Health Check Script

Run the provided health check script for a quick diagnostic:

```bash
./scripts/redis-health-check.sh
```

This script checks:
- Redis connectivity
- Memory usage
- Persistence configuration
- Client connections
- Rate limiting data

## Maintenance Tasks

### Regular Maintenance

1. **Clean expired keys** (automatic with TTL settings)
2. **Check memory usage**: Weekly
3. **Backup validation**: Monthly, verify backup integrity
4. **Configuration review**: Quarterly

### Upgrade Process

To upgrade Redis:

1. Backup all data:
   ```bash
   docker exec redis redis-cli -a $REDIS_PASSWORD SAVE
   docker cp redis:/data /backup/redis-data-before-upgrade
   ```

2. Update the Redis version in docker-compose.yml

3. Apply the update:
   ```bash
   docker-compose up -d --no-deps redis
   ```

4. Verify everything works:
   ```bash
   ./scripts/redis-health-check.sh
   ```

To run the security load tests, you can now use:
```bash
cd scripts
npm install
npm run security-test 