/**
 * Rate Limiter Presets
 *
 * This module provides pre-configured rate limiters for common use cases,
 * making it easy to apply standard rate limiting policies.
 */

import { RateLimitOptions } from './types';
import { createRateLimiter } from './http';
import { createGraphQLRateLimiter } from './graphql';

// Re-export the standard HTTP rate limiters from http.ts
export {
  apiRateLimiter,
  authRateLimiter,
  sensitiveApiRateLimiter,
  passwordResetRateLimiter,
  signupRateLimiter,
  tokenRateLimiter,
  financialRateLimiter,
  adminRateLimiter,
} from './http';

// Re-export the standard GraphQL rate limiter from graphql.ts
export { graphqlRateLimiter } from './graphql';

// Re-export the standard WebSocket rate limiter from websocket.ts
export { webSocketRateLimiter } from './websocket';

/**
 * Preset configurations for different types of endpoints
 */
export const RATE_LIMIT_PRESETS = {
  // Standard API routes
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: { error: 'Too many requests, please try again later.' },
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: { error: 'Too many login attempts, please try again later.' },
  },

  // Sensitive operations (security critical)
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 requests per hour
    message: { error: 'Request limit exceeded for sensitive operations.' },
  },

  // Password reset operations
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: { error: 'Too many password reset attempts, please try again later.' },
  },

  // Signup/registration
  signup: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // 5 account creations per 24 hours
    message: { error: 'Account creation rate limit exceeded.' },
  },

  // Token generation/refresh
  token: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 token requests per minute
    message: { error: 'Too many token requests, please try again later.' },
  },

  // Financial operations
  financial: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 financial operations per hour
    message: { error: 'Financial operation rate limit exceeded.' },
  },

  // Admin operations
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 admin operations per 5 minutes
    message: { error: 'Admin operation rate limit exceeded.' },
  },

  // GraphQL operations
  graphql: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 operations per minute
    message: 'Too many GraphQL operations, please try again later',
  },

  // WebSocket connections
  websocket: {
    connectionWindowMs: 60 * 1000, // 1 minute
    maxConnectionsPerIP: 10,
    maxMessagesPerMinute: 60,
    maxMessageSizeBytes: 10 * 1024, // 10 KB
    burstFactor: 2,
    burstDurationMs: 5000, // 5 seconds
    message: { error: 'WebSocket connection or message rate limit exceeded.' },
  },
};

/**
 * Create a rate limiter with a preset configuration
 */
export function createPresetRateLimiter(
  presetName: keyof typeof RATE_LIMIT_PRESETS,
  customOptions: Partial<RateLimitOptions> = {}
) {
  if (!RATE_LIMIT_PRESETS[presetName]) {
    throw new Error(`Unknown rate limit preset: ${presetName}`);
  }

  return createRateLimiter({
    ...RATE_LIMIT_PRESETS[presetName],
    ...customOptions,
  });
}

/**
 * Create a GraphQL rate limiter with a preset configuration
 */
export function createPresetGraphQLRateLimiter(
  presetName: keyof typeof RATE_LIMIT_PRESETS,
  customOptions: Partial<RateLimitOptions> = {}
) {
  if (!RATE_LIMIT_PRESETS[presetName]) {
    throw new Error(`Unknown rate limit preset: ${presetName}`);
  }

  return createGraphQLRateLimiter({
    ...RATE_LIMIT_PRESETS[presetName],
    ...customOptions,
  });
}
