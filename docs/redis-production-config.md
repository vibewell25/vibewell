# Redis Configuration for Production

This guide explains how to configure and use Redis for production environments in the Vibewell application, particularly for distributed rate limiting.

## Overview

In production environments, a distributed Redis setup is used to manage rate limiting across multiple application instances. This provides several advantages over the in-memory rate limiting used in development:

1. **Shared State**: All application instances share the same rate limit counters
2. **Persistence**: Rate limit data persists even if an application instance restarts
3. **Scalability**: Works seamlessly when scaling horizontally with multiple instances
4. **Analytics**: Better visibility into rate limiting events across the system

## Environment Configuration

To enable Redis in production, set the following environment variables:

```
NODE_ENV=production
REDIS_URL=redis://host:port
REDIS_PASSWORD=your_redis_password  # Optional
REDIS_TLS=true                      # Set to true for TLS/SSL connections
REDIS_TIMEOUT=5000                  # Connection timeout in ms
REDIS_ENABLED=true                  # Explicitly enable Redis
```

### Example Configurations

#### AWS ElastiCache
```
REDIS_URL=redis://your-elasticache-instance.region.cache.amazonaws.com:6379
REDIS_TLS=true
```

#### Azure Cache for Redis
```
REDIS_URL=redis://your-azure-cache.redis.cache.windows.net:6380
REDIS_PASSWORD=your_access_key
REDIS_TLS=true
```

#### Docker Compose Local Setup
```
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your_local_password
REDIS_TLS=false
```

## Redis Client Capabilities

The Redis client provided in `src/lib/redis/redis-client.ts` has the following key features:

### Basic Redis Operations

- `get(key)`: Get a value from Redis
- `set(key, value, options)`: Set a value in Redis with optional expiration
- `incr(key)`: Increment a numeric value
- `expire(key, seconds)`: Set key expiration
- `del(key)`: Delete a key

### Rate Limiting Specific Methods

- `logRateLimitEvent(event)`: Records a rate limit event for monitoring
- `getRateLimitEvents(limit)`: Retrieves recent rate limit events
- `clearOldRateLimitEvents(olderThanMs)`: Cleans up old rate limit events

### Security Features

- `blockIP(ip, durationSeconds)`: Block an IP address for a specified duration
- `isIPBlocked(ip)`: Check if an IP is blocked
- `unblockIP(ip)`: Remove an IP from the blocked list
- `getBlockedIPs()`: Get a list of all blocked IPs
- `getSuspiciousIPs(limit)`: Get IPs that have frequently been rate limited

## Fallback Mechanism

The Redis client includes automatic fallback to in-memory implementation if:

1. Redis connection fails
2. The `REDIS_URL` is not set
3. `NODE_ENV` is not 'production'

This ensures that rate limiting continues to function even if Redis is unavailable.

## Monitoring Redis

For effective monitoring, consider:

1. Setting up Redis CloudWatch metrics (AWS) or Azure Metrics
2. Implementing regular checks on Redis memory usage
3. Monitoring the `redis-metrics.ts` collector output
4. Setting up alerts for Redis connection failures

## Security Considerations

1. Always use strong passwords for Redis
2. Enable TLS/SSL for Redis connections in production
3. Use network security groups or firewall rules to limit Redis access
4. Consider using Redis AUTH 
5. Regularly rotate Redis credentials

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check network connectivity
   - Verify security group settings
   - Increase `REDIS_TIMEOUT` value

2. **Authentication Failures**
   - Verify password in environment variables
   - Check for special characters that may need escaping

3. **Memory Issues**
   - Set appropriate maxmemory policy (e.g., volatile-lru)
   - Monitor memory usage regularly
   - Adjust clearOldRateLimitEvents parameters

4. **High CPU Usage**
   - Check for expensive operations
   - Consider Redis caching strategies
   - Monitor slow log entries

### Debugging

For debugging Redis issues:

1. Enable more verbose logging:
   ```
   LOG_LEVEL=debug
   ```

2. Use Redis CLI to inspect keys:
   ```
   redis-cli -h your-redis-host -p 6379 --tls -a your-password
   ```

3. Check Redis INFO command output for stats:
   ```
   INFO memory
   INFO stats
   ```

## Recommended Production Setup

For high-availability production environments:

1. Use Redis with replication or Redis Cluster
2. Configure memory limits and eviction policies
3. Implement proper backup strategies
4. Monitor Redis metrics alongside application metrics
5. Implement circuit breakers for Redis operations 