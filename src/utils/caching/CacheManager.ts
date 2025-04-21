import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';
import { hash } from 'ohash';
import { MonitoringService } from '../../types/monitoring';
import { performance } from 'perf_hooks';

interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  memory: {
    maxSize: number;
    ttl: number;
  };
  strategies: {
    [key: string]: {
      type: 'redis' | 'memory' | 'hybrid';
      ttl: number;
      staleWhileRevalidate?: boolean;
    };
  };
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
}

export class CacheManager {
  private redis: Redis;
  private memoryCache: LRUCache<string, CacheEntry<any>>;
  private monitoringService: MonitoringService;
  private config: CacheConfig;
  private stats: CacheStats;
  private readonly PREFIX = 'vibewell:cache:';

  constructor(config: CacheConfig, monitoringService: MonitoringService) {
    this.config = config;
    this.monitoringService = monitoringService;

    // Initialize Redis
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      ...(config.redis.password ? { password: config.redis.password } : {}),
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    // Initialize memory cache
    this.memoryCache = new LRUCache({
      max: config.memory.maxSize,
      ttl: config.memory.ttl,
      updateAgeOnGet: true
    });

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: Date.now()
    };

    this.setupMonitoring();
  }

  private setupMonitoring(): void {
    // Monitor cache hit rates
    setInterval(() => {
      const memoryStats = this.memoryCache.stats();
      const hitRate = memoryStats.hits / (memoryStats.hits + memoryStats.misses);
      this.monitoringService.recordMetric('cache_hit_rate', hitRate);
    }, 60000);
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    const start = performance.now();
    try {
      const value = await this.redis.get(key);
      const duration = performance.now() - start;
      this.monitoringService.recordMetric('redis_get_duration', duration);
      
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  private async setInRedis(key: string, value: any, ttl: number): Promise<void> {
    const start = performance.now();
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
      const duration = performance.now() - start;
      this.monitoringService.recordMetric('redis_set_duration', duration);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  private setInMemory<T>(key: string, value: T, ttl: number): void {
    const now = Date.now();
    this.memoryCache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + ttl * 1000
    });
  }

  public async get<T>(
    key: string,
    strategy: string,
    fetchFn?: () => Promise<T>
  ): Promise<T | null> {
    const cacheStrategy = this.config.strategies[strategy];
    if (!cacheStrategy) {
      throw new Error(`Unknown cache strategy: ${strategy}`);
    }

    const cacheKey = `cache:${strategy}:${hash(key)}`;
    let value: T | null = null;

    // Try memory cache first for hybrid strategy
    if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
      value = this.getFromMemory<T>(cacheKey);
      if (value) return value;
    }

    // Try Redis for redis or hybrid strategy
    if (cacheStrategy.type === 'redis' || cacheStrategy.type === 'hybrid') {
      value = await this.getFromRedis<T>(cacheKey);
      if (value) {
        // Store in memory cache for hybrid strategy
        if (cacheStrategy.type === 'hybrid') {
          this.setInMemory(cacheKey, value, cacheStrategy.ttl);
        }
        return value;
      }
    }

    // Handle cache miss
    if (fetchFn) {
      try {
        value = await fetchFn();
        if (value) {
          await this.set(key, value, strategy);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    return value;
  }

  public async set<T>(key: string, value: T, strategy: string): Promise<void> {
    const cacheStrategy = this.config.strategies[strategy];
    if (!cacheStrategy) {
      throw new Error(`Unknown cache strategy: ${strategy}`);
    }

    const cacheKey = `cache:${strategy}:${hash(key)}`;
    const { ttl } = cacheStrategy;

    // Set in memory cache
    if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
      this.setInMemory(cacheKey, value, ttl);
    }

    // Set in Redis
    if (cacheStrategy.type === 'redis' || cacheStrategy.type === 'hybrid') {
      await this.setInRedis(cacheKey, value, ttl);
    }
  }

  public async invalidate(key: string, strategy: string): Promise<void> {
    const cacheStrategy = this.config.strategies[strategy];
    if (!cacheStrategy) {
      throw new Error(`Unknown cache strategy: ${strategy}`);
    }

    const cacheKey = `cache:${strategy}:${hash(key)}`;

    // Invalidate memory cache
    if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
      this.memoryCache.delete(cacheKey);
    }

    // Invalidate Redis cache
    if (cacheStrategy.type === 'redis' || cacheStrategy.type === 'hybrid') {
      await this.redis.del(cacheKey);
    }
  }

  public async clear(strategy?: string): Promise<void> {
    if (strategy) {
      const cacheStrategy = this.config.strategies[strategy];
      if (!cacheStrategy) {
        throw new Error(`Unknown cache strategy: ${strategy}`);
      }

      // Clear specific strategy
      if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
        this.memoryCache.clear();
      }
      if (cacheStrategy.type === 'redis' || cacheStrategy.type === 'hybrid') {
        await this.redis.del(`cache:${strategy}:*`);
      }
    } else {
      // Clear all caches
      this.memoryCache.clear();
      await this.redis.flushall();
    }
  }

  private shouldCleanup(): boolean {
    const now = Date.now();
    return this.stats.size > this.config.memory.maxSize ||
           now - this.stats.lastCleanup > this.config.memory.ttl * 1000;
  }

  private async cleanup(): Promise<void> {
    const start = performance.now();
    try {
      // Get least recently used keys
      const lruKeys = await this.redis.zrange(
        this.PREFIX + 'access',
        0,
        Math.max(0, this.stats.size - this.config.memory.maxSize),
        'WITHSCORES'
      );

      // Remove old entries
      const keysToRemove = lruKeys.filter((_, i) => i % 2 === 0);
      if (keysToRemove.length > 0) {
        await Promise.all([
          this.redis.del(...keysToRemove.map(k => this.PREFIX + k)),
          this.redis.zrem(this.PREFIX + 'access', ...keysToRemove)
        ]);
        this.stats.size = Math.max(0, this.stats.size - keysToRemove.length);
      }

      this.stats.lastCleanup = Date.now();
    } catch (error) {
      console.error('Cache cleanup error:', error);
    } finally {
      const duration = performance.now() - start;
      await this.redis.zadd(this.PREFIX + 'metrics:cleanup', Date.now(), duration.toString());
    }
  }

  async getStats(): Promise<CacheStats & { hitRate: number }> {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  async warmup(keys: string[]): Promise<void> {
    const start = performance.now();
    try {
      await Promise.all(
        keys.map(async key => {
          const value = await this.redis.get(this.PREFIX + key);
          if (value) {
            await this.redis.zadd(this.PREFIX + 'access', Date.now(), key);
          }
        })
      );
    } catch (error) {
      console.error('Cache warmup error:', error);
    } finally {
      const duration = performance.now() - start;
      await this.redis.zadd(this.PREFIX + 'metrics:warmup', Date.now(), duration.toString());
    }
  }
} 
} 