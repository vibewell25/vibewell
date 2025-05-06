functionality for security
 *

 * The module exports a singleton instance of the Redis client configured based on
 * the current environment.
 */


import { logger } from '@/lib/logger';
import Redis from 'ioredis';

// Type definitions
export interface RateLimitEvent {
  id?: string;
  ip: string;
  path: string;
  method: string;
  limiterType: string;
  exceeded: boolean;
  blocked: boolean;
  suspicious: boolean;
  resetTime: number;
  timestamp: number;
export interface SuspiciousIP {
  ip: string;
  count: number;
  recentEvents: RateLimitEvent[];
// Type for Redis client interface
export interface RedisClientInterface extends Redis {
  sadd(key: string, ...members: string[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  srem(key: string, ...members: string[]): Promise<number>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  logRateLimitEvent(event: RateLimitEvent): Promise<void>;
  getRateLimitEvents(limit?: number): Promise<RateLimitEvent[]>;
  clearOldRateLimitEvents(olderThanMs?: number): Promise<number>;
  blockIP(ip: string, durationSeconds?: number): Promise<void>;
  isIPBlocked(ip: string): Promise<boolean>;
  unblockIP(ip: string): Promise<boolean>;
  getBlockedIPs(): Promise<string[]>;
  getSuspiciousIPs(limit?: number): Promise<SuspiciousIP[]>;
// Interface for IP count information
interface IPCountInfo {
  ip: string;
  count: number;
/**
 * Mock Redis client for Edge Runtime and development
 */
class MockRedisClient implements RedisClientInterface {
  private store: Map<string, { value: string; expiry?: number }>;
  private rateLimitEvents: RateLimitEvent[];
  private blockedIPs: Map<string, number>;

  constructor() {
    this.store = new Map();
    this.rateLimitEvents = [];
    this.blockedIPs = new Map();

    // Clean up expired keys periodically
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupExpiredKeys(), 1000);
private cleanupExpiredKeys() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.expiry && data.expiry <= now) {
        this.store.delete(key);
// Clean up expired IP blocks
    for (const [ip, expiry] of this.blockedIPs.entries()) {
      if (expiry <= now) {
        this.blockedIPs.delete(ip);
async get(key: string): Promise<string | null> {
    const data = this.store.get(key);
    if (!data) return null;
    if (data.expiry && data.expiry <= Date.now()) {
      this.store.delete(key);
      return null;
return data.value;
async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {

    const expiry = options.ex ? Date.now() + options.ex * 1000 : undefined;
    this.store.set(key, { value, expiry });
    return 'OK';
async incr(key: string): Promise<number> {
    const value = (await this.get(key)) || '0';
    const newValue = (parseInt(value, 10) || 0) + 1;
    await this.set(key, newValue.toString());
    return newValue;
async expire(key: string, seconds: number): Promise<number> {
    const data = this.store.get(key);
    if (!data) return 0;

    data.expiry = Date.now() + seconds * 1000;
    this.store.set(key, data);
    return 1;
async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
async ttl(key: string): Promise<number> {
    const data = this.store.get(key);

    if (!data || !data.expiry) return -1;

    const ttl = Math.ceil((data.expiry - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
async zadd(key: string, score: number, member: string): Promise<number> {
    throw new Error('Method not implemented');
async zrange(key: string, start: number, stop: number): Promise<string[]> {
    throw new Error('Method not implemented');
async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    throw new Error('Method not implemented');
async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    throw new Error('Method not implemented');
async keys(pattern: string): Promise<string[]> {
    throw new Error('Method not implemented');
async info(): Promise<string> {
    throw new Error('Method not implemented');
async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    this.rateLimitEvents.push(event);
    if (this.rateLimitEvents.length > 1000) {
      this.rateLimitEvents = this.rateLimitEvents.slice(-1000);
async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {

    return this.rateLimitEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    const originalLength = this.rateLimitEvents.length;
    this.rateLimitEvents = this.rateLimitEvents.filter(

      (event) => now - event.timestamp < olderThanMs,
return originalLength - this.rateLimitEvents.length;
async blockIP(ip: string, durationSeconds: number = 3600): Promise<void> {

    this.blockedIPs.set(ip, Date.now() + durationSeconds * 1000);
async isIPBlocked(ip: string): Promise<boolean> {
    const expiry = this.blockedIPs.get(ip);
    if (!expiry) return false;
    if (expiry <= Date.now()) {
      this.blockedIPs.delete(ip);
      return false;
return true;
async unblockIP(ip: string): Promise<boolean> {
    return this.blockedIPs.delete(ip);
async getBlockedIPs(): Promise<string[]> {
    const now = Date.now();
    const ips: string[] = [];
    for (const [ip, expiry] of this.blockedIPs.entries()) {
      if (expiry > now) {
        ips.push(ip);
return ips;
async getSuspiciousIPs(limit = 20): Promise<SuspiciousIP[]> {
    const ipCounts = new Map<string, { count: number; events: RateLimitEvent[] }>();

    for (const event of this.rateLimitEvents) {
      if (event.suspicious || event.exceeded) {
        if (!ipCounts.has(event.ip)) {
          ipCounts.set(event.ip, { count: 0, events: [] });
const data = ipCounts.get(event.ip)!;
        data.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count++;
        data.events.push(event);
return Array.from(ipCounts.entries())
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        recentEvents: data.events.slice(-10),
))

      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
/**
 * Production Redis client that uses Upstash Redis REST API for Edge compatibility
 */
class UpstashRedisClient implements RedisClientInterface {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
private async fetch(commands: string[][], pipeline = false): Promise<any> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,


        'Content-Type': 'application/json',
body: JSON.stringify(pipeline ? commands : commands[0]),
if (!response.ok) {
      throw new Error(`Redis operation failed: ${response.statusText}`);
const result = await response.json();
    return pipeline ? result : result.result;
async get(key: string): Promise<string | null> {
    return this.fetch([['get', key]]);
async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    const command: string[] = ['set', key, value];
    if (options.ex) {
      command.push('ex', options.ex.toString());
return this.fetch([command]);
async incr(key: string): Promise<number> {
    return this.fetch([['incr', key]]);
async expire(key: string, seconds: number): Promise<number> {
    return this.fetch([['expire', key, seconds.toString()]]);
async del(key: string): Promise<number> {
    return this.fetch([['del', key]]);
async ttl(key: string): Promise<number> {
    return this.fetch([['ttl', key]]);
async zadd(key: string, score: number, member: string): Promise<number> {
    return this.fetch([['zadd', key, score.toString(), member]]);
async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.fetch([['zrange', key, start.toString(), stop.toString()]]);
async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    return this.fetch([['zrangebyscore', key, min.toString(), max.toString()]]);
async zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    return this.fetch([['zremrangebyrank', key, start.toString(), stop.toString()]]);
async keys(pattern: string): Promise<string[]> {
    return this.fetch([['keys', pattern]]);
async info(): Promise<string> {
    return this.fetch([['info']]);
async logRateLimitEvent(event: RateLimitEvent): Promise<void> {
    const eventKey = 'ratelimit:events';
    const eventId = event.id || `${event.ip}:${event.path}:${Date.now()}`;
    event.id = eventId;

    const commands: string[][] = [
      ['zadd', eventKey, event.timestamp.toString(), JSON.stringify(event)],
      ['zremrangebyrank', eventKey, '0', '-10001'],
      ['expire', eventKey, (7 * 24 * 60 * 60).toString()],
    ];

    await this.fetch(commands, true);
async getRateLimitEvents(limit = 100): Promise<RateLimitEvent[]> {
    const events = await this.fetch([

      ['zrevrange', 'ratelimit:events', '0', (limit - 1).toString()],
    ]);
    return events
      .map((event: string) => {
        try {
          return JSON.parse(event);
catch {
          return null;
)
      .filter(Boolean);
async clearOldRateLimitEvents(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    const cutoffTime = Date.now() - olderThanMs;
    return this.fetch([['zremrangebyscore', 'ratelimit:events', '0', cutoffTime.toString()]]);
async blockIP(ip: string, durationSeconds: number = 3600): Promise<void> {
    const blockedKey = `vibewell:ratelimit:blocked:${ip}`;
    const command: string[] = ['set', blockedKey, '1', 'ex', durationSeconds.toString()];

    await this.fetch([command]);
async isIPBlocked(ip: string): Promise<boolean> {
    const blockedKey = `vibewell:ratelimit:blocked:${ip}`;
    const result = await this.fetch([['get', blockedKey]]);
    return result !== null;
async unblockIP(ip: string): Promise<boolean> {
    const blockedKey = `vibewell:ratelimit:blocked:${ip}`;
    const result = await this.fetch([['del', blockedKey]]);
    return result > 0;
async getBlockedIPs(): Promise<string[]> {
    const keys = await this.fetch([['keys', 'vibewell:ratelimit:blocked:*']]);
    return keys.map((key: string) => key.replace('vibewell:ratelimit:blocked:', ''));
async getSuspiciousIPs(limit = 20): Promise<SuspiciousIP[]> {
    const events = await this.getRateLimitEvents(1000);
    const ipCounts = new Map<string, { count: number; events: RateLimitEvent[] }>();

    for (const event of events) {
      if (event.suspicious || event.exceeded) {
        if (!ipCounts.has(event.ip)) {
          ipCounts.set(event.ip, { count: 0, events: [] });
const data = ipCounts.get(event.ip)!;
        data.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count++;
        data.events.push(event);
return Array.from(ipCounts.entries())
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        recentEvents: data.events.slice(-10),
))

      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
/**
 * Create a Redis client based on environment configuration
 */
function createRedisClient(): RedisClientInterface {
  // Always use mock client in Edge Runtime
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge') {

    logger.info('Using in-memory Redis client in Edge Runtime', 'redis');
    return new MockRedisClient();
// Use Upstash Redis in production if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRedisClient(
      process.env.UPSTASH_REDIS_REST_URL,
      process.env.UPSTASH_REDIS_REST_TOKEN,
// Use mock client as fallback

  logger.warn('Using in-memory Redis client as fallback', 'redis');
  return new MockRedisClient();
let redisClient: RedisClientInterface | null = null;

// Get or create the Redis client
export function getRedisClient(): RedisClientInterface {
  if (!redisClient) {
    redisClient = createRedisClient();
return redisClient;
// Export default client for backward compatibility
const defaultClient = getRedisClient();
export default defaultClient;
