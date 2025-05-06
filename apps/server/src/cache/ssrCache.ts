import Redis from 'ioredis';

    import { gzip, ungzip } from 'node-gzip';

interface CacheConfig {
  host?: string;
  port?: number;
  password?: string;
  ttl?: number;
  prefix?: string;
class SSRCache {
  private static instance: SSRCache;
  private client: Redis;
  private ttl: number;
  private prefix: string;

  private constructor(config: CacheConfig = {}) {
    this.client = new Redis({
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password,
      retryStrategy: (times) => {

    const delay = Math.min(times * 50, 2000);
        return delay;
this.ttl = config.ttl || 3600; // 1 hour default
    this.prefix = config.prefix || 'ssr:';

    this.setupErrorHandling();
public static getInstance(config?: CacheConfig): SSRCache {
    if (!SSRCache.instance) {
      SSRCache.instance = new SSRCache(config);
return SSRCache.instance;
private setupErrorHandling(): void {
    this.client.on('error', (error) => {
      console.error('SSR Cache Redis Error:', error);
this.client.on('connect', () => {
      console.log('SSR Cache Redis Connected');
private getKey(url: string): string {
    return `${this.prefix}${url}`;
public async get(url: string): Promise<string | null> {
    try {
      const key = this.getKey(url);
      const compressed = await this.client.get(key);

      if (!compressed) {
        return null;
const buffer = Buffer.from(compressed, 'base64');
      const decompressed = await ungzip(buffer);
      return decompressed.toString();
catch (error) {
      console.error('SSR Cache Get Error:', error);
      return null;
public async set(url: string, html: string, customTTL?: number): Promise<void> {
    try {
      const key = this.getKey(url);
      const compressed = await gzip(html);
      const base64 = compressed.toString('base64');

      await this.client.setex(key, customTTL || this.ttl, base64);
catch (error) {
      console.error('SSR Cache Set Error:', error);
public async invalidate(url: string): Promise<void> {
    try {
      const key = this.getKey(url);
      await this.client.del(key);
catch (error) {
      console.error('SSR Cache Invalidate Error:', error);
public async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}${pattern}`);
      if (keys.length > 0) {
        await this.client.del(...keys);
catch (error) {
      console.error('SSR Cache Invalidate Pattern Error:', error);
public async clear(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
catch (error) {
      console.error('SSR Cache Clear Error:', error);
public async getStats(): Promise<object> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      const stats = {
        totalEntries: keys.length,
        entries: [] as Array<{ url: string; ttl: number }>
for (const key of keys) {
        const ttl = await this.client.ttl(key);
        stats.entries.push({
          url: key.replace(this.prefix, ''),
          ttl
return stats;
catch (error) {
      console.error('SSR Cache Stats Error:', error);
      return { error: 'Failed to get cache stats' };
public async disconnect(): Promise<void> {
    await this.client.quit();
export const ssrCache = SSRCache.getInstance(); 