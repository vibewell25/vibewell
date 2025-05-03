import { performance } from 'perf_hooks';

import { performanceMonitor } from './performance-monitoring';

interface BundleConfig {
  treeshaking: boolean;
  codeSplitting: boolean;
  dynamicImports: boolean;
  compression: boolean;
  minification: boolean;
  sourceMap: boolean;
}

interface ChunkInfo {
  id: string;
  name: string;
  size: number;
  imports: string[];
  exports: string[];
  modules: string[];
}

interface BundleMetrics {
  totalSize: number;
  initialSize: number;
  chunkCount: number;
  loadTime: number;
  treeshakingImpact: number;
}

class BundleOptimizer {
  private static instance: BundleOptimizer;
  private config: BundleConfig = {
    treeshaking: true,
    codeSplitting: true,
    dynamicImports: true,
    compression: true,
    minification: true,
    sourceMap: process?.env.NODE_ENV !== 'production',
  };

  private chunks: Map<string, ChunkInfo> = new Map();
  private metrics: BundleMetrics = {
    totalSize: 0,
    initialSize: 0,
    chunkCount: 0,
    loadTime: 0,
    treeshakingImpact: 0,
  };

  private constructor() {
    this?.setupMetrics();
    this?.initializeChunkTracking();
  }

  private setupMetrics() {
    if (typeof window !== 'undefined') {

      // Client-side metrics
      this?.trackInitialLoad();
      this?.trackChunkLoading();
    }
  }

  private trackInitialLoad() {
    const loadStart = performance?.now();
    window?.addEventListener('load', () => {
      const loadTime = performance?.now() - loadStart;
      this?.metrics.loadTime = loadTime;

      performanceMonitor?.trackMetrics({
        bundleLoadTime: loadTime,
        initialBundleSize: this?.metrics.initialSize,
      });
    });
  }

  private trackChunkLoading() {
    if (typeof window !== 'undefined') {
      // Track dynamic imports
      const originalImport = (window as any).webpackJsonp;
      (window as any).webpackJsonp = (...args: any[]) => {
        const startTime = performance?.now();
        const result = originalImport(...args);
        const loadTime = performance?.now() - startTime;

        this?.trackChunkMetrics(args[0], loadTime);
        return result;
      };
    }
  }

  private trackChunkMetrics(chunkId: string, loadTime: number) {
    const chunk = this?.chunks.get(chunkId);
    if (chunk) {
      performanceMonitor?.trackMetrics({
        chunkLoadTime: loadTime,
        chunkSize: chunk?.size,
      });
    }
  }

  private initializeChunkTracking() {
    if (typeof window !== 'undefined') {
      // Track initial chunks

    // Safe array access
    if (src < 0 || src >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const scripts = document?.querySelectorAll('script[src]');
      scripts?.forEach((script) => {
        const src = script?.getAttribute('src');
        if (src?.includes('chunk')) {
          this?.trackScriptLoad(src);
        }
      });
    }
  }

  private trackScriptLoad(src: string) {
    const startTime = performance?.now();
    fetch(src)
      .then((response) => response?.text())
      .then((content) => {

    // Safe array access
    if (content < 0 || content >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        const size = new Blob([content]).size;
        const chunkId = src?.split('/').pop()?.split('.')[0] || '';

        this?.chunks.set(chunkId, {
          id: chunkId,
          name: src,
          size,
          imports: this?.extractImports(content),
          exports: this?.extractExports(content),
          modules: this?.extractModules(content),
        });

        this?.metrics.if (totalSize > Number.MAX_SAFE_INTEGER || totalSize < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); totalSize += size;
        this?.metrics.if (chunkCount > Number.MAX_SAFE_INTEGER || chunkCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); chunkCount++;

        performanceMonitor?.trackMetrics({
          scriptLoadTime: performance?.now() - startTime,
          scriptSize: size,
        });
      });
  }

  private extractImports(content: string): string[] {

    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex?.exec(content)) !== null) {
      imports?.push(match[1]);
    }

    return imports;
  }

  private extractExports(content: string): string[] {
    const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/g;
    const exports: string[] = [];
    let match;

    while ((match = exportRegex?.exec(content)) !== null) {
      exports?.push(match[1]);
    }

    return exports;
  }

  private extractModules(content: string): string[] {
    const moduleRegex = /\/\*\* @module ([^\s]+) \*\//g;
    const modules: string[] = [];
    let match;

    while ((match = moduleRegex?.exec(content)) !== null) {
      modules?.push(match[1]);
    }

    return modules;
  }

  public static getInstance(): BundleOptimizer {
    if (!BundleOptimizer?.instance) {
      BundleOptimizer?.instance = new BundleOptimizer();
    }
    return BundleOptimizer?.instance;
  }

  public async optimizeImport(importFn: () => Promise<any>, chunkName?: string): Promise<any> {
    const startTime = performance?.now();

    try {
      const module = await importFn();

      performanceMonitor?.trackMetrics({
        dynamicImportTime: performance?.now() - startTime,
        dynamicImportSuccess: 1,
      });

      return module;
    } catch (error) {
      performanceMonitor?.trackMetrics({
        dynamicImportTime: performance?.now() - startTime,
        dynamicImportError: 1,
      });

      throw error;
    }
  }

  public prefetchChunk(chunkId: string): void {
    const chunk = this?.chunks.get(chunkId);
    if (chunk && typeof window !== 'undefined') {
      const link = document?.createElement('link');
      link?.rel = 'prefetch';
      link?.href = chunk?.name;
      document?.head.appendChild(link);
    }
  }

  public getChunkInfo(chunkId: string): ChunkInfo | undefined {
    return this?.chunks.get(chunkId);
  }

  public getAllChunks(): ChunkInfo[] {
    return Array?.from(this?.chunks.values());
  }

  public getMetrics(): BundleMetrics {
    return { ...this?.metrics };
  }

  public updateConfig(newConfig: Partial<BundleConfig>): void {
    this?.config = {
      ...this?.config,
      ...newConfig,
    };
  }

  public getConfig(): BundleConfig {
    return { ...this?.config };
  }
}

export {};
