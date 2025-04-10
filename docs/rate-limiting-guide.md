# Rate Limiting Configuration Guide

## Overview
This guide documents the rate limiting implementation in the Vibewell application. Rate limiting is a critical security feature that protects the application from abuse, denial of service attacks, and ensures fair resource allocation among users.

## Architecture
Vibewell implements a dual-mode rate limiting system:

1. **In-Memory Mode**: Used for development and testing environments. Simple but doesn't scale across multiple server instances.
2. **Redis-Based Mode**: Used for production environments. Provides distributed rate limiting across multiple application instances.

## Rate Limiting Middleware

The core rate limiting functionality is implemented in `/src/app/api/auth/rate-limit-middleware.ts`. This middleware provides:

- Configurable limits based on request IP address and path
- Specialized limiters for different types of operations
- Detailed logging of rate limiting events
- Response headers with rate limit information

## Available Limiters

| Limiter | Purpose | Default Limits | Reset Window |
|---------|---------|----------------|--------------|
| `defaultRateLimiter` | General API requests | 100 requests | 60 seconds |
| `authRateLimiter` | Authentication operations | 20 requests | 60 seconds |
| `signupRateLimiter` | New account registration | 5 requests | 60 seconds |
| `passwordResetRateLimiter` | Password reset operations | 3 requests | 60 minutes |
| `mfaRateLimiter` | Multi-factor authentication | 10 requests | 60 seconds |
| `adminRateLimiter` | Admin operations | 50 requests | 60 seconds |
| `financialRateLimiter` | Payment and financial operations | 10 requests | 60 seconds |
| `contentCreationRateLimiter` | Content publishing/editing | 30 requests | 60 seconds |

## Implementation Examples

### Basic Usage
```typescript
import { applyRateLimit, defaultRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, defaultRateLimiter);
  
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }
  
  // Process the request normally
  // ...
}
```

### Using Specialized Limiters
```typescript
import { applyRateLimit, passwordResetRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(request: Request) {
  // Apply stricter rate limiting for password reset
  const rateLimitResult = await applyRateLimit(request, passwordResetRateLimiter);
  
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }
  
  // Process password reset
  // ...
}
```

## Configuration

### Environment Variables

The following environment variables control rate limiting behavior:

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_MODE` | Mode of operation: `memory` or `redis` | `memory` |
| `REDIS_URL` | URL for Redis connection (required in Redis mode) | - |
| `DEFAULT_RATE_LIMIT_MAX` | Default maximum requests | `100` |
| `DEFAULT_RATE_LIMIT_WINDOW_SEC` | Default time window in seconds | `60` |
| `SIGNUP_RATE_LIMIT_MAX` | Maximum signup requests | `5` |
| `AUTH_RATE_LIMIT_MAX` | Maximum authentication requests | `20` |
| `MFA_RATE_LIMIT_MAX` | Maximum MFA-related requests | `10` |
| `ADMIN_RATE_LIMIT_MAX` | Maximum admin operations | `50` |
| `FINANCIAL_RATE_LIMIT_MAX` | Maximum financial operations | `10` |
| `CONTENT_RATE_LIMIT_MAX` | Maximum content operations | `30` |

To configure these variables, add them to your `.env` file or set them in your deployment environment.

### Custom Limiters

To create a custom rate limiter for specific routes:

```typescript
import { createRateLimiter } from '@/app/api/auth/rate-limit-middleware';

// Create a custom limiter
export const customAPILimiter = createRateLimiter({
  name: 'custom-api',
  maxRequests: 50,
  windowSizeInSeconds: 30,
});

// Usage
const rateLimitResult = await applyRateLimit(request, customAPILimiter);
```

## Redis Configuration for Production

For production environments, Redis must be properly configured:

1. Install Redis in your server/container or use a managed Redis service
2. Set the following environment variables:
   ```
   RATE_LIMIT_MODE=redis
   REDIS_URL=redis://username:password@host:port
   ```
3. Ensure Redis persistence is configured properly to maintain rate limit data during restarts
4. Configure Redis maxmemory and eviction policies to prevent memory issues

## Logging and Monitoring

Rate limiting events are logged via the application's logger:

- When a rate limit is applied
- When a rate limit is exceeded
- When a suspicious pattern of attempts is detected

Monitor these logs to:
- Detect potential attacks
- Identify legitimate users hitting limits
- Fine-tune rate limits based on actual usage patterns

## Client Response

When rate limits are exceeded, clients receive:

- HTTP Status: `429 Too Many Requests`
- Headers:
  - `Retry-After`: Seconds until the limit resets
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in the current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Load Testing

Use the provided load testing script at `scripts/load-testing.sh` to:

1. Test rate limiting effectiveness
2. Verify proper configuration in different environments
3. Identify performance bottlenecks
4. Ensure high availability under heavy load

## Best Practices

1. **Start Conservative**: Begin with strict limits and relax them based on legitimate usage patterns
2. **Graduated Response**: Use stricter limits for sensitive operations
3. **Whitelist Critical IPs**: Consider allowing higher limits for trusted IPs
4. **Monitor False Positives**: Watch for legitimate users hitting limits
5. **Communicate Clearly**: Ensure your frontend handles 429 responses gracefully
6. **Use Redis in Production**: In-memory limiting is only suitable for development

## Troubleshooting

### Rate Limits Too Aggressive
- Check logs for legitimate users hitting limits
- Increase limits for specific operations via environment variables
- Ensure Redis is functioning properly in production

### Rate Limits Not Working
- Verify the middleware is correctly applied to routes
- Check Redis connection in production environments
- Ensure IP address extraction is working correctly

### Performance Issues
- Monitor Redis performance metrics
- Consider using a dedicated Redis instance for rate limiting
- Optimize Redis configuration for your workload

## Security Considerations

Rate limiting is just one layer of protection. Consider complementing it with:

- Web Application Firewall (WAF)
- CAPTCHA for sensitive operations
- IP reputation checking
- Anomaly detection
- Session validation 