# Rate Limiting System Guide

## Overview

The rate limiting system protects our API endpoints from abuse and ensures fair usage of resources. It uses Redis for distributed rate limiting and supports both in-memory and Redis-backed implementations.

## Configuration

### Environment Variables

```bash
# Rate limiting mode (memory or redis)
RATE_LIMIT_MODE=redis

# Default rate limit (requests per window)
DEFAULT_RATE_LIMIT_MAX=100
DEFAULT_RATE_LIMIT_WINDOW=60

# Specialized rate limiters
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW=900
```

### Redis Configuration

The Redis configuration is located in `config/redis/production.conf`. Key settings include:

- Memory limits
- Persistence settings
- Security configurations
- Performance optimizations

## Implementation Details

### Rate Limiter Types

1. **Default Rate Limiter**
   - Applies to all endpoints
   - Configurable through environment variables
   - Uses sliding window algorithm

2. **Authentication Rate Limiter**
   - Stricter limits for auth endpoints
   - Prevents brute force attacks
   - Separate configuration

3. **IP-based Rate Limiter**
   - Tracks requests by IP address
   - Prevents DDoS attacks
   - Configurable thresholds

### Error Handling

When rate limits are exceeded, the system:

1. Returns HTTP 429 (Too Many Requests)
2. Includes retry-after header
3. Logs the event
4. Updates metrics

## Monitoring

### Metrics Collected

- Request counts
- Blocked requests
- Response times
- Memory usage
- Hit rates

### Alerting

Alerts are triggered for:

- High memory usage (>80%)
- Unusual request patterns
- System errors
- Configuration issues

## Troubleshooting

### Common Issues

1. **Rate Limits Too Strict**
   - Check current limits
   - Review traffic patterns
   - Adjust configuration

2. **Redis Connection Issues**
   - Verify Redis is running
   - Check network connectivity
   - Review Redis logs

3. **Memory Usage High**
   - Check key expiration
   - Review memory limits
   - Monitor eviction policies

### Debugging Tools

1. **Redis CLI**
   ```bash
   redis-cli info
   redis-cli monitor
   ```

2. **Metrics Collection**
   ```bash
   ./scripts/collect-redis-metrics.sh
   ```

3. **Security Audit**
   ```bash
   ./scripts/security-audit.sh
   ```

## Best Practices

1. **Configuration**
   - Set appropriate limits
   - Use separate limits for different endpoints
   - Monitor and adjust as needed

2. **Monitoring**
   - Regular metric collection
   - Alert setup
   - Log analysis

3. **Security**
   - Regular audits
   - Penetration testing
   - Configuration reviews

## Maintenance

### Regular Tasks

1. **Daily**
   - Check metrics
   - Review alerts
   - Monitor performance

2. **Weekly**
   - Clean up old data
   - Review limits
   - Update documentation

3. **Monthly**
   - Security audit
   - Performance review
   - Configuration optimization

## API Integration

### Client Implementation

```typescript
import { RateLimiter } from '@/lib/rate-limiter';

const limiter = new RateLimiter({
  max: 100,
  window: 60
});

// Apply to route
export default async function handler(req, res) {
  try {
    await limiter.check(req.ip);
    // Process request
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.status(429).json({ error: 'Too many requests' });
    }
  }
}
```

### Response Headers

Rate-limited responses include:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until reset
- `Retry-After`: Seconds to wait

## Security Considerations

1. **IP Spoofing**
   - Use multiple identifiers
   - Implement IP validation
   - Monitor for abuse

2. **Distributed Attacks**
   - Use Redis for distributed limiting
   - Implement global limits
   - Monitor patterns

3. **Resource Exhaustion**
   - Set memory limits
   - Implement cleanup
   - Monitor usage

## Performance Optimization

1. **Redis Optimization**
   - Use pipelining
   - Implement connection pooling
   - Optimize queries

2. **Memory Management**
   - Set appropriate TTLs
   - Implement cleanup
   - Monitor usage

3. **Network Optimization**
   - Use connection pooling
   - Implement timeouts
   - Monitor latency 