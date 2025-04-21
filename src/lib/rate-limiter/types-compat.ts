/**
 * Rate Limiter Types (Legacy Compatibility)
 *
 * @deprecated Use the types from '@/lib/rate-limiter/types' instead
 */

import type {
  RateLimitOptions,
  RateLimitResult,
  RateLimitEvent,
  WebSocketRateLimitOptions,
  GraphQLContext,
  DEFAULT_OPTIONS,
  DEFAULT_WEBSOCKET_OPTIONS,
} from './types';

// Re-export all types
export type {
  RateLimitOptions,
  RateLimitResult,
  RateLimitEvent,
  WebSocketRateLimitOptions,
  GraphQLContext,
};

// Re-export constants
export { DEFAULT_OPTIONS, DEFAULT_WEBSOCKET_OPTIONS };
