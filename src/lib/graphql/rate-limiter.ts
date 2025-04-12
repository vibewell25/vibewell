/**
 * GraphQL Rate Limiter (Legacy Import)
 * 
 * @deprecated Use the consolidated rate limiter from '@/lib/rate-limiter' instead
 */

import { 
  graphqlRateLimiter,
  createGraphQLRateLimiter,
  createGraphQLRateLimitMiddleware,
  withGraphQLRateLimit
} from '@/lib/rate-limiter';

// Re-export the consolidated implementations
export {
  graphqlRateLimiter,
  createGraphQLRateLimiter,
  createGraphQLRateLimitMiddleware,
  withGraphQLRateLimit
};

// Re-export the GraphQLContext type properly for compatibility
import type { GraphQLContext } from '@/lib/rate-limiter/types';
export type { GraphQLContext };

// For backward compatibility
export const createRateLimitMiddleware = createGraphQLRateLimitMiddleware;
export const graphQLRateLimitMiddleware = createGraphQLRateLimitMiddleware();

// Re-export complexity calculation function
// Note: calculateComplexity is imported from the graphql module in the main rate-limiter
export function calculateComplexity(operation: any): number {
  // Forward to the implementation in the main rate limiter
  // This is a simple placeholder for backward compatibility
  console.warn('Using deprecated calculateComplexity from @/lib/graphql/rate-limiter');
  return operation?.selectionSet?.selections?.length || 0;
}

// Legacy withRateLimit function that redirects to the withGraphQLRateLimit implementation
export function withRateLimit<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  key: string | { limit?: number; window?: number; key?: string } = 'default'
): (...args: Args) => Promise<T> {
  console.warn('Using deprecated withRateLimit from @/lib/graphql/rate-limiter. Use withGraphQLRateLimit instead.');
  
  // If key is a string, it's the field name
  if (typeof key === 'string') {
    return withGraphQLRateLimit(fn, key);
  }
  
  // Otherwise, it's an options object
  return withGraphQLRateLimit(fn, key.key || 'default', {
    windowMs: key.window,
    max: key.limit
  });
} 