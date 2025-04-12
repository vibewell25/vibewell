/**
 * Consolidated Redis Client
 * 
 * This module provides a configurable Redis client for use across the application,
 * supporting multiple environments and features:
 * 
 * - Production Redis connections for distributed rate limiting
 * - In-memory fallback implementation for development or when Redis is unavailable
 * - Support for rate limiting events and metrics
 * - IP blocking functionality for security
 * 
 * The module exports a singleton instance of the Redis client configured based on 
 * the current environment.
 */

import { logger } from '@/lib/logger';

// Type for Redis client interface
export interface RedisClient {
  // Basic Redis operations
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<'OK'>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  del(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
  
  // Redis commands for sorted sets
  zadd(key: string, score: number, member: string): Promise<number>;
  zrange(key: string, start: number, stop: number): Promise<string[]>;
  zrangebyscore(key: string, min: number, max: number): Promise<string[]>;
  zremrangebyrank(key: string, start: number, stop: number): Promise<number>;
  
  // Redis commands for keys
  keys(pattern: string): Promise<string[]>;
  info(): Promise<string>;
  
  // Rate limit event logging methods
  logRateLimitEvent(event: RateLimitEvent): Promise<void>;
  getRateLimitEvents(limit?: number): Promise<RateLimitEvent[]>;
  clearOldRateLimitEvents(olderThanMs?: number): Promise<number>;
  
  // IP blocking methods
  blockIP(ip: string, durationSeconds?: number): Promise<void>;
  isIPBlocked(ip: string): Promise<boolean>;
  unblockIP(ip: string): Promise<boolean>;
  getBlockedIPs(): Promise<string[]>;
  getSuspiciousIPs(limit?: number): Promise<SuspiciousIP[]>;
}

// Type for rate limit events
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

// Suspicious IP interface
export interface SuspiciousIP {
  ip: string;
  count: number;
  recentEvents: RateLimitEvent[];
}

// Interface for IP count information
interface IPCountInfo {
  ip: string;
  count: number;
}

// Next.js compatibility check
const isServer = typeof window === 'undefined';
const isEdgeRuntime = typeof process.env.NEXT_RUNTIME === 'string' && process.env.NEXT_RUNTIME === 'edge';

/**
 * Mock Redis client for development or when Redis connection fails
 */
class MockRedisClient implements RedisClient {
  private store: Map<string, string>;
  private rateLimitEvents: RateLimitEvent[];
  private blockedIPs: Map<string, number>; // IP -> expiration timestamp
  private sortedSets: Map<string, Array<{ score: number, member: string }>>;

  constructor() {
    this.store = new Map();
    this.rateLimitEvents = [];
    this.blockedIPs = new Map();
    this.sortedSets = new Map();
    logger.info('Using in-memory Redis client in development', 'redis');
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
  
  async ttl(key: string): Promise<number> {
    return this.store.has(key) ? 300 : -2;
  }

  // Methods for sorted sets
  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, []);
    }
    
    const set = this.sortedSets.get(key)!;
    const existingIndex = set.findIndex(item => item.member === member);
    
    if (existingIndex !== -1) {
      set[existingIndex].score = score;
      return 0;
    } else {
      set.push({ score, member });
      set.sort((a, b) => a.score - b.score);
      return 1;
    }
  }
  
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    const set = this.sortedSets.get(key) || [];
    const result = set.slice(start, stop === -1 ? undefined : stop + 1);
    return result.map(item => item.member);
  }
  
  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    const set = this.sortedSets.get(key) || [];
    return set
      .filter(item => item.score >= min && item.score <= max)
      .map(item => item.member);
  }
  
  async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    const set = this.sortedSets.get(key);
    if (!set) return 0;
    
    const actualStop = stop === -1 ? set.length - 1 : stop;
    const removed = set.splice(start, actualStop - start + 1);
    return removed.length;
  }
  
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keys: string[] = [];
    
    Array.from(this.store.keys()).forEach(key => {
      if (regex.test(key)) {
        keys.push(key);
      }
    });
    
    return keys;
  }
  
  async info(): Promise<string> {
    return `
# Server
redis_version:mock
uptime_in_seconds:${Math.floor(process.uptime())}

# Clients
connected_clients:1

# Memory
used_memory:${Math.round(process.memoryUsage().heapUsed)}

# Stats
total_commands_processed:${this.store.size * 2}
keyspace_hits:${this.store.size}
keyspace_misses:0
    `.trim();
  }

  // IP blocking methods
  async blockIP(ip: string, durationSeconds: number = 86400): Promise<void> {
    const expiresAt = Date.now() + (durationSeconds * 1000);
    this.blockedIPs.set(ip, expiresAt);
    
    // Log the block event
    await this.logRateLimitEvent({
      id: `block-${ip}-${Date.now()}`,
      ip,
      path: 'system',
      method: 'BLOCK',
      limiterType: 'system',
      exceeded: true,
      blocked: true,
      suspicious: true,
      resetTime: expiresAt,
      timestamp: Date.now()
    });
  }

  async isIPBlocked(ip: string): Promise<boolean> {
    if (!this.blockedIPs.has(ip)) return false;
    
    const expiresAt = this.blockedIPs.get(ip)!;
    const now = Date.now();
    
    // Clean up expired blocks
    if (now > expiresAt) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  async unblockIP(ip: string): Promise<boolean> {
    return this.blockedIPs.delete(ip);
  }

  async getBlockedIPs(): Promise<string[]> {
    const now = Date.now();
    const validIPs: string[] = [];
    
    // Only return non-expired blocks
    this.blockedIPs.forEach((expiresAt, ip) => {
      if (expiresAt > now) {
        validIPs.push(ip);
      } else {
        this.blockedIPs.delete(ip);
      }
    });
    
    return validIPs;
  }

  async getSuspiciousIPs(limit: number = 20): Promise<SuspiciousIP[]> {
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
  
  // Methods for rate limit event logging
  async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    // In mock mode, store in memory
    this.rateLimitEvents.push({
      ...event,
      timestamp: event.timestamp || Date.now()
    });
    
    // Trim array to last 1000 events to prevent memory leaks
    if (this.rateLimitEvents.length > 1000) {
      this.rateLimitEvents = this.rateLimitEvents.slice(-1000);
    }
  }
  
  async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {
    // Return the most recent events first
    return this.rateLimitEvents
      .sort((a, b) => b.timestamp - a.timestamp)
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
class ProductionRedisClient implements RedisClient {
  private client: any; // ioredis client
  
  constructor(redisUrl: string, options: any = {}) {
    // Early return with clear error if in Edge Runtime
    if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('Redis client cannot be used in Edge Runtime');
    }
    
    // Dynamically import Redis to avoid build issues
    try {
      // Only load ioredis in Node.js environment, not in browser or Edge
      if (typeof window === 'undefined' && typeof process !== 'undefined' && process.version) {
        // Use require dynamically to avoid webpack issues
        const Redis = require('ioredis');
        
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times: number) => {
            return Math.min(times * 50, 2000); // Exponential backoff with max 2 seconds
          },
          ...options
        });
        
        this.client.on('error', (err: Error) => {
          logger.error(`Redis connection error: ${err.message}`, 'redis', { error: err });
        });
        
        this.client.on('connect', () => {
          logger.info('Redis connected successfully', 'redis');
        });
        
        logger.info('Redis client initialized for production use', 'redis');
      } else {
        throw new Error('Redis client can only be used in Node.js environment');
      }
    } catch (error) {
      logger.error(`Failed to initialize Redis client: ${error}`, 'redis', { error });
      throw new Error('Redis client initialization failed');
    }
  }
  
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  
  async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    return options?.ex 
      ? this.client.set(key, value, 'EX', options.ex)
      : this.client.set(key, value);
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
  
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
  
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member);
  }
  
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }
  
  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    return this.client.zrangebyscore(key, min, max);
  }
  
  async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    return this.client.zremrangebyrank(key, start, stop);
  }
  
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
  
  async info(): Promise<string> {
    return this.client.info();
  }
  
  async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    try {
      // Store event in a Redis sorted set with timestamp as score
      const eventKey = 'ratelimit:events';
      const eventId = event.id || `${event.ip}:${event.path}:${Date.now()}`;
      
      // Add the event ID to ensure uniqueness
      event.id = eventId;
      
      // Store the stringified event
      await this.client.zadd(eventKey, event.timestamp, JSON.stringify(event));
      
      // Keep the set size manageable - retain the last 10,000 events
      await this.client.zremrangebyrank(eventKey, 0, -10001);
      
      // Set expiration for events (7 days)
      await this.client.expire(eventKey, 7 * 24 * 60 * 60);
      
      // If this is a suspicious event, add it to the suspicious IP tracking
      if (event.suspicious || event.exceeded) {
        const ip = event.ip;
        const suspiciousKey = `vibewell:ratelimit:suspicious:${ip}`;
        
        // Update the count for this IP
        await this.client.incr(suspiciousKey);
        await this.client.expire(suspiciousKey, 24 * 60 * 60); // Expire after 24 hours
      }
    } catch (error) {
      logger.error(`Failed to log rate limit event: ${error}`, 'redis', { 
        error,
        event
      });
    }
  }
  
  async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {
    try {
      const eventKey = 'ratelimit:events';
      
      // Get the most recent events (highest scores first)
      const events = await this.client.zrevrange(eventKey, 0, limit - 1);
      
      return events
        .map((event: string) => {
          try {
            return JSON.parse(event);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      logger.error(`Failed to get rate limit events: ${error}`, 'redis', { error });
      return [];
    }
  }
  
  async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const eventKey = 'ratelimit:events';
      const cutoffTime = Date.now() - olderThanMs;
      
      // Remove events older than the cutoff time
      return await this.client.zremrangebyscore(eventKey, 0, cutoffTime);
    } catch (error) {
      logger.error(`Failed to clear old rate limit events: ${error}`, 'redis', { error });
      return 0;
    }
  }
  
  async blockIP(ip: string, durationSeconds: number = 86400): Promise<void> {
    try {
      // Block the IP
      const blockedKey = `vibewell:ratelimit:blocked:${ip}`;
      await this.client.set(blockedKey, "1", "EX", durationSeconds);
      
      // Log the block event
      await this.logRateLimitEvent({
        id: `block-${ip}-${Date.now()}`,
        ip,
        path: 'system',
        method: 'BLOCK',
        limiterType: 'system',
        exceeded: true,
        blocked: true,
        suspicious: true,
        resetTime: Date.now() + (durationSeconds * 1000),
        timestamp: Date.now()
      });
      
      logger.warn(`Blocked IP address: ${ip} for ${durationSeconds} seconds`, 'redis', {
        ip: logger['hashSensitiveData'](ip),
        duration: durationSeconds
      });
    } catch (error) {
      logger.error(`Failed to block IP: ${error}`, 'redis', { error, ip });
    }
  }
  
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const blockedKey = `vibewell:ratelimit:blocked:${ip}`;
      const result = await this.client.get(blockedKey);
      
      // Return true if the key exists (IP is blocked)
      return result !== null;
    } catch (error) {
      logger.error(`Failed to check if IP is blocked: ${error}`, 'redis', { error, ip });
      return false;
    }
  }
  
  async unblockIP(ip: string): Promise<boolean> {
    try {
      const blockedKey = `vibewell:ratelimit:blocked:${ip}`;
      
      // Delete the blocked key
      const result = await this.client.del(blockedKey);
      
      // Log the unblock event
      if (result > 0) {
        await this.logRateLimitEvent({
          id: `unblock-${ip}-${Date.now()}`,
          ip,
          path: 'system',
          method: 'UNBLOCK',
          limiterType: 'system',
          exceeded: false,
          suspicious: false,
          resetTime: Date.now(),
          timestamp: Date.now()
        });
        
        logger.info(`Unblocked IP address: ${ip}`, 'redis', {
          ip: logger['hashSensitiveData'](ip)
        });
      }
      
      return result > 0;
    } catch (error) {
      logger.error(`Failed to unblock IP: ${error}`, 'redis', { error, ip });
      return false;
    }
  }
  
  async getBlockedIPs(): Promise<string[]> {
    try {
      const pattern = 'vibewell:ratelimit:blocked:*';
      const keys = await this.client.keys(pattern);
      
      // Extract the IP from the key pattern
      return keys.map((key: string) => key.replace('vibewell:ratelimit:blocked:', ''));
    } catch (error) {
      logger.error(`Failed to get blocked IPs: ${error}`, 'redis', { error });
      return [];
    }
  }
  
  async getSuspiciousIPs(limit = 20): Promise<SuspiciousIP[]> {
    try {
      const pattern = 'vibewell:ratelimit:suspicious:*';
      const keys = await this.client.keys(pattern);
      
      // Get all suspicious IP counts
      const ips: IPCountInfo[] = [];
      for (const key of keys) {
        const ip = key.replace('vibewell:ratelimit:suspicious:', '');
        const count = parseInt(await this.client.get(key) || '0', 10);
        
        ips.push({ ip, count });
      }
      
      // Sort by count (highest first) and take top IPs based on limit
      const topIPs = ips
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      
      // Get recent events for these IPs
      const eventKey = 'ratelimit:events';
      const now = Date.now();
      const hourAgo = now - (60 * 60 * 1000);
      const events = await this.getRateLimitEvents(1000);
      
      // Group events by IP
      const ipEvents: Record<string, RateLimitEvent[]> = {};
      topIPs.forEach(ip => {
        ipEvents[ip.ip] = [];
      });
      
      // Filter events for the top IPs
      events.forEach(event => {
        if (ipEvents[event.ip] && event.timestamp >= hourAgo) {
          ipEvents[event.ip].push(event);
        }
      });
      
      // Format the result
      return topIPs.map(ip => ({
        ip: ip.ip,
        count: ip.count,
        recentEvents: ipEvents[ip.ip].slice(0, 10) // Limit to 10 recent events per IP
      }));
    } catch (error) {
      logger.error(`Failed to get suspicious IPs: ${error}`, 'redis', { error });
      return [];
    }
  }
}

/**
 * Create a Redis client based on environment configuration
 */
function createRedisClient(): RedisClient {
  // Always use mock client in Edge Runtime
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge') {
    logger.info('Using in-memory Redis client in Edge Runtime', 'redis');
    return new MockRedisClient();
  }
  
  // Use real Redis in production if URL is available and in Node.js environment
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    try {
      return new ProductionRedisClient(process.env.REDIS_URL);
    } catch (error) {
      logger.error(`Failed to create production Redis client: ${error}`, 'redis', { error });
      logger.warn('Falling back to in-memory Redis client', 'redis');
      return new MockRedisClient();
    }
  } else {
    return new MockRedisClient();
  }
}

let redisClient: RedisClient | null = null;

// Get or create the Redis client
export function getRedisClient(): RedisClient {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// Export default client for backward compatibility
const defaultClient = getRedisClient();
export default defaultClient; 