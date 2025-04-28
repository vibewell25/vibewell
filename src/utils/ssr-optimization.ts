import { renderToString, renderToNodeStream } from 'react-dom/server';
import { cacheManager } from './caching';
import { performanceMonitor } from './performance-monitoring';
import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { cache } from 'react';
import { Redis } from 'ioredis';
import { logger } from './logger';

interface SSRConfig {
  streaming: boolean;
  caching: boolean;
  selectiveHydration: boolean;
  compressionThreshold: number;
  cacheTTL: number;
  revalidate: number;
}

interface RenderOptions {
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

interface SSRCacheConfig {
  redis: Redis;
  ttl: number;
  prefix: string;
}

interface SSRCacheOptions {
  key?: string | ((ctx: GetServerSidePropsContext) => string);
  ttl?: number;
  tags?: string[];
}

interface SSRMetrics {
  cacheHits: number;
  cacheMisses: number;
  averageRenderTime: number;
  totalRequests: number;
}

class SSROptimizer {
  private static instance: SSROptimizer;
  private config: SSRConfig = {
    streaming: true,
    caching: true,
    selectiveHydration: true,
    compressionThreshold: 1024, // 1KB
    cacheTTL: 3600, // 1 hour
    revalidate: 60, // 1 minute
  };
  private redis: Redis;
  private defaultTTL: number;
  private cachePrefix: string;
  private metrics: SSRMetrics;

  private constructor(config: SSRCacheConfig) {
    this.redis = config.redis;
    this.defaultTTL = config.ttl;
    this.cachePrefix = config.prefix;
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      averageRenderTime: 0,
      totalRequests: 0,
    };
    this.setupMetrics();
  }

  private setupMetrics() {
    if (typeof window === 'undefined') {
      // Server-side metrics
      performanceMonitor.trackMetrics({
        ssrLatency: 0,
        cacheHitRate: 0,
        streamingLatency: 0,
        hydrationTime: 0,
      });
    }
  }

  public static getInstance(config: SSRCacheConfig): SSROptimizer {
    if (!SSROptimizer.instance) {
      SSROptimizer.instance = new SSROptimizer(config);
    }
    return SSROptimizer.instance;
  }

  private getCacheKey(options: RenderOptions): string {
    const { path, query, headers } = options;
    const key = `ssr:${path}`;

    if (query) {
      return `${key}:${JSON.stringify(query)}`;
    }

    if (headers?.['accept-language']) {
      return `${key}:${headers['accept-language']}`;
    }

    return key;
  }

  private shouldCache(html: string): boolean {
    return this.config.caching && html.length > this.config.compressionThreshold;
  }

  private async cacheRender(key: string, html: string): Promise<void> {
    if (this.shouldCache(html)) {
      await cacheManager.set(key, html, this.config.cacheTTL);
    }
  }

  public async render(
    component: React.ComponentType,
    options: RenderOptions,
  ): Promise<string | NodeJS.ReadableStream> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(options);

    try {
      // Check cache first
      if (this.config.caching) {
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          performanceMonitor.trackMetrics({
            ssrCacheHit: 1,
            ssrLatency: performance.now() - startTime,
          });
          return cached;
        }
      }

      // Render based on configuration
      if (this.config.streaming) {
        return this.renderStreaming(component, options);
      } else {
        return this.renderStatic(component, options);
      }
    } catch (error) {
      console.error('SSR Error:', error);
      // Fallback to client-side rendering
      return this.renderFallback();
    }
  }

  private async renderStreaming(
    component: React.ComponentType,
    options: RenderOptions,
  ): Promise<NodeJS.ReadableStream> {
    const stream = renderToNodeStream(React.createElement(component));

    // Track streaming metrics
    let bytesSent = 0;
    stream.on('data', (chunk) => {
      bytesSent += chunk.length;
    });

    stream.on('end', () => {
      performanceMonitor.trackMetrics({
        streamingLatency: performance.now(),
        streamingBytes: bytesSent,
      });
    });

    return stream;
  }

  private async renderStatic(
    component: React.ComponentType,
    options: RenderOptions,
  ): Promise<string> {
    const startTime = performance.now();
    const html = renderToString(React.createElement(component));

    // Cache the result if needed
    if (this.shouldCache(html)) {
      await this.cacheRender(this.getCacheKey(options), html);
    }

    performanceMonitor.trackMetrics({
      ssrLatency: performance.now() - startTime,
      ssrCacheHit: 0,
    });

    return html;
  }

  private renderFallback(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Loading...</title>
        </head>
        <body>
          <div id="root">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
              Loading...
            </div>
          </div>
          <script>
            window.__SSR_FALLBACK__ = true;
          </script>
        </body>
      </html>
    `;
  }

  public updateConfig(newConfig: Partial<SSRConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  public getConfig(): SSRConfig {
    return { ...this.config };
  }

  public enableStreaming(): void {
    this.config.streaming = true;
  }

  public disableStreaming(): void {
    this.config.streaming = false;
  }

  public enableSelectiveHydration(): void {
    this.config.selectiveHydration = true;
  }

  public disableSelectiveHydration(): void {
    this.config.selectiveHydration = false;
  }

  public setCacheTTL(seconds: number): void {
    this.config.cacheTTL = seconds;
  }

  public setRevalidationInterval(seconds: number): void {
    this.config.revalidate = seconds;
  }

  private generateCacheKey(ctx: GetServerSidePropsContext, options?: SSRCacheOptions): string {
    if (options?.key) {
      const key = typeof options.key === 'function' ? options.key(ctx) : options.key;
      return `${this.cachePrefix}:${key}`;
    }

    const { query, resolvedUrl } = ctx;
    const queryString = Object.entries(query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `${this.cachePrefix}:${resolvedUrl}${queryString ? `?${queryString}` : ''}`;
  }

  public withCache = cache(
    async <T extends object>(
      ctx: GetServerSidePropsContext,
      dataFetcher: () => Promise<T>,
      options?: SSRCacheOptions,
    ): Promise<T> => {
      const startTime = Date.now();
      const cacheKey = this.generateCacheKey(ctx, options);

      try {
        // Try to get from cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          this.metrics.totalRequests++;
          return JSON.parse(cached);
        }

        // Cache miss, fetch data
        this.metrics.cacheMisses++;
        this.metrics.totalRequests++;
        const data = await dataFetcher();

        // Store in cache
        const ttl = options?.ttl || this.defaultTTL;
        await this.redis.setex(cacheKey, ttl, JSON.stringify(data));

        // Store cache tags if provided
        if (options?.tags?.length) {
          await this.redis.sadd(`${cacheKey}:tags`, ...options.tags);
        }

        // Update metrics
        const renderTime = Date.now() - startTime;
        this.updateMetrics(renderTime);

        return data;
      } catch (error) {
        logger.error('SSR Cache error:', error);
        return await dataFetcher();
      }
    },
  );

  private updateMetrics(renderTime: number): void {
    const { totalRequests, averageRenderTime } = this.metrics;
    this.metrics.averageRenderTime =
      (averageRenderTime * totalRequests + renderTime) / (totalRequests + 1);
  }

  public async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await this.redis.smembers(`${this.cachePrefix}:tags:${tag}`);
      if (keys.length) {
        await Promise.all([
          this.redis.del(...keys),
          this.redis.del(`${this.cachePrefix}:tags:${tag}`),
        ]);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  public async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.cachePrefix}:${pattern}`);
      if (keys.length) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  public getMetrics(): SSRMetrics {
    return { ...this.metrics };
  }

  public async warmCache<T extends object>(
    paths: string[],
    dataFetcher: (path: string) => Promise<T>,
    options?: SSRCacheOptions,
  ): Promise<void> {
    try {
      await Promise.all(
        paths.map(async (path) => {
          const ctx = this.createMockContext(path);
          await this.withCache(ctx, () => dataFetcher(path), options);
        }),
      );
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
  }

  private createMockContext(path: string): GetServerSidePropsContext {
    const [pathname, search] = path.split('?');
    const query: ParsedUrlQuery = {};

    if (search) {
      search.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        query[key] = value;
      });
    }

    return {
      req: {} as any,
      res: {} as any,
      query,
      resolvedUrl: path,
      params: {},
    };
  }

  public async clearCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.cachePrefix}:*`);
      if (keys.length) {
        await this.redis.del(...keys);
      }
      this.resetMetrics();
    } catch (error) {
      logger.error('Cache clearing error:', error);
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      averageRenderTime: 0,
      totalRequests: 0,
    };
  }
}

export default SSROptimizer;
