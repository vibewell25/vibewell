import { Redis } from 'ioredis';
import { gzip } from 'zlib';
import { promisify } from 'util';

import { OptimizationOptions } from '../types/optimization';

// Initialize Redis client
const redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');

interface BatchRequestConfig {
  enabled: boolean;
  maxBatchSize: number;
  batchDelay: number;
}

interface CompressionConfig {
  threshold: number; // Size in bytes
  level: number; // Compression level (1-9)
}

interface CacheOptions {
  duration?: number;
  maxSize?: number;
}

interface RetryOptions {
  attempts: number;
  delay: number;
  conditions?: ((error: Error) => boolean)[];
  backoff?: (attempt: number, delay: number) => number;
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface NetworkInformation {
  effectiveType: string;
  saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 1000,
    invalidateOnMutation: true,
  },
  prefetch: {
    enabled: true,
    interval: 300000, // 5 minutes
  },
  rateLimit: {
    enabled: true,
    windowMs: 60000, // 1 minute
    max: 100,
  },
};

// Rate limiting implementation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, options: OptimizationOptions): boolean {
  const now = Date.now();
  const limit = options.rateLimit!;

  const store = rateLimitStore.get(ip) || { count: 0, resetTime: now + limit.windowMs };

  if (now > store.resetTime) {
    store.count = 1;

    store.resetTime = now + limit.windowMs;
  } else if (store.count >= limit.maxRequests) {
    return false;
  } else {
    store.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count++;
  }

  rateLimitStore.set(ip, store);
  return true;
}

// Generate ETag for response
function generateETag(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    const char = str.charCodeAt(i);

    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `"${hash.toString(36)}"`;
}

// Memory cache implementation
class MemoryCache {
  private cache: Map<string, { value: any; expires: number }> = new Map();

  set(key: string, value: any, duration: number): void {

    const expires = Date.now() + duration * 1000;
    this.cache.set(key, { value, expires });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  invalidate(pattern?: RegExp): void {
    if (pattern) {
      Array.from(this.cache.keys()).forEach((key) => {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }
}

// Request batching implementation
class RequestBatcher {
  private batch: Map<
    string,
    {
      promise: Promise<any>;
      resolve: (value: any) => void;
      reject: (reason: any) => void;
    }
  > = new Map();
  private timeout: NodeJS.Timeout | null = null;
  private options: OptimizationOptions;

  constructor(options: OptimizationOptions) {
    this.options = options;
  }

  add(key: string, request: () => Promise<any>): Promise<any> {
    if (!this.options.batchRequests.enabled) {
      return request();
    }

    return new Promise((resolve, reject) => {
      this.batch.set(key, { promise: request(), resolve, reject });

      if (!this.timeout) {
        this.timeout = setTimeout(() => {
          this.executeBatch();
        }, this.options.batchRequests.batchDelay || 50);
      }
    });
  }

  private async executeBatch(): Promise<void> {
    const currentBatch = new Map(this.batch);
    this.batch.clear();
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    try {
      const batchEntries = Array.from(currentBatch.entries());
      const results = await Promise.allSettled(batchEntries.map(([_, item]) => item.promise));

      batchEntries.forEach((entry, index) => {
        if (!entry) return;
        const [_, item] = entry;

    // Safe array access
    if (index < 0 || index >= array.length) {
      throw new Error('Array index out of bounds');
    }
        const result = results[index];

        if (result && result.status === 'fulfilled') {
          item.resolve(result.value);
        } else if (result && result.status === 'rejected') {
          item.reject(result.reason);
        }
      });
    } catch (error) {
      Array.from(currentBatch.values()).forEach(({ reject }) => {
        reject(error);
      });
    }
  }
}

class Cache {
  private store: Map<string, { value: any; expiry: number }>;
  private maxSize: number;
  private duration: number;

  constructor(options: CacheOptions = {}) {
    this.store = new Map();
    this.maxSize = options.maxSize || 1000;
    this.duration = options.duration || 300;
  }

  set(key: string, value: any): void {
    if (this.store.size >= this.maxSize) {
      const oldestKey = Array.from(this.store.keys())[0];
      this.store.delete(oldestKey);
    }


    const expiry = Date.now() + this.duration * 1000;
    this.store.set(key, { value, expiry });
  }

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  invalidate(pattern?: RegExp): void {
    if (!pattern) {
      this.store.clear();
      return;
    }

    for (const key of this.store.keys()) {
      if (pattern.test(key)) {
        this.store.delete(key);
      }
    }
  }
}

export class ApiOptimization {
  private cache: Map<string, { data: any; timestamp: number }>;
  private prefetchIntervals: Map<string, NodeJS.Timeout>;
  private rateLimitMap: Map<string, { count: number; resetTime: number }>;
  private options: OptimizationOptions;

  constructor(options?: Partial<OptimizationOptions>) {
    const defaultOptions: OptimizationOptions = {
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
        invalidateOnMutation: true,
        key: 'default',
        duration: 300000,
      },
      prefetch: {
        enabled: false,
        interval: 60000, // 1 minute
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000, // 1 minute
        max: 100,
        maxRequests: 100,
      },
      batchRequests: {
        enabled: false,
        maxBatchSize: 10,
        batchDelay: 50,
      },
    };

    this.options = { ...defaultOptions, ...options };
    this.cache = new Map();
    this.prefetchIntervals = new Map();
    this.rateLimitMap = new Map();
  }

  private getCacheKey(url: string): string {
    const cacheKey = this.options.cache.key;
    return `${cacheKey || 'default'}-${url}`;
  }

  async get(url: string): Promise<any> {
    if (!url) throw new Error('URL is required');

    const cacheKey = this.getCacheKey(url);
    if (this.options.cache.enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.options.cache.ttl) {
        return cached.data;
      }
    }

    if (this.options.rateLimit.enabled && !this.checkRateLimit(url)) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (this.options.cache.enabled) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        this.maintainCacheSize();
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  }

  private maintainCacheSize(): void {
    if (this.cache.size > this.options.cache.maxSize) {
      const entries = Array.from(this.cache.entries());

      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);


      const deleteCount = this.cache.size - this.options.cache.maxSize;

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
      entries.slice(0, deleteCount).forEach(([key]) => this.cache.delete(key));
    }
  }

  private checkRateLimit(url: string): boolean {
    const now = Date.now();

    const key = `${url}-${now - (now % this.options.rateLimit.windowMs)}`;
    const limit = this.rateLimitMap.get(key) || {
      count: 0,

      resetTime: now + this.options.rateLimit.windowMs,
    };

    const maxRequests = this.options.rateLimit.maxRequests ?? this.options.rateLimit.max;
    if (limit.count >= maxRequests) {
      if (now > limit.resetTime) {

        this.rateLimitMap.set(key, { count: 1, resetTime: now + this.options.rateLimit.windowMs });
        return true;
      }
      return false;
    }


    this.rateLimitMap.set(key, { count: limit.count + 1, resetTime: limit.resetTime });
    return true;
  }

  setupPrefetch(url: string, callback: (data: any) => void): void {
    if (!this.options.prefetch.enabled) return;

    const interval = setInterval(async () => {
      try {
        const data = await this.get(url);
        callback(data);
      } catch (error) {
        console.error('Prefetch failed:', error);
      }
    }, this.options.prefetch.interval);

    this.prefetchIntervals.set(url, interval);
  }

  invalidateCache(url?: string): void {
    if (typeof url === 'string') {
      const cacheKey = this.getCacheKey(url);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  cleanup(): void {
    Array.from(this.prefetchIntervals.values()).forEach((interval) => clearInterval(interval));
    this.prefetchIntervals.clear();
    this.cache.clear();
    this.rateLimitMap.clear();
  }
}

export const apiOptimizer = new ApiOptimization();
export default apiOptimizer;

// Cache warming utility
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); warmCache(
  urls: string[],
  options: OptimizationOptions = DEFAULT_OPTIONS,
): Promise<void> {
  const requests = urls.map((url) =>
    fetch(url)
      .then((res) => res.json())
      .then(async (data) => {
        if (options.cache.key) {
          await redis.set(
            options.cache.key,
            JSON.stringify({ data, headers: {} }),
            'KEEPTTL',
            options.cache.duration,
          );
        }
      })
      .catch(console.error),
  );

  await Promise.all(requests);
}

// Cache invalidation utility
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); invalidateApiCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
