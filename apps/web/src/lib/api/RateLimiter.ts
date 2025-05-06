import {
  apiRateLimiter,
  authRateLimiter,
  sensitiveApiRateLimiter,
  passwordResetRateLimiter,
  signupRateLimiter,
  tokenRateLimiter,
  financialRateLimiter,
  adminRateLimiter,
  createRateLimiter,
  applyRateLimit,
  withRateLimit,
  type RateLimitOptions,
  type RateLimitResult,
from '@/lib/rate-limiter';


// Re-export the consolidated implementations
export {
  apiRateLimiter,
  authRateLimiter,
  sensitiveApiRateLimiter,
  passwordResetRateLimiter,
  signupRateLimiter,
  tokenRateLimiter,
  financialRateLimiter,
  adminRateLimiter,
  createRateLimiter,
  applyRateLimit,
  withRateLimit,
// Re-export types
export type { RateLimitOptions, RateLimitResult };
