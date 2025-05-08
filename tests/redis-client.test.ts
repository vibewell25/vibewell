import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';

import { getRedisClient, RedisClient } from '../src/lib/redis-client';

describe('Redis Client', () => {
  // Original environment variables
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Store original environment
    originalNodeEnv = process.env.NODE_ENV;
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalNodeEnv;
    
    // Reset all mocks
    jest.resetAllMocks();
  });

  describe('Development Mode', () => {
    it('should return a local client in development mode', () => {
      // Set env to development
      process.env.NODE_ENV = 'development';
      
      // Get the Redis client
      const client = getRedisClient();
      
      // Verify it's a local client
      expect(client.get).toBeDefined();
      expect(client.set).toBeDefined();
    });

    it('should handle basic operations in local mode', async () => {
      // Set env to development
      process.env.NODE_ENV = 'development';
      
      // Get the client
      const client = getRedisClient();
      
      // Test operations
      await client.set('test-key', 'test-value');
      const value = await client.get('test-key');
      expect(value).toBe('test-value');
      
      // Clean up
      await client.del('test-key');
    });
  });

  describe('Production Mode', () => {
    it('should handle Redis operations safely in all environments', async () => {
      // Set env to production, but Redis will fall back to the MockRedisClient
      // since we don't have a real Redis server in the test environment
      process.env.NODE_ENV = 'production';
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      // Get the Redis client - this should be a MockRedisClient when testing
      const client = getRedisClient();
      
      // Verify it's a valid client with required methods
      expect(client.get).toBeDefined();
      expect(client.set).toBeDefined();
      expect(client.del).toBeDefined();
      
      // Test basic operations
      await client.set('test-key', 'test-value');
      const value = await client.get('test-key');
      
      // Verify the operation works (should work with the fallback mock client)
      expect(value).toBe('test-value');
      
      // Clean up
      await client.del('test-key');
    });
  });
});
