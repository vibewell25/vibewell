/**
 * Redis client for production rate limiting
 * 
 * This module provides a configurable Redis client for use in production environments
 * to support distributed rate limiting across multiple application instances.
 * It handles both production Redis connections and fallback to in-memory implementation.
 */

// Type for Redis client interface
export interface RedisClient {
  // Basic Redis operations
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<'OK'>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  del(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
  
  // Rate limit event logging methods
  logRateLimitEvent(event: RateLimitEvent): Promise<void>;
  getRateLimitEvents(limit?: number): Promise<RateLimitEvent[]>;
  clearOldRateLimitEvents(olderThanMs?: number): Promise<number>;
  
  // IP blocking methods
  blockIP(ip: string, durationSeconds?: number): Promise<void>;
  isIPBlocked(ip: string): Promise<boolean>;
  unblockIP(ip: string): Promise<boolean>;
  getBlockedIPs(): Promise<string[]>;
  getSuspiciousIPs(limit?: number): Promise<string[]>;
}

// Type for rate limit events
export interface RateLimitEvent {
  ip: string;
  path: string;
  method?: string;
  limiterType?: string;
  exceeded: boolean;
  blocked?: boolean;
  suspicious?: boolean;
  approaching?: boolean;
  remaining?: number;
  count?: number;
  limit?: number;
  retryAfter?: number;
  resetTime: number;
  timestamp?: number;
  overLimitFactor?: number;
  userId?: string;
}

// Interface for IP count information
interface IPCountInfo {
  ip: string;
  count: number;
}

// Mock implementation for development or when Redis connection fails
class MockRedisClient implements RedisClient {
  private store: Map<string, string>;
  private rateLimitEvents: RateLimitEvent[];
  private blockedIPs: Map<string, number>; // IP -> expiration timestamp

  constructor() {
    this.store = new Map();
    this.rateLimitEvents = [];
    this.blockedIPs = new Map();
    console.log('Using in-memory Redis mock implementation');
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
    // Mock implementation cannot track TTL accurately
    // Just return a default value if the key exists
    return this.store.has(key) ? 300 : -2;
  }

  // IP blocking methods
  async blockIP(ip: string, durationSeconds: number = 86400): Promise<void> {
    const expiresAt = Date.now() + (durationSeconds * 1000);
    this.blockedIPs.set(ip, expiresAt);
    
    // Log the block event
    await this.logRateLimitEvent({
      ip,
      path: 'system',
      method: 'BLOCK',
      limiterType: 'system',
      exceeded: true,
      blocked: true,
      suspicious: true,
      resetTime: expiresAt
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

  async getSuspiciousIPs(limit: number = 10): Promise<string[]> {
    // Group events by IP and count exceeded events
    const ipExceededCount = new Map<string, number>();
    
    this.rateLimitEvents.forEach(event => {
      if (event.exceeded && event.suspicious) {
        const count = ipExceededCount.get(event.ip) || 0;
        ipExceededCount.set(event.ip, count + 1);
      }
    });
    
    // Convert to array, sort by count descending, and take top N
    return Array.from(ipExceededCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
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
    // Return the most recent events first
    return this.rateLimitEvents
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit);
  }
  
  async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    const originalLength = this.rateLimitEvents.length;
    
    this.rateLimitEvents = this.rateLimitEvents.filter(
      event => now - (event.timestamp || 0) < olderThanMs
    );
    
    return originalLength - this.rateLimitEvents.length;
  }
}

// Production Redis client with ioredis
class ProductionRedisClient implements RedisClient {
  private client: any; // IoRedis client
  private logger: any;
  
  constructor(redisUrl: string, options: any = {}) {
    const Redis = require('ioredis');
    
    // Set up redis client
    this.client = new Redis(redisUrl, {
      password: options.password,
      tls: options.tls ? {} : undefined,
      connectTimeout: options.timeout || 5000,
      retryStrategy: (times: number) => {
        // Exponential backoff with max 10 seconds
        return Math.min(times * 100, 10000);
      },
      ...options
    });
    
    // Use console as logger if no logger provided
    this.logger = options.logger || console;
    
    // Set up event handlers
    this.client.on('connect', () => {
      this.logger.info('Redis client connected');
    });
    
    this.client.on('error', (err: Error) => {
      this.logger.error('Redis client error:', err);
    });
    
    this.client.on('reconnecting', () => {
      this.logger.info('Redis client reconnecting');
    });
    
    this.logger.info('Using Redis for rate limiting in production', {
      url: redisUrl.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
    });
  }
  
  // Basic Redis operations
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
  
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
  
  // Rate limit logging methods
  async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    try {
      const now = Date.now();
      const eventKey = 'ratelimit:events';
      const eventData = JSON.stringify({
        ...event,
        timestamp: now
      });
      
      // Add to a sorted set with score as timestamp for easy retrieval by time
      await this.client.zadd(eventKey, now, eventData);
      
      // Trim the sorted set to keep only the most recent 10,000 events
      await this.client.zremrangebyrank(eventKey, 0, -10001);
      
      // Set expiration for the entire set (30 days by default)
      await this.client.expire(eventKey, 30 * 24 * 60 * 60);
      
      // If the event shows suspicious activity, log it separately
      if (event.suspicious) {
        const suspiciousKey = 'ratelimit:suspicious';
        await this.client.zadd(suspiciousKey, now, eventData);
        await this.client.expire(suspiciousKey, 90 * 24 * 60 * 60); // Keep for 90 days
        
        // If we're tracking a specific IP for repeated violations, increment its counter
        if (event.exceeded) {
          const ipKey = `ratelimit:ip:${event.ip}:violations`;
          await this.client.incr(ipKey);
          await this.client.expire(ipKey, 24 * 60 * 60); // Keep for 24 hours
        }
      }
    } catch (error) {
      this.logger.error('Error logging rate limit event to Redis:', error);
    }
  }
  
  async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {
    try {
      const eventKey = 'ratelimit:events';
      
      // Get most recent events from the sorted set
      const events = await this.client.zrevrange(eventKey, 0, limit - 1);
      
      // Parse JSON data
      return events.map((eventData: string) => JSON.parse(eventData));
    } catch (error) {
      this.logger.error('Error retrieving rate limit events from Redis:', error);
      return [];
    }
  }
  
  async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const eventKey = 'ratelimit:events';
      const maxScore = Date.now() - olderThanMs;
      
      // Remove elements with scores (timestamps) older than the specified time
      return await this.client.zremrangebyscore(eventKey, 0, maxScore);
    } catch (error) {
      this.logger.error('Error clearing old rate limit events from Redis:', error);
      return 0;
    }
  }
  
  // IP blocking methods
  async blockIP(ip: string, durationSeconds: number = 86400): Promise<void> {
    try {
      const key = `blocked:ip:${ip}`;
      await this.client.set(key, Date.now().toString(), 'EX', durationSeconds);
      
      // Also add to a set of all blocked IPs for easy retrieval
      await this.client.zadd('blocked:ips', Date.now() + (durationSeconds * 1000), ip);
      
      // Log the blocking event
      await this.logRateLimitEvent({
        ip,
        path: 'system',
        method: 'BLOCK',
        limiterType: 'system',
        exceeded: true,
        blocked: true,
        suspicious: true,
        resetTime: Date.now() + (durationSeconds * 1000)
      });
      
      this.logger.warn(`Blocked IP ${ip} for ${durationSeconds} seconds`);
    } catch (error) {
      this.logger.error('Error blocking IP in Redis:', error);
    }
  }
  
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const key = `blocked:ip:${ip}`;
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      this.logger.error('Error checking if IP is blocked in Redis:', error);
      return false;
    }
  }
  
  async unblockIP(ip: string): Promise<boolean> {
    try {
      const key = `blocked:ip:${ip}`;
      const result = await this.client.del(key);
      
      // Also remove from the set of all blocked IPs
      await this.client.zrem('blocked:ips', ip);
      
      return result === 1;
    } catch (error) {
      this.logger.error('Error unblocking IP in Redis:', error);
      return false;
    }
  }
  
  async getBlockedIPs(): Promise<string[]> {
    try {
      // Get all IPs from the sorted set that are not expired
      const now = Date.now();
      return await this.client.zrangebyscore('blocked:ips', now, '+inf');
    } catch (error) {
      this.logger.error('Error getting blocked IPs from Redis:', error);
      return [];
    }
  }
  
  async getSuspiciousIPs(limit = 10): Promise<string[]> {
    try {
      // Find IPs with the most violations in the past 24 hours
      const keys = await this.client.keys('ratelimit:ip:*:violations');
      
      // If no keys, return empty array
      if (keys.length === 0) return [];
      
      // Get values for all keys
      const multi = this.client.multi();
      keys.forEach((key: string) => multi.get(key));
      const values = await multi.exec();
      
      // Extract IP and count from keys and values
      const ipCounts: IPCountInfo[] = keys.map((key: string, index: number) => {
        const ip = key.split(':')[2];
        const count = parseInt(values[index][1], 10);
        return { ip, count };
      });
      
      // Sort by count (highest first) and take top N
      return ipCounts
        .sort((a: IPCountInfo, b: IPCountInfo) => b.count - a.count)
        .slice(0, limit)
        .map((item: IPCountInfo) => item.ip);
    } catch (error) {
      this.logger.error('Error getting suspicious IPs from Redis:', error);
      return [];
    }
  }
}

// Initialize and export Redis client with automatic fallback to mock implementation
let redisClient: RedisClient;

// Try to create a production Redis client if in production mode
try {
  if (typeof window === 'undefined' && // Only on server
      process.env.NODE_ENV === 'production' && 
      process.env.REDIS_URL && 
      process.env.REDIS_ENABLED === 'true') {
    try {
      redisClient = new ProductionRedisClient(process.env.REDIS_URL, {
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true',
        timeout: parseInt(process.env.REDIS_TIMEOUT || '5000', 10)
      });
      console.log('Redis client initialized for production');
    } catch (error) {
      console.error('Failed to initialize production Redis client:', error);
      console.warn('Falling back to in-memory rate limiting');
      redisClient = new MockRedisClient();
    }
  } else {
    // Use mock implementation for development
    redisClient = new MockRedisClient();
  }
} catch (error) {
  console.error('Redis client initialization error:', error);
  redisClient = new MockRedisClient();
}

export default redisClient;
