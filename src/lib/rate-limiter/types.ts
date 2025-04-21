/**
 * Rate Limiter Types and Interfaces
 *
 * This module contains shared type definitions used across the rate limiter services.
 */

/**
 * Configuration options for rate limiters
 */
export interface RateLimitOptions {
  // Core options
  windowMs?: number;
  max?: number;
  message?: string | object;
  keyPrefix?: string;
  statusCode?: number;

  // Customization
  identifierGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;

  // Additional options
  burstFactor?: number;
  burstDurationMs?: number;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number;
  resetTime: number;
}

/**
 * Rate limit event data structure
 */
export interface RateLimitEvent {
  id: string;
  ip: string;
  path: string;
  method: string;
  limiterType: string;
  timestamp: number;
  exceeded: boolean;
  remaining?: number;
  count?: number;
  limit?: number;
  retryAfter?: number;
  resetTime: number;
  suspicious: boolean;
  approaching?: boolean;
  overLimitFactor?: number;
  blocked?: boolean;
  userId?: string;
}

/**
 * WebSocket specific rate limit options
 */
export interface WebSocketRateLimitOptions extends RateLimitOptions {
  // Connection limits
  maxConnectionsPerIP?: number;
  connectionWindowMs?: number;

  // Message limits
  maxMessagesPerMinute?: number;
  maxMessageSizeBytes?: number;
}

/**
 * GraphQL context object for rate limiting
 */
export interface GraphQLContext {
  userId?: string;
  userRole?: string;
  ip: string;
}

/**
 * Default rate limit options
 */
export const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many requests, please try again later.' },
  keyPrefix: 'ratelimit:',
  statusCode: 429,
};

/**
 * Default WebSocket rate limit options
 */
export const DEFAULT_WEBSOCKET_OPTIONS: WebSocketRateLimitOptions = {
  ...DEFAULT_OPTIONS,
  maxConnectionsPerIP: 10,
  connectionWindowMs: 60 * 1000, // 1 minute
  maxMessagesPerMinute: 60,
  maxMessageSizeBytes: 10 * 1024, // 10 KB
  burstFactor: 2,
  burstDurationMs: 5000, // 5 seconds
};
