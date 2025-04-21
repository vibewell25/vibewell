import { renderToString, renderToNodeStream } from 'react-dom/server';
import { cacheManager } from './caching';
import { performanceMonitor } from './performance-monitoring';

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

  private constructor() {
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

  public static getInstance(): SSROptimizer {
    if (!SSROptimizer.instance) {
      SSROptimizer.instance = new SSROptimizer();
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
    return (
      this.config.caching &&
      html.length > this.config.compressionThreshold
    );
  }

  private async cacheRender(key: string, html: string): Promise<void> {
    if (this.shouldCache(html)) {
      await cacheManager.set(key, html, this.config.cacheTTL);
    }
  }

  public async render(
    component: React.ComponentType,
    options: RenderOptions
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
    options: RenderOptions
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
    options: RenderOptions
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
}

export const ssrOptimizer = SSROptimizer.getInstance(); 