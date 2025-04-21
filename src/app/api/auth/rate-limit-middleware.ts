/**
 * Rate limiting middleware for App Router API routes
 *
 * @deprecated Use the consolidated rate limiter in src/lib/rate-limiter directly
 */
import {
  apiRateLimiter,
  authRateLimiter,
  sensitiveApiRateLimiter,
  passwordResetRateLimiter,
  signupRateLimiter,
  tokenRateLimiter,
  financialRateLimiter,
  adminRateLimiter,
  applyRateLimit,
  createRateLimiter,
  withRateLimit,
} from '@/lib/rate-limiter';

// Re-export the rate limiters
export {
  apiRateLimiter,
  authRateLimiter,
  sensitiveApiRateLimiter,
  passwordResetRateLimiter,
  signupRateLimiter,
  tokenRateLimiter,
  financialRateLimiter,
  adminRateLimiter,
  applyRateLimit,
  createRateLimiter,
  withRateLimit,
};
