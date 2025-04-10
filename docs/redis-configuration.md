# Redis Configuration Guide

This document outlines how to configure and optimize Redis for VibeWell's rate limiting system in production environments.

## Overview

VibeWell uses Redis as the backbone of our distributed rate limiting system in production. Redis provides:

- **Distributed rate limiting** across multiple application instances
- **Persistence** of rate limiting data across application restarts
- **High performance** for managing concurrent requests
- **Analytics capabilities** for monitoring rate limit events

## Prerequisites

- Redis 6.0+ installed on your server or a managed Redis service
- Network connectivity between your application servers and Redis
- Basic understanding of Redis configuration parameters

## Installation

### Self-Hosted Redis

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# Configure Redis to start on boot
sudo systemctl enable redis-server
```

### Cloud-Hosted Options

- **AWS ElastiCache**: Managed Redis service with automatic failover
- **Azure Cache for Redis**: Microsoft's managed Redis service
- **Redis Cloud**: Redis Labs' fully-managed Redis service
- **Upstash**: Serverless Redis with pay-per-use pricing (good for smaller deployments)

## Basic Configuration

Update your `.env` file with the following Redis configuration:

```
# Redis Connection
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=your-secure-password
REDIS_TLS=true
REDIS_DATABASE=0

# Redis Options
REDIS_KEY_PREFIX=vibewell:ratelimit:
REDIS_TIMEOUT=5000
REDIS_RETRY_COUNT=3
REDIS_RETRY_DELAY=1000
REDIS_MAX_RECONNECT_ATTEMPTS=10
```

### Configuration Parameters Explained

| Parameter | Description | Recommended Value |
|-----------|-------------|------------------|
| `REDIS_URL` | Connection URL for Redis | `redis://hostname:port` or `rediss://hostname:port` for TLS |
| `REDIS_PASSWORD` | Authentication password | Strong, unique password |
| `REDIS_TLS` | Whether to use TLS encryption | `true` for production |
| `REDIS_DATABASE` | Redis database index | `0` (or dedicated index for isolation) |
| `REDIS_KEY_PREFIX` | Prefix for all Redis keys | `vibewell:ratelimit:` |
| `REDIS_TIMEOUT` | Connection timeout in ms | `5000` |
| `REDIS_RETRY_COUNT` | Number of retry attempts | `3` |
| `REDIS_RETRY_DELAY` | Delay between retries in ms | `1000` |
| `REDIS_MAX_RECONNECT_ATTEMPTS` | Max reconnection attempts | `10` |

## Rate Limiting Configuration

The following environment variables control rate limiting behavior:

```
# Rate Limiting Configurations (requests,seconds)
RATE_LIMIT_GENERAL=120,60       # 120 requests per minute for general API
RATE_LIMIT_AUTH=30,60           # 30 requests per minute for auth endpoints
RATE_LIMIT_SENSITIVE=10,60      # 10 requests per minute for sensitive operations
RATE_LIMIT_ADMIN=300,60         # 300 requests per minute for admin operations
RATE_LIMIT_MFA=5,60             # 5 requests per minute for MFA operations
RATE_LIMIT_FINANCIAL=20,60      # 20 requests per minute for financial operations
```

## Redis Sentinel Configuration (High Availability)

For high-availability setups, configure Redis Sentinel:

```
REDIS_SENTINEL=true
REDIS_SENTINEL_NAME=mymaster
REDIS_SENTINEL_NODES=sentinel1:26379,sentinel2:26379,sentinel3:26379
```

## Redis Cluster Configuration (Sharding)

For large-scale deployments requiring sharding:

```
REDIS_CLUSTER=true
REDIS_CLUSTER_NODES=redis1:6379,redis2:6379,redis3:6379
```

## Security Best Practices

1. **Network Security**:
   - Place Redis servers in a private subnet
   - Use firewalls to restrict access to Redis ports
   - Enable TLS for all Redis connections

2. **Authentication**:
   - Use strong passwords
   - Enable Redis ACLs (Access Control Lists) for fine-grained permissions
   - Rotate Redis passwords regularly

3. **Data Security**:
   - Enable Redis persistence (RDB and/or AOF) for data durability
   - Set appropriate key expiration policies to prevent storage bloat
   - Regularly backup Redis data

## Redis Configuration Tuning

Optimize your `redis.conf` for production use:

```
# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
appendfsync everysec

# Connection settings
timeout 60
tcp-keepalive 300

# Security
protected-mode yes
```

## Monitoring Redis

Monitor your Redis instance for:

1. **Memory usage**: Watch for high memory utilization
2. **Latency**: Monitor command execution times
3. **Connection count**: Track number of active connections
4. **Hit rate**: Monitor cache hit/miss ratio
5. **Evictions**: Track key evictions due to memory pressure

Recommended monitoring tools:
- Redis INFO command
- Redis Exporter with Prometheus
- Grafana dashboards for Redis
- Redis enterprise monitoring (for managed services)

## Handling Redis Failures

The VibeWell application includes fallback mechanisms when Redis is unavailable:

1. **Circuit breaker**: Automatically switches to in-memory rate limiting if Redis is unavailable
2. **Graceful degradation**: Allows slightly more requests through when in fallback mode
3. **Reconnection strategy**: Attempts to reconnect to Redis with exponential backoff

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify Redis is running
   - Check network connectivity and firewall rules
   - Ensure correct hostname/port configuration

2. **Authentication Failed**
   - Verify Redis password is correct
   - Check if Redis requires ACL authentication

3. **High Memory Usage**
   - Review `maxmemory` setting
   - Check for key expiration policies
   - Look for memory leaks in application code

4. **Slow Performance**
   - Monitor Redis commands with `SLOWLOG`
   - Check for expensive operations like `KEYS` commands
   - Verify network latency between app and Redis

## Application Integration

The Redis client is implemented in `src/lib/redis/redis-client.ts` and provides:

- Connection pooling
- Automatic reconnection
- Error handling
- Rate limiting specific methods

## Redis CLI Commands for Rate Limiting

Useful commands for inspecting rate limiting data:

```bash
# List all rate limit keys
redis-cli --scan --pattern "vibewell:ratelimit:*"

# Check remaining requests for an IP
redis-cli GET "vibewell:ratelimit:general:127.0.0.1"

# Get all blocked IPs
redis-cli SMEMBERS "vibewell:ratelimit:blocked_ips"

# Clear rate limits for testing
redis-cli --scan --pattern "vibewell:ratelimit:*" | xargs redis-cli DEL
```

## Scaling Considerations

1. **Redis Replication**: Set up read replicas for high-traffic scenarios
2. **Redis Cluster**: Use sharding for extremely high throughput requirements
3. **Connection Pooling**: Adjust connection pool size based on application instances
4. **Key Expiration**: Ensure TTLs are set on all rate limiting keys

## Related Documentation

- [Rate Limiting Guide](./rate-limiting.md)
- [Load Testing Guide](./load-testing.md)
- [Security Implementation](./security-implementation.md) 