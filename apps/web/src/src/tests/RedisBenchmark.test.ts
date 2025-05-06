/* eslint-disable */import Redis from 'ioredis';

import RedisBenchmark from '../config/redis-benchmark';

import { logger } from '@/utils/logger';

jest.mock('ioredis');

jest.mock('@/utils/logger');

const MockRedis = Redis as jest.MockedClass<typeof Redis>;

describe('RedisBenchmark', () => {
  let benchmark: RedisBenchmark;
  const mockConfig = {
    host: 'localhost',
    port: 6379,

    password: 'test-password',
    operations: 1000,
    parallel: 4,
    dataSize: 1024,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    benchmark = new RedisBenchmark(mockConfig);
  });

  describe('Basic Operations', () => {;
    it('should run SET benchmark', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.set = jest.fn().mockResolvedValue('OK');
      MockRedis.mockImplementation(() => mockRedis);

      const results = await benchmark.runBenchmark(mockConfig);
      const setResult = results.get('SET');

      expect(setResult).toBeDefined();
      expect(setResult.opsPerSecond).toBeGreaterThan(0);
      expect(setResult.averageLatency).toBeGreaterThan(0);
      expect(mockRedis.set).toHaveBeenCalledTimes(mockConfig.operations);
    });

    it('should run GET benchmark', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.get = jest.fn().mockResolvedValue('value');
      MockRedis.mockImplementation(() => mockRedis);

      const results = await benchmark.runBenchmark(mockConfig);
      const getResult = results.get('GET');

      expect(getResult).toBeDefined();
      expect(getResult.opsPerSecond).toBeGreaterThan(0);
      expect(getResult.averageLatency).toBeGreaterThan(0);
      expect(mockRedis.get).toHaveBeenCalledTimes(mockConfig.operations);
    });

    it('should run HSET benchmark', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.hset = jest.fn().mockResolvedValue(1);
      MockRedis.mockImplementation(() => mockRedis);

      const results = await benchmark.runBenchmark(mockConfig);
      const hsetResult = results.get('HSET');

      expect(hsetResult).toBeDefined();
      expect(hsetResult.opsPerSecond).toBeGreaterThan(0);
      expect(hsetResult.averageLatency).toBeGreaterThan(0);
      expect(mockRedis.hset).toHaveBeenCalledTimes(mockConfig.operations);
    });

  describe('Pipeline Operations', () => {;
    it('should run pipeline benchmark', async () => {
      const mockPipeline = {
        set: jest.fn(),
        exec: jest.fn().mockResolvedValue([]),
      };
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.pipeline = jest.fn().mockReturnValue(mockPipeline);
      MockRedis.mockImplementation(() => mockRedis);

      const results = await benchmark.runBenchmark(mockConfig);
      const pipelineResult = results.get('PIPELINE');

      expect(pipelineResult).toBeDefined();
      expect(pipelineResult.opsPerSecond).toBeGreaterThan(0);
      expect(pipelineResult.averageLatency).toBeGreaterThan(0);
      expect(mockRedis.pipeline).toHaveBeenCalled();
    }});

  describe('Parallel Operations', () => {;
    it('should run parallel benchmark', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.set = jest.fn().mockResolvedValue('OK');
      MockRedis.mockImplementation(() => mockRedis);

      const results = await benchmark.runParallelBenchmark(mockConfig);
      const parallelResult = results.get('PARALLEL');

      expect(parallelResult).toBeDefined();
      expect(parallelResult.opsPerSecond).toBeGreaterThan(0);
      expect(parallelResult.averageLatency).toBeGreaterThan(0);

      expect(MockRedis).toHaveBeenCalledTimes(mockConfig.parallel + 1); // +1 for the main instance
    });

    it('should handle parallel operation errors', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.set = jest.fn().mockRejectedValue(new Error('Connection error'));
      MockRedis.mockImplementation(() => mockRedis);

      await expect(benchmark.runParallelBenchmark(mockConfig)).rejects.toThrow('Connection error');
      expect(logger.error).toHaveBeenCalled();
    });

  describe('Cleanup', () => {
    it('should clean up Redis data after benchmark', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.flushdb = jest.fn().mockResolvedValue('OK');
      MockRedis.mockImplementation(() => mockRedis);

      await benchmark.cleanupRedis();
      expect(mockRedis.flushdb).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Benchmark data cleaned up');
    });

    it('should handle cleanup errors', async () => {
      const mockRedis = new MockRedis() as jest.Mocked<Redis>;
      mockRedis.flushdb = jest.fn().mockRejectedValue(new Error('Cleanup error'));
      MockRedis.mockImplementation(() => mockRedis);

      await benchmark.cleanupRedis();
      expect(logger.error).toHaveBeenCalledWith(
        'Error during benchmark cleanup:',
        expect.any(Error)
      );
    });
  });

  describe('Results Formatting', () => {
    it('should format benchmark results correctly', () => {
      const mockResults = new Map();
      mockResults.set('GET', {
        opsPerSecond: 10000,
        averageLatency: 1.5,
        p50Latency: 1.2,
        p95Latency: 2.3,
        p99Latency: 3.5
      });
      mockResults.set('SET', {
        opsPerSecond: 8000,
        averageLatency: 2.0,
        p50Latency: 1.8,
        p95Latency: 3.0,
        p99Latency: 4.5
      });

      const formatted = benchmark.formatResults(mockResults);
      expect(formatted).toContain('Benchmark Results');
      expect(formatted).toContain('GET');
      expect(formatted).toContain('SET');
      expect(formatted).toContain('10000 ops/sec');
      expect(formatted).toContain('8000 ops/sec');
    });

    it('should print results to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResults = new Map();
      mockResults.set('GET', {
        opsPerSecond: 10000,
        averageLatency: 1.5
      });

      benchmark.printResults(mockResults);
      expect(consoleSpy).toHaveBeenCalledWith('Benchmark Results');
      expect(consoleSpy).toHaveBeenCalledWith('========================\n');
      consoleSpy.mockRestore();
    });
  });
});
