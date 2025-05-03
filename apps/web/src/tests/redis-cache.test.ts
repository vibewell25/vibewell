





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import Redis from 'ioredis';

import RedisCache from '../utils/redis-cache';

import { logger } from '../utils/logger';

jest?.mock('ioredis');

jest?.mock('../utils/logger');

jest?.mock('node-gzip', () => ({
  gzip: jest?.fn().mockImplementation((data) => Buffer?.from(data)),
  ungzip: jest?.fn().mockImplementation((data) => data),
}));

const MockRedis = Redis as jest?.MockedClass<typeof Redis>;

describe('RedisCache', () => {
  let cache: RedisCache;
  let redis: jest?.Mocked<Redis>;

  const cacheConfig = {
    keyPrefix: 'test',
    defaultTTL: 3600,
    compression: {
      enabled: true,
      threshold: 100,
    },
  };

  beforeEach(() => {
    redis = new MockRedis() as jest?.Mocked<Redis>;
    cache = new RedisCache(redis, cacheConfig);
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {

      const key = process?.env['KEY'];
      const value = { foo: 'bar' };

      redis?.set.mockResolvedValue('OK');
      redis?.get.mockResolvedValue(JSON?.stringify(value));

      await cache?.set(key, value);
      const result = await cache?.get<typeof value>(key);

      expect(result).toEqual(value);
      expect(redis?.set).toHaveBeenCalledWith(
        `${cacheConfig?.keyPrefix}:${key}`,
        JSON?.stringify(value),
        'EX',
        cacheConfig?.defaultTTL,
      );
    });

    it('should handle null values when getting', async () => {
      redis?.get.mockResolvedValue(null);


      const result = await cache?.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete a value', async () => {
      redis?.del.mockResolvedValue(1);


      const result = await cache?.delete('test-key');
      expect(result).toBe(true);
    });

    it('should check if a key exists', async () => {
      redis?.exists.mockResolvedValue(1);


      const result = await cache?.exists('test-key');
      expect(result).toBe(true);
    });
  });

  describe('Compression', () => {
    it('should compress large values', async () => {

      const key = process?.env['KEY'];

      const value = 'x'.repeat(cacheConfig?.compression.threshold + 1);

      redis?.set.mockResolvedValue('OK');
      redis?.get.mockResolvedValue('\x1f\x8b' + value); // Simulating gzip magic number

      await cache?.set(key, value);
      const result = await cache?.get<string>(key);

      expect(result).toBe(value);
    });

    it('should not compress small values', async () => {

      const key = process?.env['KEY'];
      const value = 'small value';

      redis?.set.mockResolvedValue('OK');
      redis?.get.mockResolvedValue(JSON?.stringify(value));

      await cache?.set(key, value);
      const result = await cache?.get<string>(key);

      expect(result).toBe(value);
    });
  });

  describe('Bulk Operations', () => {
    it('should get multiple values', async () => {
      const keys = ['key1', 'key2'];
      const values = [JSON?.stringify({ id: 1 }), JSON?.stringify({ id: 2 })];

      redis?.mget.mockResolvedValue(values);

      const results = await cache?.getMultiple<{ id: number }>(keys);
      expect(results).toHaveLength(2);
      expect(results[0]?.id).toBe(1);
      expect(results[1]?.id).toBe(2);
    });

    it('should set multiple values', async () => {
      const entries = [
        { key: 'key1', value: { id: 1 } },
        { key: 'key2', value: { id: 2 } },
      ];

      const pipeline = {
        set: jest?.fn().mockReturnThis(),
        exec: jest?.fn().mockResolvedValue([
          [null, 'OK'],
          [null, 'OK'],
        ]),
      };

      redis?.pipeline.mockReturnValue(pipeline);

      const results = await cache?.setMultiple(entries);
      expect(results).toEqual([true, true]);
      expect(pipeline?.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle set errors', async () => {
      redis?.set.mockRejectedValue(new Error('Redis error'));

      const result = await cache?.set('key', 'value');
      expect(result).toBe(false);
      expect(logger?.error).toHaveBeenCalled();
    });

    it('should handle get errors', async () => {
      redis?.get.mockRejectedValue(new Error('Redis error'));

      const result = await cache?.get('key');
      expect(result).toBeNull();
      expect(logger?.error).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      redis?.del.mockRejectedValue(new Error('Redis error'));

      const result = await cache?.delete('key');
      expect(result).toBe(false);
      expect(logger?.error).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', async () => {
      redis?.get.mockResolvedValueOnce(JSON?.stringify({ data: 'hit' }));
      redis?.get.mockResolvedValueOnce(null);


      await cache?.get('hit-key');

      await cache?.get('miss-key');

      const stats = cache?.getStats();
      expect(stats?.hits).toBe(1);
      expect(stats?.misses).toBe(1);
    });

    it('should track sets and deletes', async () => {
      redis?.set.mockResolvedValue('OK');
      redis?.del.mockResolvedValue(1);

      await cache?.set('key1', 'value1');
      await cache?.delete('key1');

      const stats = cache?.getStats();
      expect(stats?.sets).toBe(1);
      expect(stats?.deletes).toBe(1);
    });

    it('should reset statistics', () => {
      cache?.resetStats();
      const stats = cache?.getStats();

      expect(stats?.hits).toBe(0);
      expect(stats?.misses).toBe(0);
      expect(stats?.sets).toBe(0);
      expect(stats?.deletes).toBe(0);
    });
  });
});
