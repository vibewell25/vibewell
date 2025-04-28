import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';
import { compress, decompress } from 'lz4-js';

interface CacheConfig {
  redis: {
    url: string;
    maxConnections: number;
  };
  memory: {
    maxSize: number;
    ttl: number;
  };
  compression: {
    enabled: boolean;
    threshold: number;
  };
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private static instance: CacheManager;
  private redisClient: Redis;
  private memoryCache: LRUCache<string, CacheEntry>;
  private config: CacheConfig;

  private constructor(config: CacheConfig) {
    this.config = config;
    this.initializeRedis();
    this.initializeMemoryCache();
  }

  private initializeRedis() {
    this.redisClient = new Redis(this.config.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      maxConnections: this.config.redis.maxConnections,
    });

    this.redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  private initializeMemoryCache() {
    this.memoryCache = new LRUCache({
      max: this.config.memory.maxSize,
      ttl: this.config.memory.ttl,
    });
  }

  public static getInstance(config: CacheConfig): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  public async get(key: string): Promise<any> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult) {
      return memoryResult.data;
    }

    // Try Redis cache
    const redisResult = await this.redisClient.get(key);
    if (redisResult) {
      const parsed = JSON.parse(redisResult);
      if (this.config.compression.enabled && parsed.compressed) {
        parsed.data = await decompress(parsed.data);
      }

      // Update memory cache
      this.memoryCache.set(key, {
        data: parsed.data,
        timestamp: Date.now(),
        ttl: parsed.ttl,
      });

      return parsed.data;
    }

    return null;
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.config.memory.ttl,
    };

    // Compress if needed
    let compressedData = value;
    if (
      this.config.compression.enabled &&
      JSON.stringify(value).length > this.config.compression.threshold
    ) {
      compressedData = await compress(value);
      entry.data = compressedData;
    }

    // Set in memory cache
    this.memoryCache.set(key, entry);

    // Set in Redis
    await this.redisClient.set(
      key,
      JSON.stringify({
        data: compressedData,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        compressed: this.config.compression.enabled,
      }),
      'EX',
      entry.ttl,
    );
  }

  public async invalidate(pattern: string): Promise<void> {
    // Clear memory cache entries matching pattern
    for (const key of this.memoryCache.keys()) {
      if (key.match(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear Redis cache entries matching pattern
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  public async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear Redis cache
    await this.redisClient.flushall();
  }

  public async getStats(): Promise<any> {
    return {
      memory: {
        size: this.memoryCache.size,
        maxSize: this.config.memory.maxSize,
        items: Array.from(this.memoryCache.entries()).length,
      },
      redis: {
        connected: this.redisClient.status === 'ready',
        usedMemory: await this.redisClient.info('memory'),
        keys: await this.redisClient.dbsize(),
      },
    };
  }
}

// Default configuration
const defaultConfig: CacheConfig = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    maxConnections: 50,
  },
  memory: {
    maxSize: 1000,
    ttl: 3600, // 1 hour
  },
  compression: {
    enabled: true,
    threshold: 1024, // 1KB
  },
};

export {};
