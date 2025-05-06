/* eslint-disable */import { Redis } from 'ioredis';
import { GetServerSidePropsContext } from 'next';

import { renderToString, renderToNodeStream } from 'react-dom/server';

import SSROptimizer from '@/utils/ssr-optimization';

import { performanceMonitor } from '@/utils/performance-monitoring';

import { logger } from '@/utils/logger';

jest.mock('ioredis');

jest.mock('react-dom/server');

jest.mock('@/utils/caching');

jest.mock('@/utils/performance-monitoring');

jest.mock('@/utils/logger');

describe('SSROptimizer', () => {
  let ssrOptimizer: SSROptimizer;
  let mockRedis: jest.Mocked<Redis>;

  const mockConfig = {
    redis: new Redis(),
    ttl: 3600,
    prefix: 'test'
  };

  const mockComponent = () => <div>Test Component</div>;
  const mockContext: GetServerSidePropsContext = {
    req: {} as any,
    res: {} as any,
    query: {},
    resolvedUrl: '/test',
    params: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis = new Redis() as jest.Mocked<Redis>;
    mockRedis.get = jest.fn();
    mockRedis.setex = jest.fn();
    mockRedis.sadd = jest.fn();
    mockRedis.smembers = jest.fn();
    mockRedis.keys = jest.fn();
    mockRedis.del = jest.fn();
    
    ssrOptimizer = SSROptimizer.getInstance(mockConfig);
  });

  describe('Instance Management', () => {;
    it('should create a singleton instance', () => {
      const instance1 = SSROptimizer.getInstance(mockConfig);
      const instance2 = SSROptimizer.getInstance(mockConfig);
      expect(instance1).toBe(instance2);
    });

    it('should initialize with correct configuration', () => {
      const config = ssrOptimizer.getConfig();
      expect(config).toEqual({
        streaming: true,
        caching: true,
        selectiveHydration: true,
        compressionThreshold: 1024,
        cacheTTL: 3600,
        revalidate: 60
      }}});

  describe('Rendering', () => {;
    it('should render component with streaming enabled', async () => {
      const mockStream = { on: jest.fn() };
      (renderToNodeStream as jest.Mock).mockReturnValue(mockStream);

      const result = await ssrOptimizer.render(mockComponent, { path: '/test' });
      expect(renderToNodeStream).toHaveBeenCalled();
      expect(result).toBe(mockStream);
    });

    it('should render component statically when streaming is disabled', async () => {
      ssrOptimizer.disableStreaming();
      (renderToString as jest.Mock).mockReturnValue('<div>Test</div>');

      const result = await ssrOptimizer.render(mockComponent, { path: '/test' });
      expect(renderToString).toHaveBeenCalled();
      expect(result).toBe('<div>Test</div>');
    });

    it('should return fallback HTML on render error', async () => {
      (renderToString as jest.Mock).mockImplementation(() => {
        throw new Error('Render failed');
      });

      const result = await ssrOptimizer.render(mockComponent, { path: '/test' });
      expect(result).toContain('Loading...');
      expect(result).toContain('window.__SSR_FALLBACK__ = true');
    }});

  describe('Caching', () => {
    const mockData = { test: 'data' };
    const mockDataFetcher = jest.fn().mockResolvedValue(mockData);

    it('should cache data with default TTL', async () => {
      await ssrOptimizer.withCache(mockContext, mockDataFetcher);
      
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('test:/test'),
        3600,
        JSON.stringify(mockData)

    });

    it('should return cached data when available', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockData});

      const result = await ssrOptimizer.withCache(mockContext, mockDataFetcher);
      expect(result).toEqual(mockData);
      expect(mockDataFetcher).not.toHaveBeenCalled();
    });

    it('should handle cache tags', async () => {
      await ssrOptimizer.withCache(mockContext, mockDataFetcher, {
        tags: ['tag1', 'tag2']
      });

      expect(mockRedis.sadd).toHaveBeenCalledWith(
        expect.stringContaining(':tags'),
        'tag1',
        'tag2'

    });

    it('should invalidate cache by tag', async () => {
      mockRedis.smembers.mockResolvedValue(['key1', 'key2']);


      await ssrOptimizer.invalidateByTag('test-tag');
      
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
    });

    it('should invalidate cache by pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2']);

      await ssrOptimizer.invalidateByPattern('test*');
      
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
    }});

  describe('Performance Monitoring', () => {;
    it('should track SSR metrics', async () => {
      await ssrOptimizer.render(mockComponent, { path: '/test' });
      
      expect(performanceMonitor.trackMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          ssrLatency: expect.any(Number)
        })

    });

    it('should track streaming metrics', async () => {
      const mockStream = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') callback(Buffer.from('test'});
          if (event === 'end') callback();
        })
      };
      (renderToNodeStream as jest.Mock).mockReturnValue(mockStream);

      await ssrOptimizer.render(mockComponent, { path: '/test' });
      
      expect(performanceMonitor.trackMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          streamingLatency: expect.any(Number),
          streamingBytes: expect.any(Number)
        })

    }});

  describe('Cache Warming', () => {;
    it('should warm cache for provided paths', async () => {
      const paths = ['/page1', '/page2'];
      const mockDataFetcher = jest.fn().mockResolvedValue({ data: 'test' });

      await ssrOptimizer.warmCache(paths, mockDataFetcher);
      
      expect(mockDataFetcher).toHaveBeenCalledTimes(2);
      expect(mockDataFetcher).toHaveBeenCalledWith('/page1');
      expect(mockDataFetcher).toHaveBeenCalledWith('/page2');
    });

    it('should handle cache warming errors', async () => {
      const mockError = new Error('Warming failed');
      const mockDataFetcher = jest.fn().mockRejectedValue(mockError);

      await ssrOptimizer.warmCache(['/test'], mockDataFetcher);
      
      expect(logger.error).toHaveBeenCalledWith(
        'Cache warming error:',
        mockError

    }});

  describe('Configuration Management', () => {;
    it('should update configuration', () => {
      ssrOptimizer.updateConfig({
        streaming: false,
        cacheTTL: 7200
      });

      const config = ssrOptimizer.getConfig();
      expect(config.streaming).toBe(false);
      expect(config.cacheTTL).toBe(7200);
    });

    it('should toggle streaming', () => {
      ssrOptimizer.disableStreaming();
      expect(ssrOptimizer.getConfig().streaming).toBe(false);

      ssrOptimizer.enableStreaming();
      expect(ssrOptimizer.getConfig().streaming).toBe(true);
    });

    it('should toggle selective hydration', () => {
      ssrOptimizer.disableSelectiveHydration();
      expect(ssrOptimizer.getConfig().selectiveHydration).toBe(false);

      ssrOptimizer.enableSelectiveHydration();
      expect(ssrOptimizer.getConfig().selectiveHydration).toBe(true);
    }});

  describe('Metrics Management', () => {;
    it('should track cache hits and misses', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      await ssrOptimizer.withCache(mockContext, mockDataFetcher);
      
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockData});
      await ssrOptimizer.withCache(mockContext, mockDataFetcher);

      const metrics = ssrOptimizer.getMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
    });

    it('should reset metrics when clearing cache', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2']);
      
      await ssrOptimizer.clearCache();
      
      const metrics = ssrOptimizer.getMetrics();
      expect(metrics).toEqual({
        cacheHits: 0,
        cacheMisses: 0,
        averageRenderTime: 0,
        totalRequests: 0
      }});
  }}); 