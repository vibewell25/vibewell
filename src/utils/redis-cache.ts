import Redis from 'ioredis';
import { gzip, ungzip } from 'node-gzip';
import { logger } from './logger';

interface CacheConfig {
  keyPrefix: string;
  defaultTTL: number;
  compression?: {
    enabled: boolean;
    threshold: number; // Size in bytes above which to compress
  };
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

class RedisCache {
  private redis: Redis;
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(redis: Redis, config: CacheConfig) {
    this.redis = redis;
    this.config = {
      ...config,
      compression: {
        enabled: config.compression?.enabled ?? true,
        threshold: config.compression?.threshold ?? 1024
      }
    };
  }

  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}:${key}`;
  }

  private async compressValue(value: string): Promise<Buffer> {
    try {
      return await gzip(value);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error compressing cache value:', errorMessage);
      throw error;
    }
  }

  private async decompressValue(value: Buffer): Promise<string> {
    try {
      return (await ungzip(value)).toString();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error decompressing cache value:', errorMessage);
      throw error;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    try {
      const value = await this.redis.get(fullKey);
      
      if (!value) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      
      // Check if value is compressed (starts with gzip magic number)
      const isCompressed = value.startsWith('\x1f\x8b');
      const decompressedValue = isCompressed 
        ? await this.decompressValue(Buffer.from(value))
        : value;

      return JSON.parse(decompressedValue);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error getting cache key ${key}:`, errorMessage);
      return null;
    }
  }

  public async set<T>(
    key: string,
    value: T,
    ttl: number = this.config.defaultTTL
  ): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    try {
      const stringValue = JSON.stringify(value);
      
      let finalValue = stringValue;
      if (
        this.config.compression?.enabled &&
        stringValue.length > this.config.compression.threshold
      ) {
        const compressedValue = await this.compressValue(stringValue);
        finalValue = compressedValue.toString('binary');
      }

      const result = await this.redis.set(fullKey, finalValue, 'EX', ttl);
      if (result === 'OK') {
        this.stats.sets++;
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error setting cache key ${key}:`, errorMessage);
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    try {
      const result = await this.redis.del(fullKey);
      if (result > 0) {
        this.stats.deletes++;
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error deleting cache key ${key}:`, errorMessage);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    try {
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error checking cache key ${key}:`, errorMessage);
      return false;
    }
  }

  public async clear(): Promise<void> {
    try {
      const pattern = this.getFullKey('*');
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.stats.deletes += keys.length;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error clearing cache:', errorMessage);
      throw error;
    }
  }

  public async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    const fullKeys = keys.map(key => this.getFullKey(key));
    try {
      const values = await this.redis.mget(...fullKeys);
      return await Promise.all(
        values.map(async (value) => {
          if (!value) {
            this.stats.misses++;
            return null;
          }

          this.stats.hits++;
          const isCompressed = value.startsWith('\x1f\x8b');
          const decompressedValue = isCompressed
            ? await this.decompressValue(Buffer.from(value))
            : value;

          return JSON.parse(decompressedValue);
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting multiple cache keys:', errorMessage);
      return keys.map(() => null);
    }
  }

  public async setMultiple<T>(
    entries: Array<{ key: string; value: T }>,
    ttl: number = this.config.defaultTTL
  ): Promise<boolean[]> {
    const pipeline = this.redis.pipeline();
    
    try {
      const compressionPromises = entries.map(async ({ key, value }) => {
        const fullKey = this.getFullKey(key);
        const stringValue = JSON.stringify(value);

        let finalValue = stringValue;
        if (
          this.config.compression?.enabled &&
          stringValue.length > this.config.compression.threshold
        ) {
          const compressedValue = await this.compressValue(stringValue);
          finalValue = compressedValue.toString('binary');
        }

        pipeline.set(fullKey, finalValue, 'EX', ttl);
        return true;
      });

      await Promise.all(compressionPromises);
      const results = await pipeline.exec();
      
      if (!results) return entries.map(() => false);

      return results.map(([error, result]) => {
        if (!error && result === 'OK') {
          this.stats.sets++;
          return true;
        }
        return false;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error setting multiple cache keys:', errorMessage);
      return entries.map(() => false);
    }
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }
}

export default RedisCache; 