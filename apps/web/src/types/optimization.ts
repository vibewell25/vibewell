export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  ttl: number;
  invalidateOnMutation: boolean;
  strategy: 'lru' | 'fifo' | 'lfu';
  key?: string | ((args: unknown[]) => string);
  duration?: number;
export interface PrefetchConfig {
  enabled: boolean;
  interval: number;
export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxRequests?: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
export interface CompressionConfig {
  enabled: boolean;
  level: number;
  threshold: number;
  filter?: (req: unknown, res: unknown) => boolean;
  encodings: ('gzip' | 'deflate' | 'br')[];
export interface MinificationConfig {
  enabled: boolean;
  html: boolean;
  css: boolean;
  js: boolean;
  removeComments: boolean;
  collapseWhitespace: boolean;
export interface ImageOptimizationConfig {
  enabled: boolean;
  quality: number;
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  progressive: boolean;
  metadata: boolean;
export interface LoadBalancingConfig {
  enabled: boolean;



  strategy: 'round-robin' | 'least-connections' | 'ip-hash';
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
    unhealthyThreshold: number;
    healthyThreshold: number;
export interface BatchRequestsConfig {
  enabled: boolean;
  maxBatchSize: number;
  batchDelay: number;
  endpoint?: string;
  headers?: Record<string, string>;
export interface OptimizationOptions {
  caching: CacheConfig;
  prefetch: PrefetchConfig;
  rateLimit: RateLimitConfig;
  compression: CompressionConfig;
  minification: MinificationConfig;
  imageOptimization: ImageOptimizationConfig;
  loadBalancing: LoadBalancingConfig;
  batchRequests?: BatchRequestsConfig;
export interface OptimizationStats {
  cacheHits: number;
  cacheMisses: number;
  compressionRatio: number;
  averageResponseTime: number;
  requestsServed: number;
  bytesTransferred: number;
  errorRate: number;
export interface OptimizationMetrics {
  timestamp: number;
  stats: OptimizationStats;
  resourceUtilization: {
    cpu: number;
    memory: number;
    bandwidth: number;
