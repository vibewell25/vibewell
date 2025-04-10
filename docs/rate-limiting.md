# Rate Limiting in Vibewell

This document outlines the rate limiting system implemented in the Vibewell application, which provides protection against abuse, brute force attacks, and denial of service attempts.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Rate Limiter Types](#rate-limiter-types)
5. [Using Rate Limiting in Routes](#using-rate-limiting-in-routes)
6. [Monitoring and Analytics](#monitoring-and-analytics)
7. [Blocked IP Management](#blocked-ip-management)
8. [Development vs. Production](#development-vs-production)
9. [Troubleshooting](#troubleshooting)

## Overview

The rate limiting system is designed to:

- Protect sensitive operations (authentication, password resets, etc.)
- Prevent abuse of API endpoints
- Mitigate denial of service attacks
- Provide monitoring and analytics for security events
- Support both development (in-memory) and production (Redis) environments

## Architecture

The system consists of the following components:

1. **Rate Limiting Middleware** - Core logic that enforces request limits
2. **Redis Client** - Storage for distributed rate limiting and analytics
3. **Admin Dashboard** - UI for monitoring and managing rate limiting events
4. **Logging System** - Records rate limiting events for analysis

### Flow:

1. Request arrives at an API route
2. Middleware checks if the IP is blocked
3. If the IP is not blocked, rate limiting rules are applied
4. If the rate limit is exceeded, the request is rejected
5. Events are logged for monitoring and analytics

## Configuration

Rate limiting can be configured through environment variables:

```
# .env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
RATE_LIMIT_DISABLED=false
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_ENABLED` | Use Redis for rate limiting instead of in-memory storage | `false` |
| `REDIS_URL` | Connection URL for Redis | `redis://localhost:6379` |
| `RATE_LIMIT_DISABLED` | Disable rate limiting entirely (not recommended for production) | `false` |

## Rate Limiter Types

The application includes several specialized rate limiters:

| Limiter | Limit | Window | Description |
|---------|-------|--------|-------------|
| Global API | 60 | 60s | Default limit for all API routes |
| Authentication | 10 | 15min | Login and authentication attempts |
| Password Reset | 3 | 60min | Password reset requests |
| User Signup | 5 | 24h | New account registrations |
| Multi-Factor Auth | 5 | 10min | MFA verification attempts |
| Financial Operations | 10 | 60min | Payment and financial operations |
| Admin Operations | 30 | 5min | Admin-only operations |

## Using Rate Limiting in Routes

### Basic Usage

```typescript
import { applyRateLimitMiddleware, apiRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimitMiddleware(req, apiRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult; // Return the error response if rate limited
  }
  
  // Normal route handler logic
  return NextResponse.json({ message: 'Success' });
}
```

### Using Specialized Limiters

```typescript
import { applyRateLimitMiddleware, authRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(req: NextRequest) {
  // Use auth limiter for login endpoints
  const rateLimitResult = await applyRateLimitMiddleware(req, authRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Login logic
}
```

## Monitoring and Analytics

Rate limiting events are logged and can be monitored through:

1. **Admin Dashboard** - `/admin/rate-limits`
2. **Application Logs** - Check server logs for rate limiting events
3. **Redis Analytics** - Direct access to Redis for advanced analysis

### Admin Dashboard Features

- Real-time view of rate limiting events
- Filtering by limiter type, time range, and event type
- Visualization of rate limiting patterns
- Ability to block suspicious IPs

## Blocked IP Management

IPs can be blocked:

1. **Automatically** - When suspicious activity is detected
2. **Manually** - Through the admin dashboard

### Managing Blocked IPs

Blocked IPs can be managed through:

- Admin dashboard UI
- API endpoints
- Direct Redis commands (in production)

```typescript
// API route for managing blocked IPs
POST /api/admin/rate-limits
{
  "ip": "192.168.1.1",
  "action": "block" // or "unblock"
}
```

## Development vs. Production

### Development

In development:
- Uses in-memory storage for rate limiting
- Blocked IPs are not persistent across restarts
- Events are logged to console

### Production

In production:
- Uses Redis for distributed rate limiting
- Blocked IPs are persistent
- Full analytics and monitoring capabilities
- Events are logged to Redis and server logs

## Troubleshooting

### Common Issues

**Issue**: Rate limiting too aggressive
- Check the configuration for the specific limiter
- Temporarily increase limits for specific operations

**Issue**: Legitimate users being blocked
- Check logs for false positives
- Unblock specific IPs through admin dashboard
- Consider adjusting rate limit thresholds

**Issue**: Redis connection issues
- Verify Redis connection string
- Check Redis server status
- Ensure proper network access to Redis

### Debugging

Enable verbose logging for rate limiting:

```
# .env
DEBUG=vibewell:rate-limit*
```

---

## Additional Resources

- [Redis Documentation](https://redis.io/docs)
- [NextJS Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html) 