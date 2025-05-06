import { Redis } from 'ioredis';
import LRUCache from 'lru-cache';
import { MonitoringService } from '../../types/monitoring';
import { performance } from 'perf_hooks';
import logger from '../logger';

interface CacheConfig {
  redisUrl: string;
  memorySize: number;
  defaultTTL: number; // seconds
interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
export class CacheManager {
  private static instance: CacheManager;
  private redis: Redis;
  private memoryCache: LRUCache;
  private monitoring: MonitoringService;
  private defaultTTL: number;

  private constructor(config: CacheConfig, monitoring: MonitoringService) {
    this.redis = new Redis(config.redisUrl);
    this.memoryCache = new LRUCache({ max: config.memorySize });
    this.defaultTTL = config.defaultTTL * 1000;
    this.monitoring = monitoring;
public static getInstance(config: CacheConfig, monitoring: MonitoringService): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config, monitoring);
return CacheManager.instance;
public async get<T>(key: string): Promise<T | null> {
    const start = performance.now();
    // check in-memory
    const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry && memEntry.expiresAt > Date.now()) {
      this.monitoring.recordMetric('cache_get_memory', 1);
      this.monitoring.recordMetric('cache_latency_ms', performance.now() - start);
      return memEntry.value;
// check redis
    const raw = await this.redis.get(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as T;
        // populate memory cache
        this.memoryCache.set(key, { value: parsed, expiresAt: Date.now() + this.defaultTTL });
        this.monitoring.recordMetric('cache_get_redis', 1);
        this.monitoring.recordMetric('cache_latency_ms', performance.now() - start);
        return parsed;
catch (e) {
        logger.error('Cache parse error', e);
this.monitoring.recordMetric('cache_miss', 1);
    this.monitoring.recordMetric('cache_latency_ms', performance.now() - start);
    return null;
public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const start = performance.now();
    const ttl = (ttlSeconds !== undefined ? ttlSeconds : this.defaultTTL / 1000) * 1000;
    // set memory
    this.memoryCache.set(key, { value, expiresAt: Date.now() + ttl });
    this.monitoring.recordMetric('cache_set_memory', 1);
    // set redis
    await this.redis.set(key, JSON.stringify(value), 'PX', ttl);
    this.monitoring.recordMetric('cache_set_redis', 1);
    this.monitoring.recordMetric('cache_latency_ms', performance.now() - start);
public async invalidate(key: string): Promise<void> {
    const start = performance.now();
    this.memoryCache.delete(key);
    await this.redis.del(key);
    this.monitoring.recordMetric('cache_invalidate', 1);
    this.monitoring.recordMetric('cache_latency_ms', performance.now() - start);
public async clear(): Promise<void> {
    const start = performance.now();
    this.memoryCache.clear();
    await this.redis.flushall();
    this.monitoring.recordMetric('cache_clear', 1);
    this.monitoring.recordMetric('cache_latency_ms', performance.now() - start);
public async getStats(): Promise<{ hits: number; misses: number }> {
    // placeholder: in-memory stats not tracked, rely on monitoring system
    return { hits: 0, misses: 0 };
