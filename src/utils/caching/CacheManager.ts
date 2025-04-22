import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';
import { hash } from 'ohash';
import { MonitoringService } from '../../types/monitoring';
import { performance } from 'perf_hooks';
import { logger } from '@/lib/logger';

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
  ttl: number;
  maxSize: number;
  cleanupInterval: number;
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
  lastCleanup: Date;
}

export class CacheManager {
  private static instance: CacheManager;
  private redis: Redis;
  private memoryCache: LRUCache<string, CacheEntry<any>>;
  private monitoringService: MonitoringService;
  private config: CacheConfig;
  private stats: CacheStats;
  private readonly PREFIX = 'vibewell:cache:';

  private constructor(config: Partial<CacheConfig> = {}) {
    this.redis = new Redis({
      host: config.redis?.host || process.env.REDIS_URL,
      port: config.redis?.port || 6379,
      ...(config.redis?.password ? { password: config.redis.password } : {}),
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.memoryCache = new LRUCache({
      max: config.memory?.maxSize || 1000,
      ttl: config.memory?.ttl || 3600,
      updateAgeOnGet: true
    });

    this.config = {
      ttl: config.ttl || 3600,
      maxSize: config.maxSize || 1000,
      cleanupInterval: config.cleanupInterval || 300,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastCleanup: new Date(),
    };

    this.setupMonitoring();
    this.startCleanupInterval();
  }

  static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  private setupMonitoring(): void {
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
      logger.error('Redis get error:', error);
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
      logger.error('Redis set error:', error);
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

    if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
      value = this.getFromMemory<T>(cacheKey);
      if (value) return value;
    }

    if (cacheStrategy.type === 'redis' || cacheStrategy.type === 'hybrid') {
      value = await this.getFromRedis<T>(cacheKey);
      if (value) {
        if (cacheStrategy.type === 'hybrid') {
          this.setInMemory(cacheKey, value, cacheStrategy.ttl);
        }
        return value;
      }
    }

    if (fetchFn) {
      try {
        value = await fetchFn();
        if (value) {
          await this.set(key, value, strategy);
        }
      } catch (error) {
        logger.error('Error fetching data:', error);
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

    if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
      this.setInMemory(cacheKey, value, ttl);
    }

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

    if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
      this.memoryCache.delete(cacheKey);
    }

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

      if (cacheStrategy.type === 'memory' || cacheStrategy.type === 'hybrid') {
        this.memoryCache.clear();
      }
      if (cacheStrategy.type === 'redis' || cacheStrategy.type === 'hybrid') {
        await this.redis.del(`cache:${strategy}:*`);
      }
    } else {
      this.memoryCache.clear();
      await this.redis.flushall();
    }
  }

  private shouldCleanup(): boolean {
    const now = Date.now();
    return this.stats.size > this.config.memory.maxSize ||
           now - this.stats.lastCleanup.getTime() > this.config.memory.ttl * 1000;
  }

  private async cleanup(): Promise<void> {
    const start = performance.now();
    try {
      const lruKeys = await this.redis.zrange(
        this.PREFIX + 'access',
        0,
        Math.max(0, this.stats.size - this.config.memory.maxSize),
        'WITHSCORES'
      );

      const keysToRemove = lruKeys.filter((_, i) => i % 2 === 0);
      if (keysToRemove.length > 0) {
        await Promise.all([
          this.redis.del(...keysToRemove.map(k => this.PREFIX + k)),
          this.redis.zrem(this.PREFIX + 'access', ...keysToRemove)
        ]);
        this.stats.size = Math.max(0, this.stats.size - keysToRemove.length);
      }

      this.stats.lastCleanup = new Date();
    } catch (error) {
      logger.error('Cache cleanup error:', error);
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
      logger.error('Cache warmup error:', error);
    } finally {
      const duration = performance.now() - start;
      await this.redis.zadd(this.PREFIX + 'metrics:warmup', Date.now(), duration.toString());
    }
  }

  private startCleanupInterval(): void {
    setInterval(async () => {
      try {
        const keys = await this.redis.keys('*');
        const now = Date.now();
        for (const key of keys) {
          const ttl = await this.redis.ttl(key);
          if (ttl <= 0) {
            await this.invalidate(key, 'default');
          }
        }
        this.stats.lastCleanup = new Date();
        this.stats.size = keys.length;
      } catch (error) {
        logger.error('Cache cleanup error:', error);
      }
    }, this.config.cleanupInterval * 1000);
  }
} 