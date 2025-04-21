import Redis from 'ioredis';
import { promisify } from 'util';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export class Cache {
  private prefix: string;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || 'vibewell:';
    this.defaultTTL = options.ttl || 3600; // 1 hour
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await redis.set(this.getKey(key), serialized, 'EX', ttl || this.defaultTTL);
  }

  async delete(key: string): Promise<void> {
    await redis.del(this.getKey(key));
  }

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(this.getKey(key))) === 1;
  }

  async increment(key: string, by = 1): Promise<number> {
    return await redis.incrby(this.getKey(key), by);
  }

  async decrement(key: string, by = 1): Promise<number> {
    return await redis.decrby(this.getKey(key), by);
  }

  async clear(): Promise<void> {
    const keys = await redis.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  async withCache<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    return this.getOrSet(key, fetchFn, ttl);
  }
}

// Cache instances for different purposes
export const userCache = new Cache({ prefix: 'user:', ttl: 1800 }); // 30 minutes
export const productCache = new Cache({ prefix: 'product:', ttl: 3600 }); // 1 hour
export const sessionCache = new Cache({ prefix: 'session:', ttl: 86400 }); // 24 hours
export const analyticsCache = new Cache({ prefix: 'analytics:', ttl: 300 }); // 5 minutes

// Cache middleware for Express/Next.js
export const cacheMiddleware = (duration: number) => {
  return async (req: any, res: any, next: any) => {
    const key = `route:${req.originalUrl || req.url}`;
    const cachedResponse = await userCache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data: any) {
      userCache.set(key, data, duration);
      return originalJson.call(this, data);
    };

    next();
  };
};
