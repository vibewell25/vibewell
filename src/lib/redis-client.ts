/**
 * Redis client for production rate limiting
 * 
 * This module provides a configurable Redis client for use in production environments
 * to support distributed rate limiting across multiple application instances.
 */

import { logger } from '@/lib/logger';

// Import Redis dynamically to avoid issues during build time
let Redis: any;

/**
 * Common interface for Redis operations needed by the rate limiting system
 */
interface RateLimitRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<'OK'>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  del(key: string): Promise<number>;
  // Rate limit event logging methods
  logRateLimitEvent(event: RateLimitEvent): Promise<void>;
  getRateLimitEvents(limit?: number): Promise<RateLimitEvent[]>;
  getSuspiciousIPs(limit?: number): Promise<SuspiciousIP[]>;
  clearOldRateLimitEvents(olderThanMs?: number): Promise<number>;
}

// Rate limit event interface
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
}

// Suspicious IP interface
export interface SuspiciousIP {
  ip: string;
  count: number;
  recentEvents: RateLimitEvent[];
}

/**
 * Mock Redis client for development or when Redis connection fails
 */
class MockRedisClient implements RateLimitRedisClient {
  private store: Map<string, string>;
  private rateLimitEvents: RateLimitEvent[];

  constructor() {
    this.store = new Map();
    this.rateLimitEvents = [];
    logger.info('Using in-memory rate limiting in development', 'redis');
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    this.store.set(key, value);
    
    // Handle expiration if specified
    if (options?.ex) {
      setTimeout(() => {
        this.store.delete(key);
      }, options.ex * 1000);
    }
    
    return 'OK';
  }

  async incr(key: string): Promise<number> {
    const value = this.store.get(key);
    const newValue = value ? parseInt(value, 10) + 1 : 1;
    this.store.set(key, newValue.toString());
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.store.has(key)) return 0;
    
    setTimeout(() => {
      this.store.delete(key);
    }, seconds * 1000);
    
    return 1;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
  
  // Methods for rate limit event logging
  async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    // In mock mode, store in memory
    this.rateLimitEvents.push({
      ...event,
      timestamp: Date.now()
    });
    
    // Trim array to last 1000 events to prevent memory leaks
    if (this.rateLimitEvents.length > 1000) {
      this.rateLimitEvents = this.rateLimitEvents.slice(-1000);
    }
  }
  
  async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {
    // Return the last events, most recent first
    return this.rateLimitEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  async getSuspiciousIPs(limit = 20): Promise<SuspiciousIP[]> {
    // Group events by IP
    const ipCounts: Record<string, { count: number, events: RateLimitEvent[] }> = {};
    
    this.rateLimitEvents.forEach(event => {
      if (event.suspicious || event.exceeded) {
        if (!ipCounts[event.ip]) {
          ipCounts[event.ip] = { count: 0, events: [] };
        }
        
        ipCounts[event.ip].count++;
        ipCounts[event.ip].events.push(event);
      }
    });
    
    // Convert to array and sort by count
    return Object.entries(ipCounts)
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        recentEvents: data.events.slice(0, 10) // Just keep the 10 most recent events per IP
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    const originalLength = this.rateLimitEvents.length;
    
    this.rateLimitEvents = this.rateLimitEvents.filter(
      event => now - event.timestamp < olderThanMs
    );
    
    return originalLength - this.rateLimitEvents.length;
  }
}

/**
 * Production Redis client that wraps ioredis
 */
class ProductionRedisClient implements RateLimitRedisClient {
  private client: any; // ioredis client
  
  constructor(redisUrl: string, options: any = {}) {
    try {
      // Import Redis dynamically
      if (!Redis) {
        Redis = require('ioredis').default;
      }
      
      this.client = new Redis(redisUrl, {
        password: options.password,
        tls: options.tls ? {} : undefined,
        connectTimeout: options.timeout || 5000,
        retryStrategy: (times: number) => {
          return Math.min(times * 100, 10000);
        },
        ...options
      });
      
      this.client.on('connect', () => {
        logger.info('Redis client connected successfully', 'redis');
      });
      
      this.client.on('error', (err: Error) => {
        logger.error(`Redis client error: ${err.message}`, 'redis', { error: err });
      });
      
      logger.info('Using Redis for rate limiting in production', 'redis', {
        url: redisUrl.replace(/\/\/.*@/, '//***:***@') // Hide credentials in URL
      });
    } catch (err) {
      logger.error(`Failed to initialize Redis client: ${err}`, 'redis', { error: err });
      throw err;
    }
  }
  
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  
  async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    if (options?.ex) {
      return this.client.set(key, value, 'EX', options.ex);
    }
    return this.client.set(key, value);
  }
  
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }
  
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
  
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
  
  async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    try {
      const now = Date.now();
      const eventKey = `ratelimit:events`;
      const eventData = JSON.stringify({
        ...event,
        timestamp: now
      });
      
      // Add to a sorted set with score as timestamp for easy retrieval by time
      await this.client.zadd(eventKey, now, eventData);
      
      // Trim the sorted set to keep only the last 10,000 events
      await this.client.zremrangebyrank(eventKey, 0, -10001);
      
      // Set expiration for the entire set (e.g., 7 days)
      await this.client.expire(eventKey, 7 * 24 * 60 * 60);
      
      // If specific IP is doing suspicious activity, track in separate key
      if (event.exceeded && event.suspicious) {
        const suspiciousKey = `ratelimit:suspicious:${event.ip}`;
        await this.client.zadd(suspiciousKey, now, eventData);
        await this.client.expire(suspiciousKey, 30 * 24 * 60 * 60); // 30 days
      }
    } catch (error) {
      logger.error(`Failed to log rate limit event to Redis: ${error}`, 'redis', { error });
    }
  }
  
  async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {
    try {
      const eventKey = `ratelimit:events`;
      
      // Get the most recent events
      const results = await this.client.zrevrange(eventKey, 0, limit - 1);
      return results.map((item: string) => JSON.parse(item));
    } catch (error) {
      logger.error(`Failed to get rate limit events from Redis: ${error}`, 'redis', { error });
      return [];
    }
  }
  
  async getSuspiciousIPs(limit = 20): Promise<SuspiciousIP[]> {
    try {
      // Get keys matching the suspicious pattern
      const keys = await this.client.keys('ratelimit:suspicious:*');
      const results: SuspiciousIP[] = [];
      
      // Process at most 'limit' IPs
      for (const key of keys.slice(0, limit)) {
        const ip = key.split(':')[2];
        const count = await this.client.zcard(key);
        
        // Get the 10 most recent events for this IP
        const eventData = await this.client.zrevrange(key, 0, 9);
        const recentEvents = eventData.map((item: string) => JSON.parse(item));
        
        results.push({ ip, count, recentEvents });
      }
      
      // Sort by count descending
      return results.sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error(`Failed to get suspicious IPs from Redis: ${error}`, 'redis', { error });
      return [];
    }
  }
  
  async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const eventKey = `ratelimit:events`;
      const now = Date.now();
      const cutoffTime = now - olderThanMs;
      
      // Remove all events older than the cutoff time
      const removedCount = await this.client.zremrangebyscore(eventKey, 0, cutoffTime);
      
      return removedCount;
    } catch (error) {
      logger.error(`Failed to clear old rate limit events from Redis: ${error}`, 'redis', { error });
      return 0;
    }
  }
}

// Initialize and export Redis client with automatic fallback to mock implementation
let redisClient: RateLimitRedisClient;

try {
  // Determine which client to use based on environment
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL && process.env.RATE_LIMIT_MODE === 'redis') {
    try {
      // Create production client
      redisClient = new ProductionRedisClient(process.env.REDIS_URL, {
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true',
        timeout: parseInt(process.env.REDIS_TIMEOUT || '5000', 10)
      });
    } catch (error) {
      logger.error(`Failed to initialize production Redis client: ${error}`, 'redis', { error });
      logger.warn('Falling back to in-memory rate limiting', 'redis');
      redisClient = new MockRedisClient();
    }
  } else {
    // Use mock implementation for development
    redisClient = new MockRedisClient();
  }
} catch (error) {
  logger.error(`Redis client initialization error: ${error}`, 'redis', { error });
  redisClient = new MockRedisClient();
}

export default redisClient; 