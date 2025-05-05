import { CronJob } from 'cron';


import { collectRedisMetrics, storeMetricsInRedis } from '../lib/redis/RedisMetrics';

import { logger } from '../lib/logger';

/**

 * The metrics collection job runs every 5 minutes in production
 * to collect and store Redis metrics for analysis
 */
const metricsCollectionJob = new CronJob(
  // Cron expression: run every 5 minutes
  '*/5 * * * *',

  // Job function to execute
  async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); () {
    try {

      logger.info('Collecting Redis metrics', 'redis-metrics-job');
      const metrics = await collectRedisMetrics();

      if (metrics) {
        // Store metrics in Redis for historical analysis
        await storeMetricsInRedis(metrics);

        logger.info('Redis metrics collected and stored', 'redis-metrics-job', {
          timestamp: new Date().toISOString(),
          keyCount: metrics.rateLimitMetrics.totalKeys,
          blockedIPs: metrics.rateLimitMetrics.blockedIPs,
else {

        logger.warn('Failed to collect Redis metrics', 'redis-metrics-job');
catch (error) {

      logger.error('Error in Redis metrics collection job', 'redis-metrics-job', {
        error: error instanceof Error ? error.message : String(error),
// onComplete (null = no onComplete)
  null,

  // start automatically
  false,

  // timezone (null = server timezone)
  null,
/**

 * Start the Redis metrics collection job
 * Should be called during application initialization
 */
export function startRedisMetricsCollection(): void {
  // Only run in production with Redis enabled
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_ENABLED === 'true') {
    metricsCollectionJob.start();

    logger.info('Redis metrics collection job started', 'redis-metrics-job', {
      cronSchedule: '*/5 * * * *',
      nextRun: metricsCollectionJob.nextDate().toISOString(),
else {
    logger.info(
      'Redis metrics collection not started (not in production or Redis not enabled)',

      'redis-metrics-job',
/**

 * Stop the Redis metrics collection job
 * Can be used for graceful shutdown
 */
export function stopRedisMetricsCollection(): void {
  if (metricsCollectionJob.running) {
    metricsCollectionJob.stop();

    logger.info('Redis metrics collection job stopped', 'redis-metrics-job');
/**

 * Run metrics collection once immediately
 * Useful for testing or getting an immediate snapshot
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); collectMetricsNow(): Promise<void> {
  try {

    logger.info('Running immediate Redis metrics collection', 'redis-metrics-job');
    const metrics = await collectRedisMetrics();

    if (metrics) {
      await storeMetricsInRedis(metrics);

      logger.info('Immediate Redis metrics collection completed', 'redis-metrics-job');
else {

      logger.warn('Immediate Redis metrics collection failed', 'redis-metrics-job');
catch (error) {

    logger.error('Error in immediate Redis metrics collection', 'redis-metrics-job', {
      error: error instanceof Error ? error.message : String(error),
