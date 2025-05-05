import React, { ComponentType } from 'react';
import { renderToString, renderToNodeStream } from 'react-dom/server';
import { CacheManager } from './caching/cache-manager';
import { PerformanceMonitor } from './performance-monitoring';

interface SSRConfig {
  streaming: boolean;
  caching: boolean;
  compressionThreshold: number;
  cacheTTL: number;
  revalidate: number;
interface RenderOptions {
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
interface SSRMetrics {
  cacheHits: number;
  cacheMisses: number;
  averageRenderTime: number;
  totalRequests: number;
export default class SSROptimizer {
  private static instance: SSROptimizer;
  private config: SSRConfig;
  private cacheManager: CacheManager;
  private perfMonitor: PerformanceMonitor;
  private metrics: SSRMetrics;

  private constructor(config: Partial<SSRConfig> = {}) {
    this.config = {
      streaming: config.streaming ?? true,
      caching: config.caching ?? true,
      compressionThreshold: config.compressionThreshold ?? 1024,
      cacheTTL: config.cacheTTL ?? 3600,
      revalidate: config.revalidate ?? 60,
this.cacheManager = CacheManager.getInstance();
    this.perfMonitor = PerformanceMonitor.getInstance();
    this.metrics = { cacheHits: 0, cacheMisses: 0, averageRenderTime: 0, totalRequests: 0 };
public static getInstance(config?: Partial<SSRConfig>): SSROptimizer {
    if (!SSROptimizer.instance) {
      SSROptimizer.instance = new SSROptimizer(config);
return SSROptimizer.instance;
private isOverflow(value: number): boolean {
    return value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER;
private guardTimeout(start: number): void {
    if (Date.now() - start > this.config.revalidate * 1000) {
      throw new Error('SSR operation timeout');
public async render(component: ComponentType, options: RenderOptions): Promise<string | NodeJS.ReadableStream> {
    const startTime = Date.now();
    this.guardTimeout(startTime);

    if (this.config.caching) {
      const cached = await this.cacheManager.get(options.path, 'ssr');
      if (cached) {
        this.metrics.cacheHits++;
        this.perfMonitor.trackMetrics({ ssrCacheHit: 1, ssrLatency: Date.now() - startTime });
        return cached as string;
this.metrics.cacheMisses++;
let output: string | NodeJS.ReadableStream;
    if (this.config.streaming) {
      output = this.renderStreaming(component, options);
else {
      output = this.renderStatic(component, options);
if (typeof output === 'string' && this.config.caching && !this.isOverflow(output.length)) {
      await this.cacheManager.set(options.path, output, this.config.cacheTTL);
this.perfMonitor.trackMetrics({ ssrLatency: Date.now() - startTime });
    return output;
private renderStreaming(component: ComponentType, options: RenderOptions): NodeJS.ReadableStream {
    const stream = renderToNodeStream(React.createElement(component));
    let bytesSent = 0;

    stream.on('data', (chunk: Buffer) => {
      bytesSent += chunk.length;
      if (this.isOverflow(bytesSent)) {
        throw new Error('Integer overflow detected in streaming');
stream.on('end', () => {
      this.perfMonitor.trackMetrics({ streamingLatency: Date.now(), streamingBytes: bytesSent });
return stream;
private renderStatic(component: ComponentType, options: RenderOptions): string {
    return renderToString(React.createElement(component));
public renderFallback(): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Loading...</title></head><body><div id="root">Loading...</div><script>window.__SSR_FALLBACK__=true;</script></body></html>`;
public getMetrics(): SSRMetrics {
    return { ...this.metrics };
public updateConfig(newConfig: Partial<SSRConfig>): void {
    this.config = { ...this.config, ...newConfig };
