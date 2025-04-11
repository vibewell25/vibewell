# VibeWell Rate Limiter

A consolidated, flexible rate limiting system for the VibeWell platform that protects all endpoints and services from abuse.

## Architecture

The rate limiter is designed with a unified core and protocol-specific adapters:

```
rate-limiter/
├── core.ts         # Core rate limiting implementation
├── http.ts         # HTTP/API rate limiting
├── graphql.ts      # GraphQL rate limiting
├── websocket.ts    # WebSocket rate limiting
├── presets.ts      # Predefined rate limiters for common scenarios  
├── types.ts        # Shared type definitions
├── index.ts        # Main exports
└── README.md       # This documentation
```

The consolidated implementation in `src/lib/rate-limiter.ts` re-exports all functionality from these modules, providing a single import point.

## Key Features

- **Multiple Protocol Support**: HTTP API, GraphQL, and WebSocket
- **Redis Backend**: Production-ready with Redis for distributed rate limiting
- **In-Memory Store**: Fast development mode with in-memory caching
- **Preset Limiters**: Common configurations for various scenarios
- **Event Logging**: Comprehensive logging of rate limit events
- **Customization**: Flexible options for all aspects of rate limiting

## Usage Examples

### HTTP API Rate Limiting (App Router)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, authRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  // Apply rate limiting - returns a response if rate limited, null otherwise
  const rateLimitResult = await applyRateLimit(req, authRateLimiter);
  if (rateLimitResult) return rateLimitResult;
  
  // Process the request
  return NextResponse.json({ success: true });
}
```

### HTTP API Rate Limiting (Pages Router)

```typescript
import { withRateLimit, sensitiveApiRateLimiter } from '@/lib/rate-limiter';

async function handler(req, res) {
  // Logic here - will only execute if not rate limited
  res.status(200).json({ success: true });
}

// Wrap the handler with rate limiting
export default withRateLimit(handler, sensitiveApiRateLimiter);
```

### GraphQL Resolver Rate Limiting

```typescript
import { withGraphQLRateLimit } from '@/lib/rate-limiter';

const resolvers = {
  Mutation: {
    createUser: withGraphQLRateLimit(
      async (_, args, context) => {
        // Implementation
      },
      'createUser',
      { max: 3, windowMs: 60 * 60 * 1000 } // 3 per hour
    )
  }
};
```

### WebSocket Rate Limiting

```typescript
import { webSocketRateLimiter } from '@/lib/rate-limiter';

// In your WebSocket server/handler
wss.on('connection', async (ws, req) => {
  const ip = req.socket.remoteAddress || '0.0.0.0';
  
  // Check if connection is allowed
  const canConnect = await webSocketRateLimiter.canConnect(ip);
  if (!canConnect) {
    ws.close(1008, 'Too many connections');
    return;
  }
  
  // Register the connection
  const connectionId = uuidv4();
  webSocketRateLimiter.registerConnection(ip, connectionId);
  
  // Handle messages with rate limiting
  ws.on('message', async (data) => {
    const canSendMessage = await webSocketRateLimiter.canSendMessage(
      ip, 
      connectionId, 
      data.length
    );
    
    if (!canSendMessage) {
      ws.send(JSON.stringify({ error: 'Rate limit exceeded' }));
      return;
    }
    
    // Process the message
  });
  
  // Clean up when connection closes
  ws.on('close', () => {
    webSocketRateLimiter.unregisterConnection(ip, connectionId);
  });
});
```

### Custom Rate Limiter

```typescript
import { createRateLimiter } from '@/lib/rate-limiter';

const myCustomLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Custom rate limit exceeded' },
  keyPrefix: 'custom:',
  
  // Optional custom identifier function
  identifierGenerator: (req) => {
    // Use API key or custom header if present, otherwise use IP
    return req.headers.get('x-api-key') || req.ip;
  },
  
  // Optional skip function
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url.includes('/health');
  }
});
```

## Available Rate Limiters

### HTTP API Rate Limiters

- `apiRateLimiter` - Standard rate limiting for general API endpoints
- `authRateLimiter` - Stricter limits for authentication operations
- `sensitiveApiRateLimiter` - Very strict limits for sensitive operations
- `passwordResetRateLimiter` - Specialized for password reset requests
- `signupRateLimiter` - Limits account creation frequency
- `tokenRateLimiter` - Controls token generation/refresh rate
- `financialRateLimiter` - For payment and financial operations
- `adminRateLimiter` - For administrative operations

### GraphQL Rate Limiters

- `graphqlRateLimiter` - General GraphQL operation limiting
- `graphQLRateLimitMiddleware` - Middleware for Apollo Server

### WebSocket Rate Limiters

- `webSocketRateLimiter` - Limits WebSocket connections and messages

## Options

The rate limiter accepts the following options:

```typescript
interface RateLimitOptions {
  // Core options
  windowMs?: number;       // Time window in milliseconds
  max?: number;            // Maximum requests per window
  message?: string|object; // Response message
  keyPrefix?: string;      // Key prefix for storage
  statusCode?: number;     // HTTP status code for rate limited responses
  
  // Custom behavior
  identifierGenerator?: (req: any) => string; // Custom identifier generator
  skip?: (req: any) => boolean;               // Function to skip rate limiting
  
  // Advanced options
  burstFactor?: number;     // Allow short bursts of traffic
  burstDurationMs?: number; // Duration for burst allowance
}
```

## WebSocket-Specific Options

```typescript
interface WebSocketRateLimitOptions extends RateLimitOptions {
  // Connection limits
  maxConnectionsPerIP?: number;  // Max concurrent connections per IP
  connectionWindowMs?: number;   // Time window for connection limits
  
  // Message limits
  maxMessagesPerMinute?: number; // Max messages per minute
  maxMessageSizeBytes?: number;  // Max message size
}
```

## Environment Variables

- `REDIS_ENABLED`: Set to 'true' to use Redis for distributed rate limiting
- `REDIS_URL`: Redis connection URL when Redis is enabled
- `RATE_LIMIT_LOG_LEVEL`: Controls verbosity of rate limit logging

## Best Practices

1. **Choose Appropriate Limits**:
   - Regular API endpoints: 60-120 requests per minute
   - Authentication endpoints: 3-10 requests per 15 minutes
   - Sensitive operations: 3-5 requests per hour

2. **Use Identification Carefully**:
   - IP-based limiting is a good default but can affect users behind shared IPs
   - For authenticated routes, consider user ID-based limiting

3. **Monitor Rate Limit Events**:
   - Check logs for patterns of rate limit events
   - High rate limit events may indicate attacks or poorly designed clients

4. **Handle Rate Limit Responses**:
   - Clients should respect the `Retry-After` header
   - Implement exponential backoff in clients

## Migration Guide

If you're migrating from the older, separate rate limiter implementations, see the [migration guide](../../../docs/rate-limiter-migration.md). 