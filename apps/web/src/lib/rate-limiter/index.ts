import { Redis } from 'ioredis';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis as UpstashRedis } from '@upstash/redis';

// Optional imports for protocol-specific adapters
try {
  require('./types');
  require('./http');
  require('./graphql');
  require('./websocket');
  require('./presets');
  require('./core');
catch (error) {
  // These modules are optional and may not exist in the codebase yet
/**
 * Rate limiting configuration options
 */
export interface RateLimitConfig {
  /**
   * Time window in milliseconds
   */
  interval: number;
  
  /**
   * Maximum number of tokens per user per interval
   */
  tokensPerInterval: number;
  
  /**
   * Maximum number of unique users per interval
   */
  uniqueTokenPerInterval?: number;
/**
 * Rate limiting service using either Upstash Redis or standard Redis
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    interval,
    tokensPerInterval,
    uniqueTokenPerInterval = 500
= config;

  // Use Upstash Redis REST client if available
  if (process.env['UPSTASH_REDIS_REST_URL'] && process.env['UPSTASH_REDIS_REST_TOKEN']) {
    const redis = new UpstashRedis({
      url: process.env['UPSTASH_REDIS_REST_URL'],
      token: process.env['UPSTASH_REDIS_REST_TOKEN'],
// Create Upstash rate limiter with sliding window algorithm
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tokensPerInterval, `${interval}ms`),
      analytics: true,
// Fall back to standard Redis
  else if (process.env['REDIS_URL']) {
    // Connect to Redis with standard client
    const redisClient = new Redis(process.env['REDIS_URL']);
    
    // Create a custom rate limiter using standard Redis
    return {
      /**
       * Check if the rate limit is exceeded
       * @param identifier Unique identifier (usually user ID)
       * @param cost Number of tokens to consume (default: 1)
       */
      check: async (identifier: string, cost: number = 1): Promise<void> => {
        const key = `rate_limit:${identifier}`;
        const now = Date.now();
        const windowStart = now - interval;
        
        // Remove requests outside the current window
        await redisClient.zremrangebyscore(key, 0, windowStart);
        
        // Count requests in current window
        const requestCount = await redisClient.zcard(key);
        
        // Check if adding the cost would exceed the limit
        if (requestCount + cost > tokensPerInterval) {
          throw new Error('Rate limit exceeded');
// Add current request to the sorted set with score as current timestamp
        await redisClient.zadd(key, now, `${now}`);
        
        // Set expiry on the key to clean up
        await redisClient.expire(key, Math.ceil(interval / 1000) * 2);
        
        return;
// Fallback if no Redis is available (memory-based, not suitable for production)
  else {
    console.warn('No Redis configuration found. Using in-memory rate limiting (not suitable for production)');
    
    const ipMap = new Map<string, number[]>();
    
    return {
      check: async (identifier: string, cost: number = 1): Promise<void> => {
        const now = Date.now();
        const windowStart = now - interval;
        
        // Get existing timestamps or create new array
        let timestamps = ipMap.get(identifier) || [];
        
        // Filter out old timestamps
        timestamps = timestamps.filter(ts => ts > windowStart);
        
        // Check if adding the cost would exceed the limit
        if (timestamps.length + cost > tokensPerInterval) {
          throw new Error('Rate limit exceeded');
// Add current timestamp
        timestamps.push(now);
        ipMap.set(identifier, timestamps);
        
        // Clean up the map periodically to prevent memory leaks
        if (ipMap.size > uniqueTokenPerInterval) {
          const keys = Array.from(ipMap.keys());
          const keysToDelete = keys.slice(0, keys.length - uniqueTokenPerInterval);
          keysToDelete.forEach(key => ipMap.delete(key));
return;
