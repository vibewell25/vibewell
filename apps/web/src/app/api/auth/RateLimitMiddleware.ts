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
from '@/lib/rate-limiter';


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
