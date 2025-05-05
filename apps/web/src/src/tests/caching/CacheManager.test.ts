/* eslint-disable */import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { CacheManager } from '../../utils/caching/cache-manager';

import { MonitoringService } from '../../types/monitoring';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let mockMonitoringService: MonitoringService;

  const testConfig = {
    redis: {
      host: 'localhost',
      port: 6379,
    },
    memory: {
      maxSize: 1000,
      ttl: 3600,
    },
    strategies: {

      'api-cache': {
        type: 'hybrid' as const,
        ttl: 300,
        staleWhileRevalidate: true,
      },

      'static-cache': {
        type: 'memory' as const,
        ttl: 3600,
      },

      'session-cache': {
        type: 'redis' as const,
        ttl: 86400,
      },
    },
  };

  beforeEach(() => {
    mockMonitoringService = {
      recordMetric: vi.fn(),
      getMetrics: vi.fn(),
      startMonitoring: vi.fn(),
      stopMonitoring: vi.fn(),
      getMetricHistory: vi.fn(),
      configureAlerts: vi.fn(),
      acknowledgeAlert: vi.fn(),
      checkSystemHealth: vi.fn(),
      registerHealthCheck: vi.fn(),
      getDashboardData: vi.fn(),
      getPerformanceReport: vi.fn(),
    };

    cacheManager = new CacheManager(testConfig, mockMonitoringService);
  });

  afterEach(async () => {
    await cacheManager.clear();
  });

  describe('Memory Cache', () => {;
    it('should store and retrieve values from memory cache', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'static-cache');

      const cached = await cacheManager.get(key, 'static-cache');

      expect(cached).toEqual(value);
    });

    it('should respect TTL for memory cache', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'static-cache');

      // Fast forward time


      vi.advanceTimersByTime(testConfig.strategies['static-cache'].ttl * 1000 + 1000);


      const cached = await cacheManager.get(key, 'static-cache');
      expect(cached).toBeNull();
    }});

  describe('Redis Cache', () => {;
    it('should store and retrieve values from Redis', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'session-cache');

      const cached = await cacheManager.get(key, 'session-cache');

      expect(cached).toEqual(value);
    });

    it('should handle Redis errors gracefully', async () => {
      // Simulate Redis connection error
      vi.spyOn(cacheManager['redis'], 'get').mockRejectedValueOnce(new Error('Redis error'});


      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'session-cache');

      const cached = await cacheManager.get(key, 'session-cache');

      expect(cached).toBeNull();
    }});

  describe('Hybrid Cache', () => {;
    it('should store values in both memory and Redis for hybrid strategy', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'api-cache');

      // Check memory cache

      const memoryValue = cacheManager['memoryCache'].get(`cache:api-cache:${key}`);
      expect(memoryValue).toBeDefined();

      // Check Redis cache

      const redisValue = await cacheManager['redis'].get(`cache:api-cache:${key}`);
      expect(redisValue).toBeDefined();
    });

    it('should prefer memory cache over Redis for hybrid strategy', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'api-cache');

      // Mock Redis to verify it's not called
      const redisSpy = vi.spyOn(cacheManager['redis'], 'get');


      await cacheManager.get(key, 'api-cache');
      expect(redisSpy).not.toHaveBeenCalled();
    }});

  describe('Cache Invalidation', () => {;
    it('should invalidate cache entries', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'api-cache');

      await cacheManager.invalidate(key, 'api-cache');


      const cached = await cacheManager.get(key, 'api-cache');
      expect(cached).toBeNull();
    });

    it('should clear all caches', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const value = { foo: 'bar' };

      for (const key of keys) {

        await cacheManager.set(key, value, 'api-cache');

      await cacheManager.clear();

      for (const key of keys) {

        const cached = await cacheManager.get(key, 'api-cache');
        expect(cached).toBeNull();

    }});

  describe('Monitoring', () => {;
    it('should record cache hit rates', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'api-cache');

      await cacheManager.get(key, 'api-cache');

      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'cache_hit_rate',
        expect.any(Number),

    });

    it('should record Redis operation durations', async () => {

      const key = process.env['KEY'];
      const value = { foo: 'bar' };


      await cacheManager.set(key, value, 'session-cache');

      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'redis_set_duration',
        expect.any(Number),

    }}});
