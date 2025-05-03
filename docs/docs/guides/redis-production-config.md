# Redis Production Configuration Guide

This document provides a comprehensive guide for configuring Redis for production use within the Vibewell platform, particularly for rate limiting and caching features.

## Overview

Redis is used in the Vibewell platform for several critical functions:

1. **Rate Limiting**: Preventing abuse of API endpoints
2. **Distributed Caching**: Improving performance by caching frequently accessed data
3. **Session Management**: Storing user session information
4. **Job Queues**: Managing background tasks and processing

## Production Redis Setup Options

### Option 1: Managed Redis Service (Recommended)

For production environments, we recommend using a managed Redis service:

- **AWS ElastiCache for Redis**
- **Azure Cache for Redis**
- **DigitalOcean Managed Redis**
- **Upstash Redis** (serverless)
- **Redis Labs Redis Enterprise Cloud**

Benefits of managed services:
- High availability and automatic failover
- Scalability
- Regular backups
- Security and compliance
- Monitoring and alerting
- Managed updates and patching

### Option 2: Self-Hosted Redis

If you prefer to self-host Redis, follow these guidelines:

#### Server Requirements

- **CPU**: At least 2 vCPUs for moderate workloads
- **Memory**: 4GB RAM minimum (8GB+ recommended)
- **Storage**: SSD storage for optimal performance
- **Network**: Low-latency connection between Redis and application servers

#### High Availability Setup

For production, set up Redis in a high-availability configuration:

1. **Redis Sentinel**:
   - Master-Replica topology with automatic failover
   - Minimum 3 Sentinel instances across different availability zones
   - Configure client libraries to connect through Sentinel

2. **Redis Cluster**:
   - For larger workloads requiring sharding
   - Distributes data across multiple Redis nodes
   - Provides automatic sharding and higher availability

## Security Configuration

### TLS Configuration

Enable TLS encryption for all Redis connections:

```
tls-cert-file /path/to/cert.pem
tls-key-file /path/to/key.pem
tls-ca-cert-file /path/to/ca.cert.pem
tls-auth-clients yes
tls-protocols "TLSv1.2 TLSv1.3"
tls-ciphersuites "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384"
```

### Authentication

Always enable Redis authentication:

```
requirepass <strong-password>
masterauth <strong-password>  # For replica servers
```

Password recommendations:
- Minimum 32 characters
- Include uppercase, lowercase, numbers, and special characters
- Rotate regularly
- Store in secure environment variables or a secrets manager

### Network Security

Restrict Redis access with firewall rules:

```
# Only allow connections from application servers
protected-mode yes
bind 10.0.1.5 # Replace with your application server IP
```

## Performance Optimization

### Memory Management

Configure memory limits to prevent Redis from consuming all available system memory:

```
maxmemory 2gb  # Adjust based on server capacity
maxmemory-policy allkeys-lru  # For cache workloads
```

For rate limiting, consider using:
```
maxmemory-policy volatile-ttl
```

### Persistence Configuration

For rate limiting and caching, you can disable persistence for better performance:

```
# Disable persistence
save ""
```

For critical data, configure RDB and AOF persistence:

```
# RDB Snapshots
save 900 1
save 300 10
save 60 10000

# AOF Persistence
appendonly yes
appendfsync everysec
```

## Monitoring and Alerting

Enable Redis metrics collection and set up alerts for:

1. **Memory usage** approaching maxmemory limit
2. **Connection count** approaching max-clients
3. **CPU usage** exceeding 80%
4. **Replication lag** between master and replicas
5. **Eviction rate** to detect cache pressure

## Client Configuration

### Connection Pooling

Configure your Redis client with appropriate connection pooling:

```javascript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {
    ca: fs.readFileSync(process.env.REDIS_CA_CERT_PATH),
    rejectUnauthorized: true
  },
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
  connectTimeout: 10000,
  
  // Connection pool settings
  connectionName: 'vibewell-app',
  db: 0,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Health and monitoring
  healthCheckInterval: 30000,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Only reconnect on READONLY error
    }
    return false;
  }
});
```

### Handling Redis Failures

Implement fallback mechanisms for Redis failures:

```javascript
// Example redis client with fallback
export function createRedisClientInterface() {
  let redisClient;
  
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      // ... Redis configuration
    });
    
    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
      // Implement fallback if needed
    });
    
  } catch (error) {
    console.error('[Redis] Failed to initialize:', error);
    // Use in-memory fallback for development or non-critical features
    redisClient = new MockRedisClientInterface();
  }
  
  return redisClient;
}
```

## Rate Limiting Configuration

For rate limiting with Redis, configure:

1. **Rate limit keys**: Use appropriate key format: `rate:limit:{resource}:{identifier}`
2. **TTL values**: Set appropriate expiry to match your rate limit windows
3. **Monitoring**: Set up monitoring for rate limit events to detect abuse patterns

Example Redis rate limiter configuration:

```javascript
// Rate limiter configurations
const RATE_LIMITERS = {
  // General API rate limit (100 requests per minute)
  api: {
    limit: 100,
    window: 60, // seconds
    blockDuration: 300, // 5 minutes
  },
  
  // Authentication endpoints (10 requests per minute)
  auth: {
    limit: 10,
    window: 60,
    blockDuration: 600, // 10 minutes
  },
  
  // Sensitive operations (5 requests per 5 minutes)
  sensitive: {
    limit: 5,
    window: 300,
    blockDuration: 900, // 15 minutes
  }
};
```

## Deployment Checklist

Before deploying to production, verify:

- [ ] Redis is properly secured with TLS and authentication
- [ ] Memory limits are appropriately configured
- [ ] High availability is set up if required
- [ ] Monitoring and alerting are configured
- [ ] Backup strategy is in place
- [ ] Client applications properly handle Redis connection failures
- [ ] Rate limiting parameters are appropriate for your traffic patterns
- [ ] Redis version is up-to-date with security patches

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| High memory usage | Unbounded keys growth | Implement TTL on all keys |
| Slow response times | Client-side latency | Reduce request timeouts, use connection pooling |
| Connection refused | Network/Firewall issues | Check firewall rules, network ACLs |
| READONLY error | Connecting to replica | Configure client to reconnect on READONLY |
| NOAUTH error | Missing/incorrect password | Verify Redis password in environment variables |

### Monitoring Commands

Useful Redis monitoring commands:

```
# Memory usage
redis-cli info memory

# Client connections
redis-cli info clients

# Command statistics
redis-cli info commandstats

# Rate limit keys
redis-cli --scan --pattern "rate:limit:*"

# Check blocked IPs
redis-cli smembers blocked:ips
```

## References

- [Redis Official Documentation](https://redis.io/documentation)
- [Redis Security Guide](https://redis.io/topics/security)
- [Redis Persistence](https://redis.io/topics/persistence)
- [Redis High Availability](https://redis.io/topics/sentinel) 