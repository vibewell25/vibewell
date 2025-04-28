/**
 * GraphQL Rate Limiter Implementation
 *
 * This module provides rate limiting adapters for GraphQL operations,
 * supporting Apollo Server and other GraphQL implementations.
 */

import { GraphQLError } from 'graphql';
import { logger } from '@/lib/logger';
import { RateLimitOptions, DEFAULT_OPTIONS, GraphQLContext } from './types';
import { checkRateLimit, logRateLimitEvent, shouldUseRedis } from './core';

/**
 * Create a GraphQL rate limiter function
 */
export function createGraphQLRateLimiter(options: RateLimitOptions = {}) {
  const mergedOptions: RateLimitOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return async function graphqlRateLimiter(
    context: GraphQLContext,
    fieldName: string,
  ): Promise<void> {
    // Skip rate limiting if specified
    if (mergedOptions.skip && mergedOptions.skip({ context, fieldName })) {
      return;
    }

    // Get identifier from IP in context
    const keyPrefix = mergedOptions.keyPrefix || DEFAULT_OPTIONS.keyPrefix!;
    const identifier = `${keyPrefix}graphql:${fieldName}:${context.ip}`;

    // Check rate limit
    const useRedis = shouldUseRedis();
    const result = await checkRateLimit(identifier, mergedOptions, useRedis);

    // Log the rate limit event
    await logRateLimitEvent(identifier, fieldName, 'GRAPHQL', 'graphql', result, context.userId);

    // If over limit, throw GraphQL error
    if (!result.success) {
      const message = mergedOptions.message || DEFAULT_OPTIONS.message!;
      const errorMessage = typeof message === 'string' ? message : JSON.stringify(message);

      throw new GraphQLError(errorMessage, {
        extensions: {
          code: 'RATE_LIMITED',
          http: {
            status: mergedOptions.statusCode || DEFAULT_OPTIONS.statusCode!,
            headers: {
              'Retry-After': String(result.retryAfter || 60),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': String(result.remaining),
              'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
            },
          },
        },
      });
    }
  };
}

/**
 * Create a GraphQL rate limiting plugin for Apollo Server
 */
export function createGraphQLRateLimitMiddleware(options: RateLimitOptions = {}) {
  const rateLimiter = createGraphQLRateLimiter(options);

  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ context, operationName, operation }: any) {
          try {
            // Skip introspection queries
            if (
              operation.selectionSet.selections.some((selection: any) => {
                return selection.name.value === '__schema' || selection.name.value === '__type';
              })
            ) {
              return;
            }

            // Apply rate limiting to the operation
            await rateLimiter(context, operationName || 'anonymous');
          } catch (error) {
            // Log error but don't re-throw to allow the GraphQL error to be properly formatted
            logger.error(`GraphQL rate limit error: ${error}`, 'graphql', { error });
          }
        },
      };
    },
  };
}

/**
 * Higher-order function to wrap a resolver with rate limiting
 */
export function withGraphQLRateLimit(
  resolver: any,
  fieldName: string,
  options: RateLimitOptions = {},
) {
  const rateLimiter = createGraphQLRateLimiter(options);

  return async function rateLimit(...args: any[]) {
    const [, , context] = args;

    // Apply rate limiting
    await rateLimiter(context, fieldName);

    // Call the original resolver
    return resolver(...args);
  };
}

/**
 * Calculate the complexity of a GraphQL operation
 * (This helps identify potentially expensive queries)
 */
export function calculateComplexity(operation: any): number {
  // A simplistic complexity calculation
  let complexity = 0;

  function countSelections(selectionSet: any, depth = 0): void {
    if (!selectionSet || !selectionSet.selections) return;

    for (const selection of selectionSet.selections) {
      // Each field adds to complexity, with deeper fields adding more
      complexity += 1 + depth;

      // Recurse into nested selections
      if (selection.selectionSet) {
        countSelections(selection.selectionSet, depth + 1);
      }
    }
  }

  if (operation && operation.selectionSet) {
    countSelections(operation.selectionSet);
  }

  return complexity;
}

/**
 * Default GraphQL rate limiter
 */
export const graphqlRateLimiter = createGraphQLRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 operations per minute
  message: 'Too many GraphQL operations, please try again later',
});

/**
 * Apollo Server plugin for rate limiting
 */
export {};
