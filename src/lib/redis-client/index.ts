/**
 * Redis client interface and implementation
 */
import { Redis } from 'ioredis';

// Basic Redis client interface
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
}

// Simple in-memory implementation for development/testing
class MockRedisClient implements RedisClient {
  private store: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Redis implementation for production
class IoRedisClient implements RedisClient {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

// Factory function to get the appropriate Redis client based on environment
export function getRedisClient(): RedisClient {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // For tests and development, use the in-memory implementation
  if (nodeEnv === 'development' || nodeEnv === 'test') {
    return new MockRedisClient();
  }
  
  // For production, use the Redis implementation
  return new IoRedisClient();
} 