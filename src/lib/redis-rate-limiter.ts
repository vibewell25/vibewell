/**
 * Redis Rate Limiter (Legacy Import)
 *
 * @deprecated Use the consolidated rate limiter from '@/lib/rate-limiter' instead
 */

import {
  redisApiRateLimiter,
  redisAuthRateLimiter,
  redisSensitiveApiRateLimiter,
  redisPasswordResetRateLimiter,
  redisSignupRateLimiter,
  redisTokenRateLimiter,
  redisFinancialRateLimiter,
  redisAdminRateLimiter,
  createRateLimiter,
  type RateLimitOptions,
  type RateLimitResult,
} from '@/lib/rate-limiter';

// Re-export the Redis-compatible implementations
export {
  redisApiRateLimiter,
  redisAuthRateLimiter,
  redisSensitiveApiRateLimiter,
  redisPasswordResetRateLimiter,
  redisSignupRateLimiter,
  redisTokenRateLimiter,
  redisFinancialRateLimiter,
  redisAdminRateLimiter,
  createRateLimiter,
};

// Re-export types
export type { RateLimitOptions, RateLimitResult };
