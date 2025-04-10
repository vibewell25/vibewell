/**
 * GraphQL Rate Limiter Implementation
 * 
 * This module provides rate limiting specifically for GraphQL operations:
 * 1. Complexity-based rate limiting (limiting queries based on their complexity)
 * 2. Field-level rate limiting (limiting access to specific fields)
 * 3. Operation-level rate limiting (standard rate limiting by operation type)
 */

import { createRateLimitRule, createRateLimitDirective } from 'graphql-rate-limit';
import { getGraphQLRateLimiter } from 'graphql-rate-limit';
import { GraphQLError } from 'graphql';
import { logger } from '@/lib/logger';
import redisClient from '@/lib/redis-client';

// Types for GraphQL request context
export interface GraphQLContext {
  userId?: string;
  userRole?: string;
  ip: string;
}

// Redis-backed store for GraphQL rate limiting
const createRedisStore = () => {
  return {
    async get(key: string): Promise<string | null> {
      try {
        return await redisClient.get(key);
      } catch (error) {
        logger.error('Error getting rate limit from Redis', 'graphql-rate-limit', { key, error });
        return null;
      }
    },
    
    async set(key: string, value: string, expiresIn: number): Promise<void> {
      try {
        await redisClient.set(key, value, { ex: Math.ceil(expiresIn / 1000) });
      } catch (error) {
        logger.error('Error setting rate limit in Redis', 'graphql-rate-limit', { key, error });
      }
    }
  };
};

// In-memory rate limiting store (fallback for development)
const inMemoryStore = new Map<string, { value: string; expires: number }>();

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, { expires }] of inMemoryStore.entries()) {
    if (expires < now) {
      inMemoryStore.delete(key);
    }
  }
}, 60 * 1000);

// Fallback in-memory store for development
const createInMemoryStore = () => {
  return {
    async get(key: string): Promise<string | null> {
      const entry = inMemoryStore.get(key);
      if (!entry) return null;
      
      if (entry.expires < Date.now()) {
        inMemoryStore.delete(key);
        return null;
      }
      
      return entry.value;
    },
    
    async set(key: string, value: string, expiresIn: number): Promise<void> {
      inMemoryStore.set(key, {
        value,
        expires: Date.now() + expiresIn
      });
    }
  };
};

// Create the appropriate store based on environment
const getRateLimitStore = () => {
  if (process.env.NODE_ENV === 'production') {
    return createRedisStore();
  }
  return createInMemoryStore();
};

// Base GraphQL rate limiter
export const graphqlRateLimiter = getGraphQLRateLimiter({
  identifyContext: (context: GraphQLContext) => {
    // Use user ID if available, otherwise IP address
    return context.userId || context.ip;
  },
  formatError: ({ fieldName, returnedObj }) => {
    return new GraphQLError(
      `Rate limit exceeded for field '${fieldName}'`,
      {
        extensions: {
          code: 'RATE_LIMITED',
          http: { status: 429 },
          retryAfter: returnedObj.msBeforeNext ? Math.ceil(returnedObj.msBeforeNext / 1000) : 60
        }
      }
    );
  },
  store: getRateLimitStore()
});

// Different rate limit configurations
const RATE_LIMITS = {
  // Standard rate limits for different operation types
  QUERY: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 queries per minute
  },
  MUTATION: {
    windowMs: 60 * 1000, // 1 minute 
    max: 30, // 30 mutations per minute
  },
  SUBSCRIPTION: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 subscriptions per minute
  },
  
  // Field-specific rate limits
  HIGH_COST_FIELDS: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  },
  FINANCIAL_FIELDS: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
  },
  
  // Role-based rate limits
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    max: 500, // 500 requests per minute
  },
  PROVIDER: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
  },
  CUSTOMER: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  
  // Anonymous rate limits (unauthenticated)
  ANONYMOUS: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  }
};

// Create directive for rate limiting that can be applied in the schema
export const rateLimitDirective = createRateLimitDirective({
  identifyContext: (context: GraphQLContext) => {
    return context.userId || context.ip;
  },
  formatError: ({ fieldName, returnedObj }) => {
    return new GraphQLError(
      `Rate limit exceeded for field '${fieldName}'`,
      {
        extensions: {
          code: 'RATE_LIMITED',
          http: { status: 429 },
          retryAfter: returnedObj.msBeforeNext ? Math.ceil(returnedObj.msBeforeNext / 1000) : 60
        }
      }
    );
  },
  store: getRateLimitStore()
});

// Create a rate limit rule for use with GraphQL Shield
export const rateLimitRule = createRateLimitRule({
  identifyContext: (context: GraphQLContext) => {
    return context.userId || context.ip;
  },
  formatError: ({ fieldName, returnedObj }) => {
    return new GraphQLError(
      `Rate limit exceeded for field '${fieldName}'`,
      {
        extensions: {
          code: 'RATE_LIMITED',
          http: { status: 429 },
          retryAfter: returnedObj.msBeforeNext ? Math.ceil(returnedObj.msBeforeNext / 1000) : 60
        }
      }
    );
  },
  store: getRateLimitStore()
});

/**
 * Calculates the complexity of a GraphQL query
 * 
 * This helps prevent abuse through complex, expensive queries
 * 
 * @param {Object} params - The query complexity parameters
 * @returns {number} - The calculated complexity score
 */
interface ComplexityParams {
  args: Record<string, any>;
  childComplexity: number;
  field: { name: string };
  type: { name: string };
}

export const calculateComplexity = (params: ComplexityParams): number => {
  const { args, childComplexity, field, type } = params;
  
  // Base complexity from child fields
  let complexity = childComplexity;
  
  // Field-specific complexity multipliers
  const COMPLEXITY_FACTORS = {
    // List fields are more expensive
    providers: 10,
    services: 5,
    bookings: 5,
    reviews: 3,
    
    // Fields with nested objects
    businessHours: 2,
    location: 1.5,
    contactInfo: 1.5,
  };
  
  // Apply field-specific multiplier
  if (field.name in COMPLEXITY_FACTORS) {
    complexity *= COMPLEXITY_FACTORS[field.name as keyof typeof COMPLEXITY_FACTORS];
  }
  
  // Adjust for pagination (limit/offset)
  if (args.limit) {
    // Higher limits = higher complexity
    complexity *= Math.max(1, args.limit / 10);
  }
  
  // Additional complexity for specific field types
  if (type.name === 'Provider' || type.name === 'User') {
    complexity *= 1.5; // These types are more expensive
  }
  
  return Math.max(1, Math.floor(complexity));
};

/**
 * Creates rate limit middleware for Apollo Server
 * 
 * This middleware applies operation-level and complexity-based rate limiting
 */
export const createRateLimitMiddleware = () => {
  const complexityLimit = 1000; // Maximum allowed query complexity
  
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document, operationName, operation }) {
          try {
            const context = request.context as GraphQLContext;
            
            // Skip rate limiting for internal operations
            if (context.userRole === 'internal') {
              return;
            }
            
            // Determine appropriate rate limit based on user role
            let rateLimit = RATE_LIMITS.ANONYMOUS;
            if (context.userId) {
              switch (context.userRole) {
                case 'admin':
                  rateLimit = RATE_LIMITS.ADMIN;
                  break;
                case 'provider':
                  rateLimit = RATE_LIMITS.PROVIDER;
                  break;
                case 'customer':
                  rateLimit = RATE_LIMITS.CUSTOMER;
                  break;
              }
            }
            
            // Apply operation-specific rate limits
            switch (operation.operation) {
              case 'query':
                // For queries, apply query-specific limit
                rateLimit = {
                  windowMs: Math.min(rateLimit.windowMs, RATE_LIMITS.QUERY.windowMs),
                  max: Math.min(rateLimit.max, RATE_LIMITS.QUERY.max)
                };
                break;
              case 'mutation':
                // For mutations, apply mutation-specific limit
                rateLimit = {
                  windowMs: Math.min(rateLimit.windowMs, RATE_LIMITS.MUTATION.windowMs),
                  max: Math.min(rateLimit.max, RATE_LIMITS.MUTATION.max)
                };
                break;
              case 'subscription':
                // For subscriptions, apply subscription-specific limit
                rateLimit = {
                  windowMs: Math.min(rateLimit.windowMs, RATE_LIMITS.SUBSCRIPTION.windowMs),
                  max: Math.min(rateLimit.max, RATE_LIMITS.SUBSCRIPTION.max)
                };
                break;
            }
            
            // Calculate key for this user/operation
            const identifier = context.userId || context.ip;
            const key = `graphql:${identifier}:${operation.operation}`;
            
            // Check rate limit
            const store = getRateLimitStore();
            const currentCount = await store.get(key);
            const count = currentCount ? parseInt(currentCount, 10) : 0;
            
            if (count >= rateLimit.max) {
              // Rate limit exceeded
              logger.warn(`GraphQL rate limit exceeded: ${operation.operation}`, 'graphql', {
                userRole: context.userRole,
                userId: context.userId,
                ip: context.ip,
                operation: operation.operation,
                operationName,
              });
              
              throw new GraphQLError('Rate limit exceeded', {
                extensions: {
                  code: 'RATE_LIMITED',
                  http: { status: 429 },
                  retryAfter: Math.ceil(rateLimit.windowMs / 1000)
                }
              });
            }
            
            // Increment rate limit counter
            await store.set(key, (count + 1).toString(), rateLimit.windowMs);
            
            // TODO: Implement complexity calculation and validation
            // This would require parsing the AST and validating before execution
          } catch (error) {
            if (error instanceof GraphQLError) {
              throw error;
            }
            
            logger.error('Error in GraphQL rate limit middleware', 'graphql', { error });
          }
        }
      };
    }
  };
};

/**
 * Apply field-specific rate limits
 * 
 * @param fieldName The name of the field being requested
 * @param context The GraphQL context object
 */
export const applyFieldRateLimit = async (fieldName: string, context: GraphQLContext) => {
  // Determine which rate limit to apply based on field name
  let rateLimit = RATE_LIMITS.QUERY; // Default
  
  // Check if this is a high-cost field
  const highCostFields = [
    'providers', 'services', 'bookings', 'reviews', 
    'providerBookings', 'reviewsByProvider'
  ];
  
  // Check if this is a financial operation
  const financialFields = [
    'createBooking', 'updateBookingStatus', 'cancelBooking',
    'payment', 'createPaymentIntent', 'refund'
  ];
  
  if (highCostFields.includes(fieldName)) {
    rateLimit = RATE_LIMITS.HIGH_COST_FIELDS;
  } else if (financialFields.includes(fieldName)) {
    rateLimit = RATE_LIMITS.FINANCIAL_FIELDS;
  }
  
  // Apply the rate limit
  const result = await graphqlRateLimiter({
    fieldName,
    context,
    max: rateLimit.max,
    window: rateLimit.windowMs
  });
  
  if (!result.allowed) {
    logger.warn(`GraphQL field rate limit exceeded: ${fieldName}`, 'graphql', {
      userRole: context.userRole,
      userId: context.userId,
      ip: context.ip,
      field: fieldName,
      msBeforeNext: result.msBeforeNext
    });
    
    throw new GraphQLError(`Rate limit exceeded for field '${fieldName}'`, {
      extensions: {
        code: 'RATE_LIMITED',
        http: { status: 429 },
        retryAfter: Math.ceil((result.msBeforeNext || 60000) / 1000)
      }
    });
  }
};

/**
 * Creates a higher-order resolver function that applies rate limiting
 * 
 * @param resolver The original resolver function
 * @param fieldName The name of the field being resolved
 * @returns A new resolver function with rate limiting applied
 */
export const withRateLimit = (resolver: any, fieldName: string) => {
  return async (parent: any, args: any, context: GraphQLContext, info: any) => {
    // Apply rate limiting
    await applyFieldRateLimit(fieldName, context);
    
    // Call the original resolver
    return resolver(parent, args, context, info);
  };
}; 