/**
 * Unified Rate Limiter Service
 *
 * This module provides a comprehensive rate limiting solution for the VibeWell platform.
 * It supports multiple protocols (HTTP API, GraphQL, WebSocket) and environments (development, production).
 * In production, it uses Redis as a backing store for distributed rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GraphQLError } from 'graphql';
import { logger } from '@/lib/logger';
import redisClient from '@/lib/redis-client';
import { Redis } from 'ioredis';
import { env } from '@/config/env';
import { nanoid } from 'nanoid';

// Common interfaces
export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string | object;
  keyPrefix?: string;
  statusCode?: number;
  identifierGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;
  // Higher sensitivity for suspicious activity detection
  burstMultiplier?: number; 
  // Track suspicious IPs
  trackSuspiciousIP?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number;
  resetTime: number;
  suspicious?: boolean;
}

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

// Default rate limit options
const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many requests, please try again later.' },
  keyPrefix: 'ratelimit:',
  statusCode: 429,
  burstMultiplier: 2,
  trackSuspiciousIP: true,
};

// In-memory store for development
const memoryStore = new Map<string, { count: number; resetTime: number; suspicious?: boolean }>();

// Clean up expired entries every minute in development
if (process.env.NODE_ENV !== 'production' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of memoryStore.entries()) {
      if (now > data.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 60 * 1000);
}

// Check if we should use Redis (only in production)
const useRedis = process.env.NODE_ENV === 'production' && !!redisClient;

/**
 * Core rate limiting implementation
 * Works with both in-memory and Redis backing stores
 */
async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowMs = options.windowMs || DEFAULT_OPTIONS.windowMs!;
  const max = options.max || DEFAULT_OPTIONS.max!;
  const keyPrefix = options.keyPrefix || DEFAULT_OPTIONS.keyPrefix!;
  const burstMultiplier = options.burstMultiplier || DEFAULT_OPTIONS.burstMultiplier!;
  const now = Date.now();

  // Key for storing rate limit data
  const key = `${keyPrefix}${identifier}`;
  const suspiciousKey = `${keyPrefix}suspicious:${identifier}`;

  // Using Redis in production
  if (useRedis && redisClient) {
    const windowKey = `${key}:window`;

    // Get current count and window expiration
    const [currentCount, windowExpires, isSuspicious] = await Promise.all([
      redisClient.get(key),
      redisClient.get(windowKey),
      options.trackSuspiciousIP ? redisClient.get(suspiciousKey) : null,
    ]);

    let resetTime: number;
    const suspicious = isSuspicious === '1';

    // If window doesn't exist or has expired, create a new one
    if (!windowExpires || parseInt(windowExpires, 10) < now) {
      resetTime = now + windowMs;
      await Promise.all([
        redisClient.set(key, '1'),
        redisClient.set(windowKey, resetTime.toString(), 'EX', Math.ceil(windowMs / 1000)),
      ]);

      return {
        success: true,
        limit: max,
        remaining: max - 1,
        resetTime,
        suspicious,
      };
    }

    resetTime = parseInt(windowExpires, 10);

    // Check if over limit
    const count = currentCount ? parseInt(currentCount, 10) : 0;
    
    // Apply stricter limits for suspicious IPs
    const effectiveMax = suspicious ? Math.floor(max / burstMultiplier) : max;
    
    if (count >= effectiveMax) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      // Track this as a suspicious IP if they're significantly over the limit
      if (options.trackSuspiciousIP && count >= max * 1.5) {
        // Mark as suspicious for 24 hours
        await redisClient.set(suspiciousKey, '1', 'EX', 24 * 60 * 60);
        
        // Log the suspicious activity
        logger.warn('Suspicious rate limit activity detected', {
          identifier,
          count,
          limit: max,
          overBy: count / max,
        });
      }

      return {
        success: false,
        limit: effectiveMax,
        remaining: 0,
        retryAfter,
        resetTime,
        suspicious: true,
      };
    }

    // Increment the counter
    await redisClient.incr(key);

    // Set remaining headers for successful response
    return {
      success: true,
      limit: effectiveMax,
      remaining: effectiveMax - count - 1,
      resetTime,
      suspicious,
    };
  }

  // Using in-memory store for development
  const currentData = memoryStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window expired
  if (currentData.resetTime < now) {
    currentData.count = 0;
    currentData.resetTime = now + windowMs;
    currentData.suspicious = false;
  }

  // Apply stricter limits for suspicious IPs
  const effectiveMax = currentData.suspicious ? Math.floor(max / burstMultiplier) : max;

  // Check if over limit
  if (currentData.count >= effectiveMax) {
    const retryAfter = Math.ceil((currentData.resetTime - now) / 1000);

    // Mark as suspicious if significantly over the limit
    if (options.trackSuspiciousIP && currentData.count >= max * 1.5) {
      currentData.suspicious = true;
      
      // Log the suspicious activity
      logger.warn('Suspicious rate limit activity detected', {
        identifier,
        count: currentData.count,
        limit: max,
        overBy: currentData.count / max,
      });
    }

    memoryStore.set(key, currentData);

    return {
      success: false,
      limit: effectiveMax,
      remaining: 0,
      retryAfter,
      resetTime: currentData.resetTime,
      suspicious: currentData.suspicious,
    };
  }

  // Increment counter
  currentData.count++;
  memoryStore.set(key, currentData);

  // Return success
  return {
    success: true,
    limit: effectiveMax,
    remaining: effectiveMax - currentData.count,
    resetTime: currentData.resetTime,
    suspicious: currentData.suspicious,
  };
}

/**
 * Log rate limit events
 */
async function logRateLimitEvent(
  identifier: string,
  path: string,
  method: string,
  limiterType: string,
  result: RateLimitResult,
  userId?: string,
): Promise<void> {
  try {
    const event: RateLimitEvent = {
      id: `${limiterType}-${identifier}-${Date.now()}`,
      ip: identifier,
      path,
      method,
      limiterType,
      timestamp: Date.now(),
      exceeded: !result.success,
      remaining: result.remaining,
      limit: result.limit,
      retryAfter: result.retryAfter,
      resetTime: result.resetTime,
      suspicious: result.remaining <= 0 || result.retryAfter !== undefined,
      approaching: result.remaining <= Math.ceil(result.limit * 0.1),
      userId,
    };

    // Log to console or structured logger
    logger.info(
      `Rate limit ${result.success ? 'passed' : 'exceeded'}: ${limiterType}`,
      'rate-limit',
      {
        ip: identifier,
        path,
        method,
        limiterType,
        remaining: result.remaining,
        exceeded: !result.success,
      },
    );

    // In production, log to Redis for analytics
    if (process.env.NODE_ENV === 'production') {
      await redisClient.logRateLimitEvent(event);
    }
  } catch (error) {
    logger.error('Error logging rate limit event', 'rate-limit', { error });
  }
}

// #region HTTP API Rate Limiter

/**
 * Create a rate limiter for Next?.js API routes (both App Router and Pages Router)
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Default identifier generator uses IP
  const identifierGenerator =
    options?.identifierGenerator ||
    ((req: NextRequest | any) => {
      // Handle different request types
      if (req?.headers.get) {
        // NextRequest (App Router)
        return req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || 'unknown';
      } else if (req?.headers) {
        // NextApiRequest (Pages Router)
        return String(
          req?.headers['x-forwarded-for'] ||
          req?.headers['x-real-ip'] ||
          req?.socket?.remoteAddress ||
          'unknown',
        );
      }

      return 'unknown';
    });

  // Skip function
  const skipFn = options?.skip || (() => false);

  // For App Router
  const appRouterHandler = async (req: NextRequest): Promise<NextResponse | null> => {
    try {
      // Skip rate limiting if specified
      if (skipFn(req)) {
        return null;
      }

      const identifier = identifierGenerator(req);
      const path = req?.nextUrl.pathname;
      const method = req?.method;

      const userId = req?.headers.get('x-user-id');

      // Check if rate limited
      const result = await checkRateLimit(identifier, mergedOptions);

      // Log the event
      await logRateLimitEvent(
        identifier,
        path,
        method,
        options?.keyPrefix || 'api',
        result,
        userId || undefined,
      );

      // If rate limited, return error response
      if (!result.success) {
        return NextResponse?.json(mergedOptions?.message, {
          status: mergedOptions?.statusCode,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          },
        });
      }

      // Allow the request to proceed
      return null;
    } catch (error) {
      logger.error('Rate limiter error', 'rate-limit', { error });
      return null; // Fail open
    }
  };

  // For Pages Router
  const pagesRouterHandler = async (req: any, res: any, next?: () => void) => {
    try {
      // Skip rate limiting if specified
      if (skipFn(req)) {
        if (next) next();
        return;
      }

      const identifier = identifierGenerator(req);
      const path = req?.url;
      const method = req?.method;

      const userId = req?.headers['x-user-id'];

      // Check if rate limited
      const result = await checkRateLimit(identifier, mergedOptions);

      // Log the event
      await logRateLimitEvent(
        identifier,
        path,
        method,
        options?.keyPrefix || 'api',
        result,
        userId || undefined,
      );

      // Set rate limit headers
      res?.setHeader('X-RateLimit-Limit', String(result.limit));
      res?.setHeader('X-RateLimit-Remaining', String(result.remaining));
      res?.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

      // If rate limited, return error response
      if (!result.success) {
        res?.setHeader('Retry-After', String(result.retryAfter));
        res?.status(mergedOptions?.statusCode!).json(mergedOptions?.message);
        return;
      }

      // Allow the request to proceed
      if (next) next();
    } catch (error) {
      logger.error('Rate limiter error', 'rate-limit', { error });
      if (next) next(); // Fail open
    }
  };

  // Return a function that can handle both App Router and Pages Router
  return function universalRateLimiter(req: any, res?: any, next?: any) {
    // App Router
    if (!res) {
      return appRouterHandler(req);
    }

    // Pages Router
    return pagesRouterHandler(req, res, next);
  };
}

// #endregion

// #region GraphQL Rate Limiter

// GraphQL Context type
export interface GraphQLContext {
  userId?: string;
  userRole?: string;
  ip: string;
}

/**
 * Create a rate limiter for GraphQL requests
 */
export function createGraphQLRateLimiter(options: RateLimitOptions = {}) {
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    keyPrefix: options?.keyPrefix || 'graphql:',
  };

  return async function graphqlRateLimiter(
    context: GraphQLContext,
    fieldName: string,
  ): Promise<void> {
    try {
      // Generate identifier from context
      const identifier = context?.userId || context?.ip;
      const key = `${mergedOptions?.keyPrefix}${fieldName}:${identifier}`;

      // Check if rate limited
      const result = await checkRateLimit(
        { ...mergedOptions, keyPrefix: key },
        identifier,
      );

      // Log the event
      await logRateLimitEvent(
        identifier,
        fieldName,
        'GRAPHQL',
        options?.keyPrefix || 'graphql',
        result,
        context?.userId || undefined,
      );

      // If rate limited, throw GraphQL error
      if (!result.success) {
        throw new GraphQLError(`Rate limit exceeded for field '${fieldName}'`, {
          extensions: {
            code: 'RATE_LIMITED',
            http: { status: 429 },
            retryAfter: result.retryAfter,
          },
        });
      }

      // Allow the operation to proceed
      return;
    } catch (error) {
      // If it's already a GraphQL error, rethrow it
      if (error instanceof GraphQLError) {
        throw error;
      }

      // Log and fail open
      logger.error('GraphQL rate limiter error', 'rate-limit', { error });
    }
  };
}

/**
 * Create middleware for Apollo Server to apply rate limiting to all operations
 */
export function createGraphQLRateLimitMiddleware(options: RateLimitOptions = {}) {
  const operationLimits = {
    query: createGraphQLRateLimiter({
      ...options,
      keyPrefix: 'graphql:query:',
      max: options?.max || 100, // 100 queries per minute by default
    }),
    mutation: createGraphQLRateLimiter({
      ...options,
      keyPrefix: 'graphql:mutation:',
      max: options?.max || 30, // 30 mutations per minute by default
    }),
    subscription: createGraphQLRateLimiter({
      ...options,
      keyPrefix: 'graphql:subscription:',
      max: options?.max || 5, // 5 subscriptions per minute by default
    }),
  };

  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ context, operationName, operation }: any) {
          if (!operation) return;

          const operationType = operation?.operation.toLowerCase();
          const rateLimiter = operationLimits[operationType as keyof typeof operationLimits];

          if (rateLimiter) {
            await rateLimiter(context, operationName || operationType);
          }
        },
      };
    },
  };
}

/**
 * Higher-order function to wrap a GraphQL resolver with rate limiting
 */
export function withGraphQLRateLimit(
  resolver: any,
  fieldName: string,
  options: RateLimitOptions = {},
) {
  const rateLimiter = createGraphQLRateLimiter(options);

  return async function rateLimit(...args: any[]) {
    const [parent, params, context] = args;

    // Apply rate limiting
    await rateLimiter(context, fieldName);

    // Call the original resolver
    return resolver(...args);
  };
}

// #endregion

// #region WebSocket Rate Limiter

// WebSocket options
export interface WebSocketRateLimitOptions extends RateLimitOptions {
  // Connection limits
  maxConnectionsPerIP?: number;
  connectionWindowMs?: number;

  // Message limits
  maxMessagesPerMinute?: number;
  maxMessageSizeBytes?: number;

  // Burst handling
  burstFactor?: number;
  burstDurationMs?: number;
}

/**
 * Create a rate limiter for WebSocket connections and messages
 */
export class WebSocketRateLimiter {
  private options: WebSocketRateLimitOptions;
  private ipToConnections: Map<string, Set<string>>;

  constructor(options: WebSocketRateLimitOptions = {}) {
    this.options = {
      // Connection limits
      maxConnectionsPerIP: options?.maxConnectionsPerIP || 10,
      connectionWindowMs: options?.connectionWindowMs || 60 * 1000,

      // Message limits
      maxMessagesPerMinute: options?.maxMessagesPerMinute || 120,
      maxMessageSizeBytes: options?.maxMessageSizeBytes || 8192,

      // Burst handling
      burstFactor: options?.burstFactor || 2,
      burstDurationMs: options?.burstDurationMs || 5000,

      // Key prefixes
      keyPrefix: options?.keyPrefix || 'ws:',

      ...options,
    };

    this.ipToConnections = new Map();
  }

  /**
   * Check if a new WebSocket connection should be allowed
   */
  async canConnect(ip: string): Promise<boolean> {
    try {
      const keyPrefix = `${this.options.keyPrefix}conn:`;
      const options = {
        windowMs: this.options.connectionWindowMs,
        max: this.options.maxConnectionsPerIP,
        keyPrefix,
      };

      // Check rate limit
      const useRedis =
        process.env.NODE_ENV === 'production' && process.env.REDIS_ENABLED === 'true';
      const result = await checkRateLimit(ip, options, useRedis);

      // Log the event
      await logRateLimitEvent(ip, 'websocket', 'CONNECT', 'websocket-connection', result);

      return result.success;
    } catch (error) {
      logger.error('WebSocket connection rate limiter error', 'websocket', { error });
      return true; // Fail open
    }
  }

  /**
   * Register a new WebSocket connection
   */
  registerConnection(ip: string, connectionId: string): void {
    if (process.env.NODE_ENV !== 'production') {
      // Only track in memory for development
      if (!this.ipToConnections.has(ip)) {
        this.ipToConnections.set(ip, new Set());
      }

      const connections = this.ipToConnections.get(ip);
      if (connections) {
        connections.add(connectionId);
      }

      logger.debug(`WebSocket connection registered: ${connectionId}`, 'websocket', {
        ip,
        connectionId,
      });
    }
  }

  /**
   * Unregister a WebSocket connection when closed
   */
  unregisterConnection(ip: string, connectionId: string): void {
    if (process.env.NODE_ENV !== 'production') {
      const connections = this.ipToConnections.get(ip);
      if (connections) {
        connections.delete(connectionId);
        if (connections.size === 0) {
          this.ipToConnections.delete(ip);
        }
      }

      logger.debug(`WebSocket connection unregistered: ${connectionId}`, 'websocket', {
        ip,
        connectionId,
      });
    }
  }

  /**
   * Check if a WebSocket message should be rate limited
   */
  async canSendMessage(ip: string, connectionId: string, messageSize: number): Promise<boolean> {
    try {
      // First check message size
      if (messageSize > this.options.maxMessageSizeBytes!) {
        logger.warn(`WebSocket message size exceeded: ${messageSize} bytes`, 'websocket', {
          ip,
          connectionId,
          size: messageSize,
          limit: this.options.maxMessageSizeBytes,
        });
        return false;
      }

      const keyPrefix = `${this.options.keyPrefix}msg:${connectionId}:`;
      const options = {
        windowMs: 60 * 1000, // 1 minute for messages
        max: this.options.maxMessagesPerMinute,
        keyPrefix,
      };

      // Check rate limit
      const useRedis =
        process.env.NODE_ENV === 'production' && process.env.REDIS_ENABLED === 'true';
      const result = await checkRateLimit(ip, options, useRedis);

      // For now, we'll handle burst mode in a future improvement

      // Log the event
      await logRateLimitEvent(ip, 'websocket', 'MESSAGE', 'websocket-message', result);

      return result.success;
    } catch (error) {
      logger.error('WebSocket message rate limiter error', 'websocket', { error });
      return true; // Fail open
    }
  }
}

// #endregion

// #region Predefined Rate Limiters

// Standard HTTP API rate limiters
export const apiRateLimiter = createRateLimiter({
  keyPrefix: 'api:general:',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' },
  keyPrefix: 'api:auth:',
});

export const sensitiveApiRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour
  message: { error: 'Request limit exceeded for sensitive operations.' },
  keyPrefix: 'api:sensitive:',
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: { error: 'Too many password reset attempts, please try again later.' },
  keyPrefix: 'api:password:',
});

export const signupRateLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 account creations per 24 hours
  message: { error: 'Account creation rate limit exceeded.' },
  keyPrefix: 'api:signup:',
});

export const tokenRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 token requests per minute
  message: { error: 'Too many token requests, please try again later.' },
  keyPrefix: 'api:token:',
});

export const financialRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 financial operations per hour
  message: { error: 'Financial operation rate limit exceeded.' },
  keyPrefix: 'api:financial:',
});

export const adminRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 admin operations per 5 minutes
  message: { error: 'Admin operation rate limit exceeded.' },
  keyPrefix: 'api:admin:',
});

// GraphQL rate limiters
export const graphqlRateLimiter = createGraphQLRateLimiter({
  keyPrefix: 'graphql:field:',
});

// Export the GraphQL middleware
export {};

// Create default WebSocket rate limiter
export {};

// #endregion

// #region Helper Functions

/**
 * Apply rate limiting to an App Router API route handler
 * @param req The NextRequest object
 * @param limiter The rate limiter to use
 * @returns A response if rate limited, null otherwise
 */
export async function applyRateLimit(
  req: NextRequest,
  limiter = apiRateLimiter,
): Promise<NextResponse | null> {
  return limiter(req);
}

/**
 * Wrap a Pages Router API handler with rate limiting
 * @param handler The API handler to wrap
 * @param limiter The rate limiter to use
 * @returns A handler function with rate limiting applied
 */
export function withRateLimit(handler: any, limiter = apiRateLimiter) {
  return async function rateLimit(req: any, res: any) {
    try {
      await limiter(req, res);
      return handler(req, res);
    } catch (error) {
      logger.error('Rate limiter error', 'rate-limit', { error });
      return res?.status(500).json({ error: 'Internal server error' });
    }
  };
}

// #endregion

// For backward compatibility with redis-rate-limiter?.ts
export {};
export {};
export {};
export {};
export {};
export {};
export {};
export {};

export class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(env?.REDIS_URL);
  }

  async checkLimit(key: string, limit: number, windowInSeconds: number): Promise<void> {
    const current = await this.redis.incr(key);
    
    // Set expiry on first request
    if (current === 1) {
      await this.redis.expire(key, windowInSeconds);
    }

    if (current > limit) {
      throw new Error('Rate limit exceeded');
    }
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
