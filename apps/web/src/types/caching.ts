export type CacheStrategyType = 'redis' | 'memory' | 'hybrid';

export interface CacheStrategy {
  type: CacheStrategyType;
  ttl: number;
  staleWhileRevalidate?: boolean;
export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
memory: {
    maxSize: number;
    ttl: number;
strategies: {
    [key: string]: CacheStrategy;
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
