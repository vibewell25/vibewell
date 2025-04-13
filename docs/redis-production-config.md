# Redis Configuration for Production

This guide explains how to configure and use Redis for production environments in the Vibewell application, particularly for distributed rate limiting.

## Overview

In production environments, a distributed Redis setup is used to manage rate limiting across multiple application instances. This provides several advantages over the in-memory rate limiting used in development:

1. **Shared State**: All application instances share the same rate limit counters
2. **Persistence**: Rate limit data persists even if an application instance restarts
3. **Scalability**: Works seamlessly when scaling horizontally with multiple instances
4. **Analytics**: Better visibility into rate limiting events across the system

## Environment Configuration

There are two options for Redis in production:

### 1. Upstash Redis (Recommended for Edge Functions)

For Edge Runtime compatibility (e.g., Vercel Edge Functions), use Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### 2. Traditional Redis (Node.js Only)

For traditional Node.js environments:

```env
REDIS_URL=redis://host:port
REDIS_PASSWORD=your_redis_password  # Optional
REDIS_TLS=true                      # Set to true for TLS/SSL connections
REDIS_TIMEOUT=5000                  # Connection timeout in ms
REDIS_ENABLED=true                  # Explicitly enable Redis
```

### Example Configurations

#### Upstash Redis on Vercel
```env
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

#### AWS ElastiCache (Node.js only)
```env
REDIS_URL=redis://your-elasticache-instance.region.cache.amazonaws.com:6379
REDIS_TLS=true
```

#### Azure Cache for Redis (Node.js only)
```env
REDIS_URL=redis://your-azure-cache.redis.cache.windows.net:6380
REDIS_PASSWORD=your_access_key
REDIS_TLS=true
```

#### Docker Compose Local Setup
```env
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your_local_password
REDIS_TLS=false
```

## Redis Client Capabilities

The Redis client provided in `src/lib/redis-client.ts` has the following key features:

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

## Edge Runtime Support

The Redis client automatically detects when running in Edge Runtime and:

1. Uses Upstash Redis if configured (recommended)
2. Falls back to in-memory implementation if Upstash is not configured
3. Provides consistent API regardless of the underlying implementation

## Fallback Mechanism

The Redis client includes automatic fallback to in-memory implementation if:

1. Running in Edge Runtime without Upstash configuration
2. Redis connection fails
3. The environment is not production

This ensures that rate limiting continues to function even if Redis is unavailable.

## Monitoring Redis

For effective monitoring, consider:

1. Setting up Redis CloudWatch metrics (AWS) or Azure Metrics
2. Implementing regular checks on Redis memory usage
3. Monitoring the `redis-metrics.ts` collector output
4. Setting up alerts for Redis connection failures

## Security Considerations

1. Always use strong passwords/tokens for Redis
2. Enable TLS/SSL for Redis connections in production
3. Use network security groups or firewall rules to limit Redis access
4. Consider using Redis AUTH 
5. Regularly rotate Redis credentials

## Troubleshooting

### Common Issues

1. **Edge Runtime Errors**: 
   - Ensure Upstash Redis is configured correctly
   - Check that UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set

2. **Connection Timeouts**:
   - Check network security group rules
   - Verify TLS configuration
   - Ensure Redis instance is running and accessible

3. **Memory Issues**:
   - Monitor Redis memory usage
   - Implement proper key expiration policies
   - Use the cleanup methods provided by the client

4. **Rate Limiting Not Working**:
   - Verify Redis connection is active
   - Check if fallback to in-memory mode is occurring
   - Monitor rate limit events using the provided methods

### Getting Help

If you encounter issues:

1. Check the application logs for Redis-related errors
2. Use the monitoring tools to check Redis health
3. Verify your configuration against the examples above
4. Contact the infrastructure team if issues persist

## Recommended Production Setup

For high-availability production environments:

1. Use Redis with replication or Redis Cluster
2. Configure memory limits and eviction policies
3. Implement proper backup strategies
4. Monitor Redis metrics alongside application metrics
5. Implement circuit breakers for Redis operations 