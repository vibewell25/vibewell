import { PrismaClient, Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { performance } from 'perf_hooks';

/**
 * Metrics collected for each database query
 */
interface QueryMetrics {
  /** The SQL query string or operation details */
  query: string;
  /** Query execution time in milliseconds */
  duration: number;
  /** Timestamp when the query was executed */
  timestamp: number;
  /** Query parameters (optional) */
  params?: any[];
/**
 * Configuration options for the database connection pool
 */
interface ConnectionPoolConfig {
  /** Maximum number of connections in the pool */
  max: number;
  /** Minimum number of connections to maintain */
  min: number;
  /** Time in milliseconds to wait before timing out when connecting */
  idleTimeoutMillis: number;
  /** Time in milliseconds to wait before timing out when acquiring a connection */
  connectionTimeoutMillis: number;
/**
 * Database optimizer class that provides query optimization, caching, and monitoring
 */
class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private prisma: PrismaClient = new PrismaClient();
  private pool: Pool;
  private redis: Redis;
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold: number = 1000; // 1 second

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env['DATABASE_URL'],
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
this.redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');

    this.initializePrisma();
    this.setupQueryLogging();
/**
   * Initialize Prisma client with query logging
   * @private
   */
  private initializePrisma() {
    this.prisma.$on('query' as any, (e: any) => {
      if (e.duration >= this.slowQueryThreshold) {
        this.logSlowQuery({
          query: e.query,
          duration: e.duration,
          timestamp: Date.now(),
          params: e.params,
).catch(console.error);
/**
   * Set up query logging in development environment
   * @private
   */
  private setupQueryLogging() {
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$use(async (params, next) => {
        const start = performance.now();
        const result = await next(params);
        const duration = performance.now() - start;

        this.queryMetrics.push({
          query: JSON.stringify(params),
          duration,
          timestamp: Date.now(),
return result;
/**
   * Get the singleton instance of DatabaseOptimizer
   * @returns {DatabaseOptimizer} The singleton instance
   */
  public static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
return DatabaseOptimizer.instance;
/**
   * Log slow query metrics

   * @param {QueryMetrics} metrics - The metrics of the slow query
   * @private
   */
  private async logSlowQuery(metrics: QueryMetrics): Promise<void> {
    console.warn('Slow query detected:', metrics);
/**
   * Execute a query with automatic retries on failure

   * @param {string} query - The SQL query to execute

   * @param {any[]} params - Query parameters

   * @param {number} maxRetries - Maximum number of retry attempts
   * @returns {Promise<T>} Query results
   */
  public async executeWithRetry<T>(query: string, params: any[] = [], maxRetries = 3): Promise<T> {
    let lastError;
    for (let i = 0; i < maxRetries; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      try {
        const client = await this.pool.connect();
        try {
          const result = await client.query(query, params);
          return result.rows as T;
finally {
          client.release();
catch (error) {
        lastError = error;

        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
throw lastError;
/**
   * Analyze query execution plan and provide optimization suggestions

   * @param {string} query - The SQL query to analyze
   * @returns {Promise<string[]>} Array of optimization suggestions
   */
  public async analyzeQueryPlan(query: string): Promise<string[]> {
    const client = await this.pool.connect();
    const suggestions: string[] = [];

    try {
      const plan = await client.query(`EXPLAIN ANALYZE ${query}`);
      const planText = plan.rows.map((row: any) => row['QUERY PLAN']).join('\n');

      if (planText.includes('Seq Scan')) {
        suggestions.push('Consider adding an index to avoid sequential scan');
const costMatch = planText.match(/cost=(\d+)/);
      const cost = costMatch.[1];
      if (cost && parseInt(cost) > 1000) {
        suggestions.push('Query cost is high, consider optimization');
if ((planText.match(/Scan/g) || []).length > 2) {
        suggestions.push(
          'Multiple table scans detected, consider denormalization or adding indexes',
finally {
      client.release();
return suggestions;
/**
   * Get current connection pool statistics
   * @returns {Promise<object>} Pool statistics
   */
  public async getPoolStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
/**
   * Get query metrics within a time window

   * @param {number} minutes - Time window in minutes
   * @returns {Promise<QueryMetrics[]>} Array of query metrics
   */
  public async getQueryMetrics(minutes: number = 60) {

    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.queryMetrics.filter((m) => m.timestamp >= cutoff);
/**
   * Execute a query with caching support

   * @param {Prisma.Sql | string} query - The SQL query to execute

   * @param {any[]} params - Query parameters

   * @param {object} options - Cache options
   * @returns {Promise<T>} Query results
   */
  public async executeQuery<T>(
    query: Prisma.Sql | string,
    params?: any[],
    options: {
      ttl?: number;
      bypassCache?: boolean;
= {},
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(query.toString(), params);

    if (!options.bypassCache) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as T;
const result = await this.prisma.$queryRaw<T>(

    typeof query === 'string' ? Prisma.sql([query]) : query,
      ...(params || []),
if (!options.bypassCache && options.ttl) {
      await this.redis.setex(cacheKey, options.ttl, JSON.stringify(result));
return result;
/**
   * Execute multiple queries in a transaction

   * @param {Array<{query: string, params?: any[]}>} queries - Array of queries to execute

   * @param {number} batchSize - Number of queries to execute in each batch
   * @returns {Promise<T[]>} Combined results from all queries
   */
  public async batchExecute<T>(
    queries: { query: string; params?: any[] }[],
    batchSize = 1000,
  ): Promise<T[]> {
    const results: T[] = [];
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (let i = 0; i < queries.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i += batchSize) {

        const batch = queries.slice(i, i + batchSize);
        for (const { query, params } of batch) {
          const result = await client.query(query, params);
          results.push(...(result.rows as T[]));
await client.query('COMMIT');
catch (error) {
      await client.query('ROLLBACK');
      throw error;
finally {
      client.release();
return results;
/**
   * Generate a cache key for a query

   * @param {string} query - The SQL query

   * @param {any[]} params - Query parameters
   * @returns {string} Cache key
   * @private
   */
  private generateCacheKey(query: string, params?: any[]): string {
    const hash = createHash('sha256');
    hash.update(query);
    if (params) {
      hash.update(JSON.stringify(params));
return hash.digest('hex');
/**
   * Invalidate cache entries matching a pattern

   * @param {string} pattern - Cache key pattern to invalidate
   * @returns {Promise<void>}
   */
  public async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
// Export a single instance
const dbOptimizer = DatabaseOptimizer.getInstance();
export { dbOptimizer };

/**
 * Analyze a query for potential performance issues

 * @param {string} query - The SQL query to analyze
 * @returns {object} Analysis results with suggestions and potential issues
 */
export function analyzeQuery(query: string): {
  suggestions: string[];
  potentialIssues: string[];
{
  const suggestions: string[] = [];
  const potentialIssues: string[] = [];

  if (query.toLowerCase().includes('select') && query.toLowerCase().includes('where')) {
    potentialIssues.push(

      'Potential N+1 query detected. Consider using JOIN or including related data in a single query.',
const commonOperations = ['where', 'order by', 'group by'];
  commonOperations.forEach((operation) => {
    if (query.toLowerCase().includes(operation)) {
      suggestions.push(
        `Consider adding an index for the ${operation} clause to improve performance.`,
return { suggestions, potentialIssues };
/**
 * Middleware for logging slow queries in development

 * @param {any} params - Query parameters

 * @param {Function} next - Next middleware function
 * @returns {Promise<any>} Query results
 */
export {};
