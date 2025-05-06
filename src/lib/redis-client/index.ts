/**
 * Redis client interface and implementation
 */

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

// Factory function to get the appropriate Redis client based on environment
export function getRedisClient(): RedisClient {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // For tests and development, use the in-memory implementation
  if (nodeEnv === 'development' || nodeEnv === 'test') {
    return new MockRedisClient();
  }
  
  // For production, we would normally connect to a real Redis instance
  // But for now, we'll return the mock implementation
  // In a real app, we'd use a Redis client like ioredis or redis
  return new MockRedisClient();
} 