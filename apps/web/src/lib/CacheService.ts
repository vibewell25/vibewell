import { getOptimizedRedisClient } from './redis/OptimizedRedisClient';
import { logger } from './logger';

// TTL constants in seconds
export const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  STANDARD: 3600, // 1 hour
  LONG: 86400, // 1 day
  EXTENDED: 604800, // 1 week
  PERSISTENT: 2592000, // 30 days
// Cache key prefixes for different data types
export const PREFIX = {
  USER: 'user:',
  PRODUCT: 'product:',
  SERVICE: 'service:',
  BOOKING: 'booking:',
  API: 'api:',
  PAGE: 'page:',
  SESSION: 'session:',
  RATE_LIMIT: 'rate:',
  AR_MODEL: 'ar:model:',
  AR_TEXTURE: 'ar:texture:',
  AI_MODEL: 'ai:model:',
  TEMP: 'temp:',
// Type definitions
type CacheValue = string | number | boolean | object | null | undefined;

// Memory cache fallback (use only when Redis is unavailable)
class MemoryCache {
  private cache: Map<string, { value: string; expires?: number }> = new Map();
  
  set(key: string, value: string, ttl?: number): void {
    const expires = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expires });
    
    // Clean up expired items periodically
    if (this.cache.size > 100) {
      this.cleanup();
get(key: string): string | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
return item.value;
del(key: string): void {
    this.cache.delete(key);
cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires && item.expires < now) {
        this.cache.delete(key);
flush(): void {
    this.cache.clear();
// Singleton memory cache instance
const memoryCache = new MemoryCache();

/**
 * Cache Service for handling different types of cached data
 */
export class CacheService {
  private redisEnabled: boolean;
  
  constructor() {
    this.redisEnabled = !!process.env.REDIS_URL;
/**
   * Set a value in cache with appropriate TTL
   */
  public async set(key: string, value: CacheValue, ttl: number = TTL.STANDARD): Promise<void> {
    try {
      // Serialize value
      const serialized = this.serialize(value);
      
      if (this.redisEnabled) {
        const redis = getOptimizedRedisClient();
        await redis.set(key, serialized, { ex: ttl });
else {
        // Fallback to memory cache
        memoryCache.set(key, serialized, ttl);
catch (error) {
      logger.error('Cache set error:', error);
      // Fallback to memory cache on Redis error
      const serialized = this.serialize(value);
      memoryCache.set(key, serialized, ttl);
/**
   * Get a value from cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    try {
      let serialized: string | null = null;
      
      if (this.redisEnabled) {
        const redis = getOptimizedRedisClient();
        serialized = await redis.get(key);
else {
        // Fallback to memory cache
        serialized = memoryCache.get(key);
if (!serialized) return null;
      
      // Deserialize value
      return this.deserialize<T>(serialized);
catch (error) {
      logger.error('Cache get error:', error);
      
      // Try memory cache as fallback
      const serialized = memoryCache.get(key);
      if (!serialized) return null;
      
      return this.deserialize<T>(serialized);
/**
   * Delete a value from cache
   */
  public async del(key: string): Promise<void> {
    try {
      if (this.redisEnabled) {
        const redis = getOptimizedRedisClient();
        await redis.del(key);
// Always clean memory cache as well
      memoryCache.del(key);
catch (error) {
      logger.error('Cache delete error:', error);
/**
   * Set multiple values at once
   */
  public async mset(items: Record<string, CacheValue>, ttl: number = TTL.STANDARD): Promise<void> {
    try {
      const serializedItems: Record<string, string> = {};
      
      // Serialize all values
      for (const [key, value] of Object.entries(items)) {
        serializedItems[key] = this.serialize(value);
if (this.redisEnabled) {
        const redis = getOptimizedRedisClient();
        const pipeline = redis.pipeline();
        
        for (const [key, value] of Object.entries(serializedItems)) {
          pipeline.set(key, value, 'EX', ttl);
await pipeline.exec();
else {
        // Fallback to memory cache
        for (const [key, value] of Object.entries(serializedItems)) {
          memoryCache.set(key, value, ttl);
catch (error) {
      logger.error('Cache mset error:', error);
      
      // Fallback to memory cache on Redis error
      for (const [key, value] of Object.entries(items)) {
        const serialized = this.serialize(value);
        memoryCache.set(key, serialized, ttl);
/**
   * Get multiple values at once
   */
  public async mget<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const result: Record<string, T | null> = {};
      
      if (this.redisEnabled) {
        const redis = getOptimizedRedisClient();
        const values = await redis.mget(...keys);
        
        // Process results
        keys.forEach((key, index) => {
          const value = values[index];
          result[key] = value ? this.deserialize<T>(value) : null;
else {
        // Fallback to memory cache
        for (const key of keys) {
          const value = memoryCache.get(key);
          result[key] = value ? this.deserialize<T>(value) : null;
return result;
catch (error) {
      logger.error('Cache mget error:', error);
      
      // Fallback to memory cache
      const result: Record<string, T | null> = {};
      for (const key of keys) {
        const value = memoryCache.get(key);
        result[key] = value ? this.deserialize<T>(value) : null;
return result;
/**
   * Helper to build cache keys with proper prefixes
   */
  public buildKey(prefix: string, id: string | number): string {
    return `${prefix}${id}`;
/**
   * Helper to invalidate all keys with a certain pattern
   * Warning: This can be expensive on large datasets
   */
  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redisEnabled) {
        // This is not directly supported in our optimized client
        // For implementation, you would need to add a method to the OptimizedRedisClient
        logger.warn('Pattern invalidation not implemented for Redis');
// Memory cache doesn't support pattern invalidation
catch (error) {
      logger.error('Cache invalidate pattern error:', error);
/**
   * Cache a page rendering result
   */
  public async cachePage(path: string, html: string, ttl: number = TTL.MEDIUM): Promise<void> {
    const key = this.buildKey(PREFIX.PAGE, path);
    await this.set(key, html, ttl);
/**
   * Get a cached page rendering
   */
  public async getPageCache(path: string): Promise<string | null> {
    const key = this.buildKey(PREFIX.PAGE, path);
    return this.get<string>(key);
/**
   * Cache an API response
   */
  public async cacheApiResponse(
    path: string, 
    query: Record<string, string>, 
    response: any, 
    ttl: number = TTL.MEDIUM
  ): Promise<void> {
    // Create a normalized query string
    const queryStr = Object.entries(query)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const key = this.buildKey(PREFIX.API, `${path}?${queryStr}`);
    await this.set(key, response, ttl);
/**
   * Get a cached API response
   */
  public async getApiCache(
    path: string, 
    query: Record<string, string>
  ): Promise<any> {
    // Create a normalized query string
    const queryStr = Object.entries(query)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const key = this.buildKey(PREFIX.API, `${path}?${queryStr}`);
    return this.get(key);
/**
   * Cache AR model information
   */
  public async cacheARModel(modelId: string, modelData: any, ttl: number = TTL.EXTENDED): Promise<void> {
    const key = this.buildKey(PREFIX.AR_MODEL, modelId);
    await this.set(key, modelData, ttl);
/**
   * Get cached AR model information
   */
  public async getARModel(modelId: string): Promise<any> {
    const key = this.buildKey(PREFIX.AR_MODEL, modelId);
    return this.get(key);
/**
   * Serialize value for storage
   */
  private serialize(value: CacheValue): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    return JSON.stringify(value);
/**
   * Deserialize value from storage
   */
  private deserialize<T>(value: string): T | null {
    if (value === 'undefined') return undefined as unknown as T;
    if (value === 'null') return null;
    
    try {
      return JSON.parse(value) as T;
catch (error) {
      // If not JSON, return as is
      return value as unknown as T;
// Create singleton instance
let cacheService: CacheService | null = null;

export const getCacheService = (): CacheService => {
  if (!cacheService) {
    cacheService = new CacheService();
return cacheService;
export default getCacheService; 