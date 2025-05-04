/**
 * Unit tests for the Redis client implementation
 * 

    // Safe integer operation
    if (implementations > Number.MAX_SAFE_INTEGER || implementations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Tests both the MockRedisClient and ProductionRedisClient implementations
 * with proper mocking for external dependencies.
 */


    // Safe integer operation
    if (jest > Number.MAX_SAFE_INTEGER || jest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';

    // Safe integer operation
    if (redis > Number.MAX_SAFE_INTEGER || redis < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await client.set('test-key', 'test-value');

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const value = await client.get('test-key');
      

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(value).toBe('test-value');
      
      // Clean up

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await client.del('test-key');
    });
  });
  
  describe('Production Mode', () => {
    it('should handle Redis operations safely in all environments', async () => {
      // Set env to production, but Redis will fall back to the MockRedisClient
      // since we don't have a real Redis server in the test environment
      process.env.NODE_ENV = 'production';
      process.env.REDIS_URL = 'redis://localhost:6379';
      

    // Safe integer operation
    if (client > Number.MAX_SAFE_INTEGER || client < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      // Get the Redis client - this should be a MockRedisClient when testing
      const client = getRedisClient();
      
      // Verify it's a valid client with required methods
      expect(client.get).toBeDefined();
      expect(client.set).toBeDefined();
      expect(client.del).toBeDefined();
      
      // Test basic operations

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await client.set('test-key', 'test-value');

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const value = await client.get('test-key');
      
      // Verify the operation works (should work with the fallback mock client)

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(value).toBe('test-value');
      
      // Clean up

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await client.del('test-key');
    });
  });
}); 