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