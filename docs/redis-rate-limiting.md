# Redis Rate Limiting Implementation

This document outlines the implementation details of our Redis-based rate limiting system designed to protect the Vibewell API from abuse and ensure fair resource allocation.

## Overview

The rate limiting system uses Redis as a distributed data store to track and limit API requests across multiple server instances. This approach allows for consistent rate limiting in clustered environments where the application might be running on multiple servers.

## Architecture

The rate limiting system consists of several components:

1. **Redis Client**: Handles communication with Redis for storing and retrieving rate limit data
2. **Rate Limiting Middleware**: Next.js API route middleware that applies rate limiting rules
3. **Rate Limiter Configurations**: Different rate limiters for various API endpoints
4. **Logging and Monitoring**: Tools for tracking rate limit events and potential abuse

## Redis Client Implementation

The Redis client is implemented in `src/lib/redis-client.ts` with both production and development (mock) versions:

### Production Redis Client

For production, we use the `ioredis` library to communicate with Redis:

```typescript
import Redis from 'ioredis';

export class RedisClient {
  private client: Redis;
  
  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      enableReadyCheck: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    
    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }
  
  // Rate limiting methods
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }
  
  // Additional rate limiting methods
  async logRateLimitEvent(ip: string, endpoint: string, exceeded: boolean): Promise<void> {
    const timestamp = Date.now();
    const event = JSON.stringify({
      ip,
      endpoint,
      timestamp,
      exceeded,
    });
    
    // Store event in a Redis sorted set with timestamp as score
    await this.client.zadd('rate-limit-events', timestamp, event);
    
    // If this IP exceeded the rate limit, add it to a list of suspicious IPs
    if (exceeded) {
      await this.client.zadd('suspicious-ips', timestamp, ip);
    }
    
    // Remove old events to prevent unbounded growth
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    await this.client.zremrangebyscore('rate-limit-events', 0, cutoff);
  }
  
  async getRateLimitEvents(count = 100): Promise<any[]> {
    const events = await this.client.zrevrange('rate-limit-events', 0, count - 1);
    return events.map(event => JSON.parse(event));
  }
  
  async getSuspiciousIPs(): Promise<string[]> {
    const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour ago
    return this.client.zrangebyscore('suspicious-ips', cutoff, '+inf');
  }
}
```

### Development Mock Redis Client

For development and testing, we use a mock Redis client that stores data in memory:

```typescript
export class MockRedisClient {
  private store: Map<string, string | number>;
  private expirations: Map<string, number>;
  private rateLimitEvents: any[];
  
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
    this.rateLimitEvents = [];
  }
  
  async incr(key: string): Promise<number> {
    const value = (this.store.get(key) as number) || 0;
    const newValue = value + 1;
    this.store.set(key, newValue);
    return newValue;
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    const expirationTime = Date.now() + seconds * 1000;
    this.expirations.set(key, expirationTime);
    
    // Simulate expiration
    setTimeout(() => {
      if (this.expirations.get(key) === expirationTime) {
        this.store.delete(key);
        this.expirations.delete(key);
      }
    }, seconds * 1000);
  }
  
  async logRateLimitEvent(ip: string, endpoint: string, exceeded: boolean): Promise<void> {
    const event = {
      ip,
      endpoint,
      timestamp: Date.now(),
      exceeded,
    };
    
    this.rateLimitEvents.push(event);
    
    // Limit the number of stored events to prevent memory leaks
    if (this.rateLimitEvents.length > 1000) {
      this.rateLimitEvents.shift();
    }
  }
  
  async getRateLimitEvents(count = 100): Promise<any[]> {
    return this.rateLimitEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }
  
  async clearOldRateLimitEvents(maxAgeMs = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAgeMs;
    this.rateLimitEvents = this.rateLimitEvents.filter(
      event => event.timestamp >= cutoff
    );
  }
}
```

## Rate Limiting Middleware

The rate limiting middleware is implemented in `src/app/api/auth/rate-limit-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis-client';

const redisClient = getRedisClient();

export interface RateLimiter {
  limit: number;
  window: number; // in seconds
  blockDuration: number; // in seconds
  identifier: (req: NextRequest) => string;
}

// General API rate limiter (100 requests per minute)
export const apiRateLimiter: RateLimiter = {
  limit: 100,
  window: 60,
  blockDuration: 300, // 5 minutes
  identifier: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    return `rate-limit:api:${ip}`;
  },
};

// Authentication rate limiter (30 requests per minute)
export const authRateLimiter: RateLimiter = {
  limit: 30,
  window: 60,
  blockDuration: 600, // 10 minutes
  identifier: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    return `rate-limit:auth:${ip}`;
  },
};

// Sensitive operations rate limiter (15 requests per minute)
export const sensitiveApiRateLimiter: RateLimiter = {
  limit: 15,
  window: 60,
  blockDuration: 900, // 15 minutes
  identifier: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    return `rate-limit:sensitive:${ip}`;
  },
};

// Admin operations rate limiter (50 requests per minute)
export const adminRateLimiter: RateLimiter = {
  limit: 50,
  window: 60,
  blockDuration: 300, // 5 minutes
  identifier: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    return `rate-limit:admin:${ip}`;
  },
};

export async function applyRateLimit(
  req: NextRequest,
  rateLimiter: RateLimiter
): Promise<NextResponse | null> {
  const key = rateLimiter.identifier(req);
  const blockKey = `${key}:blocked`;
  
  // Check if this IP is blocked
  const isBlocked = await redisClient.get(blockKey);
  if (isBlocked) {
    const remainingTime = await redisClient.ttl(blockKey);
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = req.nextUrl.pathname;
    
    // Log the blocked request
    await redisClient.logRateLimitEvent(ip, endpoint, true);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(remainingTime / 60)} minutes.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(remainingTime),
          'X-RateLimit-Limit': String(rateLimiter.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + remainingTime),
        },
      }
    );
  }
  
  // Increment the request counter
  const count = await redisClient.incr(key);
  
  // If this is the first request in this window, set the expiration
  if (count === 1) {
    await redisClient.expire(key, rateLimiter.window);
  }
  
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const endpoint = req.nextUrl.pathname;
  
  // Check if rate limit is exceeded
  if (count > rateLimiter.limit) {
    // Block this IP for the specified duration
    await redisClient.set(blockKey, '1', 'EX', rateLimiter.blockDuration);
    
    // Log the rate limit event
    await redisClient.logRateLimitEvent(ip, endpoint, true);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimiter.blockDuration / 60)} minutes.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimiter.blockDuration),
          'X-RateLimit-Limit': String(rateLimiter.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + rateLimiter.blockDuration),
        },
      }
    );
  }
  
  // Log successful request for monitoring
  await redisClient.logRateLimitEvent(ip, endpoint, false);
  
  // Attach rate limit headers to the response
  const remaining = rateLimiter.limit - count;
  const resetTime = await redisClient.ttl(key);
  
  // Continue to the next middleware or route handler
  return null;
}
```

## Using Rate Limiting in API Routes

To apply rate limiting to an API route, import the middleware and appropriate rate limiter:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, apiRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req, apiRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Proceed with the actual API logic
  return NextResponse.json({ status: 'success' });
}
```

## Configuration

The Redis rate limiting system can be configured through environment variables:

```
# Redis connection
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password

# Enable/disable Redis rate limiting
REDIS_ENABLED=true

# General configuration
RATE_LIMIT_ENABLED=true
```

## Admin Dashboard Integration

The rate limiting system integrates with the admin dashboard to provide monitoring and management capabilities:

1. **Rate Limit Events**: View recent rate limit events, including IPs and endpoints
2. **Suspicious IPs**: Monitor IPs that frequently trigger rate limits
3. **Blocked IPs**: View and manage currently blocked IPs

## Performance Considerations

1. **Redis Connection Pool**: For high-traffic applications, consider using a connection pool
2. **Redis Cluster**: For very high-scale applications, use Redis Cluster for horizontal scaling
3. **Monitoring**: Set up Redis monitoring to track performance and resource usage

## Security Considerations

1. **Redis Authentication**: Always use Redis authentication in production
2. **Network Security**: Place Redis behind a firewall and restrict access
3. **Data Encryption**: Use TLS for Redis connections if Redis is on a separate server

## Testing

The rate limiting system can be tested using the provided k6 load testing scripts:

```bash
./scripts/load-testing.sh
```

See the [K6 Load Testing documentation](./k6-load-testing.md) for more details. 