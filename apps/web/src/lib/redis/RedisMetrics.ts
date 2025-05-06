import redisClient from '../redis-client';
import { logger } from '../logger';

// Define metrics types
export interface RedisMetrics {
  timestamp: number;
  usedMemory: number;
  connectedClients: number;
  commandsProcessed: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  hitRate: number;
  uptime: number;
  rateLimitMetrics: RateLimitMetrics;
interface RateLimitMetrics {
  totalKeys: number;
  blockedIPs: number;
  rateLimitedRequests: number;
  suspiciousIPs: number;
  keysByType: Record<string, number>;
/**

 * Collects comprehensive Redis metrics for monitoring
 * and analysis of rate limiting behavior
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); collectRedisMetrics(): Promise<RedisMetrics | null> {
  try {
    // Get basic Redis INFO
    const info = await redisClient.info();

    // Parse general metrics from INFO command
    const generalMetrics = parseRedisInfo(info);

    // Get rate limiting specific metrics
    const rateLimitMetrics = await collectRateLimitMetrics();

    const metrics: RedisMetrics = {
      timestamp: Date.now(),
      ...generalMetrics,
      rateLimitMetrics,
// Log metrics at debug level

    logger.debug('Redis metrics collected', 'redis-metrics', {
      usedMemory: metrics.usedMemory,
      clients: metrics.connectedClients,
      hitRate: metrics.hitRate,
      rateLimitedRequests: metrics.rateLimitMetrics.rateLimitedRequests,
      blockedIPs: metrics.rateLimitMetrics.blockedIPs,
return metrics;
catch (error) {

    logger.error('Failed to collect Redis metrics', 'redis-metrics', {
      error: error instanceof Error ? error.message : String(error),
return null;
/**
 * Parse Redis INFO command output into structured metrics
 */
function parseRedisInfo(info: string) {
  const metrics: Record<string, string> = {};
  const sections = info.split('#');

  for (const section of sections) {
    const lines = section.split('\r\n').filter(Boolean);
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key && value) {
          metrics[key.trim()] = value.trim();
return {
    usedMemory: parseInt(metrics.used_memory || '0', 10),
    connectedClients: parseInt(metrics.connected_clients || '0', 10),
    commandsProcessed: parseInt(metrics.total_commands_processed || '0', 10),
    keyspaceHits: parseInt(metrics.keyspace_hits || '0', 10),
    keyspaceMisses: parseInt(metrics.keyspace_misses || '0', 10),
    hitRate: calculateHitRate(metrics),
    uptime: parseInt(metrics.uptime_in_seconds || '0', 10),
/**
 * Calculate Redis cache hit rate
 */
function calculateHitRate(metrics: Record<string, string>) {
  const hits = parseInt(metrics.keyspace_hits || '0', 10);
  const misses = parseInt(metrics.keyspace_misses || '0', 10);

  const total = hits + misses;

  return total > 0 ? hits / total : 0;
/**
 * Collect rate limiting specific metrics
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); collectRateLimitMetrics(): Promise<RateLimitMetrics> {
  try {
    // Get all rate limit keys
    const allKeys = await redisClient.keys('vibewell:ratelimit:*');

    // Get blocked IPs
    const blockedIPs = await redisClient.keys('vibewell:ratelimit:blocked:*');

    // Count rate limited events in the last hour
    const now = Date.now();

    const hourAgo = now - 60 * 60 * 1000;
    let rateLimitedRequests = 0;

    try {
      const eventKey = 'ratelimit:events';
      const recentEvents = await redisClient.zrangebyscore(eventKey, hourAgo, now);
      rateLimitedRequests = recentEvents.length;
catch (error) {

      logger.warn('Could not get rate limited events count', 'redis-metrics', {
        error: error instanceof Error ? error.message : String(error),
// Get suspicious IPs
    const suspiciousKeys = await redisClient.keys('vibewell:ratelimit:suspicious:*');

    // Count keys by type
    const keysByType: Record<string, number> = {};
    for (const key of allKeys) {
      const keyParts = key.split(':');
      if (keyParts.length >= 3) {
        const type = keyParts[2]; // e.g., "general", "auth", etc.

    keysByType[type] = (keysByType[type] || 0) + 1;
return {
      totalKeys: allKeys.length,
      blockedIPs: blockedIPs.length,
      rateLimitedRequests,
      suspiciousIPs: suspiciousKeys.length,
      keysByType,
catch (error) {

    logger.error('Failed to collect rate limit metrics', 'redis-metrics', {
      error: error instanceof Error ? error.message : String(error),
return {
      totalKeys: 0,
      blockedIPs: 0,
      rateLimitedRequests: 0,
      suspiciousIPs: 0,
      keysByType: {},
/**

 * Store metrics in Redis for later analysis
 * Stores a recent history of metrics data
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); storeMetricsInRedis(metrics: RedisMetrics): Promise<boolean> {
  try {
    const timestamp = metrics.timestamp;
    const metricsKey = 'vibewell:metrics:redis';

    // Store serialized metrics in a Redis sorted set with time as score
    await redisClient.zadd(metricsKey, timestamp, JSON.stringify(metrics));

    // Keep only the last 1000 metrics entries (sliding window)
    await redisClient.zremrangebyrank(metricsKey, 0, -1001);

    // Set expiration for metrics (7 days)
    await redisClient.expire(metricsKey, 7 * 24 * 60 * 60);

    return true;
catch (error) {

    logger.error('Failed to store Redis metrics', 'redis-metrics', {
      error: error instanceof Error ? error.message : String(error),
return false;
/**
 * Get recent Redis metrics history
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getRedisMetricsHistory(limit = 100): Promise<RedisMetrics[]> {
  try {
    const metricsKey = 'vibewell:metrics:redis';

    const results = await redisClient.zrevrange(metricsKey, 0, limit - 1);

    return results.map((item: string) => JSON.parse(item)) as RedisMetrics[];
catch (error) {

    logger.error('Failed to get Redis metrics history', 'redis-metrics', {
      error: error instanceof Error ? error.message : String(error),
return [];
/**
 * Calculate aggregated stats from metrics history
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); calculateRedisStats(): Promise<Record<string, any>> {
  try {
    // Get last hour of metrics
    const metrics = await getRedisMetricsHistory(60);

    if (metrics.length === 0) {
      return {};
// Calculate averages, min, max for key metrics
    const stats = {
      period: {
        from: Math.min(...metrics.map((m) => m.timestamp)),
        to: Math.max(...metrics.map((m) => m.timestamp)),
memory: {
        avg: average(metrics.map((m) => m.usedMemory)),
        max: Math.max(...metrics.map((m) => m.usedMemory)),
        trend: calculateTrend(metrics.map((m) => m.usedMemory)),
hitRate: {
        avg: average(metrics.map((m) => m.hitRate)),
        min: Math.min(...metrics.map((m) => m.hitRate)),
connections: {
        avg: average(metrics.map((m) => m.connectedClients)),
        max: Math.max(...metrics.map((m) => m.connectedClients)),
rateLimiting: {
        totalBlocked: metrics[0].rateLimitMetrics.blockedIPs || 0,
        suspiciousIPs: metrics[0].rateLimitMetrics.suspiciousIPs || 0,
        hourlyRateLimited: metrics[0].rateLimitMetrics.rateLimitedRequests || 0,
return stats;
catch (error) {

    logger.error('Failed to calculate Redis stats', 'redis-metrics', {
      error: error instanceof Error ? error.message : String(error),
return {};
/**
 * Calculate the average of an array of numbers
 */
function average(values: number[]): number {

  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
/**

 * Calculate the trend of a metric

 * Returns a value between -1 and 1 indicating the trend direction and strength
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;

  // Use simple linear regression to determine trend
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);


  const sumX = xValues.reduce((sum, x) => sum + x, 0);

  const sumY = values.reduce((sum, y) => sum + y, 0);

    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);

  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);





  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const maxSlope = Math.max(...values) / n;


  // Normalize slope to be between -1 and 1

  return Math.max(-1, Math.min(1, slope / maxSlope));
