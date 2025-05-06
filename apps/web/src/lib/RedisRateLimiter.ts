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
from '@/lib/RateLimiter';



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
// Re-export types
export type { RateLimitOptions, RateLimitResult };
