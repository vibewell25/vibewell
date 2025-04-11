# Rate Limiter Migration Guide

## Overview

The rate limiting functionality in the VibeWell application has been consolidated to improve maintainability and reduce code duplication. This document explains the changes and how to migrate existing code.

## What Changed?

Previously, rate limiter implementations were scattered across multiple files:

- `src/lib/api/rate-limiter.ts`
- `src/lib/websocket/rate-limiter.ts`
- `src/lib/graphql/rate-limiter.ts`
- `src/lib/redis-rate-limiter.ts`

Now, all rate limiting functionality has been consolidated into a single module:

- `src/lib/rate-limiter.ts`

This reduces duplication, ensures consistent behavior, and makes future updates easier.

## Backward Compatibility

To ensure a smooth transition, backward compatibility modules have been created:

1. `src/lib/api/rate-limiter.ts`
2. `src/lib/websocket/rate-limiter.ts`
3. `src/lib/graphql/rate-limiter.ts`
4. `src/lib/redis-rate-limiter.ts`
5. `src/lib/rate-limiter/types-compat.ts`

These modules re-export the functionality from the consolidated module, so existing imports will continue to work. However, they are marked as deprecated, and you should update your imports to use the new paths.

## How to Migrate

### Guided Migration (Recommended)

We've provided an interactive script that guides you through the migration process:

```bash
npm run migrate:rate-limiter:guided
```

This script will:
1. Run the import migration script
2. Run tests to verify everything works
3. Provide troubleshooting guidance if needed

### Automated Migration

If you prefer to just update the imports automatically:

```bash
npm run migrate:rate-limiter
```

This script will:
1. Scan your codebase for old imports
2. List all affected files
3. Ask for confirmation before making changes
4. Update the imports to use the new paths

### Manual Migration

If you prefer to update your code manually, change your imports to use the new paths:

```typescript
// Before
import { apiRateLimiter } from '@/lib/api/rate-limiter';

// After
import { apiRateLimiter } from '@/lib/rate-limiter';
```

## New Features

The consolidated rate limiter includes several improvements:

- Better Redis integration for production
- Improved logging and event recording
- Consistent API across HTTP, WebSocket, and GraphQL
- Additional rate limiting presets for different use cases

## Available Rate Limiters

The consolidated module exports the following rate limiters:

### HTTP API Rate Limiters

- `apiRateLimiter` - General API requests
- `authRateLimiter` - Authentication operations
- `sensitiveApiRateLimiter` - Sensitive operations
- `passwordResetRateLimiter` - Password reset requests
- `signupRateLimiter` - Account creation
- `tokenRateLimiter` - Token generation
- `financialRateLimiter` - Financial operations
- `adminRateLimiter` - Admin operations

### GraphQL Rate Limiters

- `graphqlRateLimiter` - General GraphQL operations
- `graphQLRateLimitMiddleware` - Middleware for Apollo Server

### WebSocket Rate Limiters

- `webSocketRateLimiter` - WebSocket connections and messages

### Helper Functions

- `createRateLimiter` - Create a custom rate limiter
- `applyRateLimit` - Apply rate limiting to App Router routes
- `withRateLimit` - HOC for Pages Router API handlers
- `createGraphQLRateLimiter` - Create a GraphQL-specific rate limiter
- `withGraphQLRateLimit` - HOC for GraphQL resolvers

## Examples

### Rate Limiting an API Route (App Router)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, authRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req, authRateLimiter);
  if (rateLimitResult) return rateLimitResult;
  
  // Process the request if not rate limited
  return NextResponse.json({ success: true });
}
```

### Rate Limiting a GraphQL Resolver

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

## Troubleshooting

### Common Issues

1. **Missing imports**: Make sure you're importing from the new location `@/lib/rate-limiter`
2. **Type errors**: Some types may have changed slightly - check the rate limiter documentation for updated type definitions
3. **Multiple Redis clients**: The rate limiter now uses the centralized Redis client from `@/lib/redis-client`

### Testing After Migration

Always run tests after the migration to ensure everything works as expected:

```bash
npm test -- src/lib/rate-limiter/__tests__
```

## Questions?

If you have any questions about the migration, please contact the development team or refer to the detailed documentation in `src/lib/rate-limiter/README.md`. 