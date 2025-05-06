import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { CacheService } from './CacheService';

/**
 * Options for query optimization
 */
interface QueryOptions {
  cacheEnabled?: boolean;
  cacheTTL?: number; // in milliseconds
  cacheKey?: string;
  traceEnabled?: boolean;
  timeoutMs?: number; // query timeout in milliseconds
  maxRetries?: number;
  includeCount?: boolean; // whether to include total count in paginated results
}

/**
 * Result of a paginated query
 */
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems?: number;
    totalPages?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Query optimization metrics
 */
interface QueryMetrics {
  queryId: string;
  queryName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  successful?: boolean;
  error?: string;
  cacheHit?: boolean;
  rowCount?: number;
}

/**
 * Database optimizer service for improving database performance
 * 
 * This service provides:
 * - Query caching
 * - Query performance monitoring
 * - Optimized pagination
 * - Connection pooling and retry mechanisms
 * - Query timeouts
 */
export class DatabaseOptimizer {
  private prisma: PrismaClient;
  private cache: CacheService;
  private metrics: Map<string, QueryMetrics> = new Map();
  private slowQueryThreshold = 500; // milliseconds
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cache = new CacheService({
      namespace: 'db_cache',
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 200
    });
    
    // Set up metrics cleanup interval
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupOldMetrics(), 60 * 60 * 1000); // Clean up every hour
    }
  }
  
  /**
   * Execute a query with optimizations
   * 
   * @param queryName A name for this query (for metrics)
   * @param queryFn The query function to execute
   * @param options Query optimization options
   * @returns The query result
   */
  async query<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const {
      cacheEnabled = true,
      cacheTTL,
      cacheKey,
      traceEnabled = process.env.NODE_ENV !== 'production',
      timeoutMs = 10000,
      maxRetries = 3
    } = options;
    
    // Generate a unique ID for this query execution
    const queryId = `${queryName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Start timing
    const startTime = Date.now();
    if (traceEnabled) {
      this.metrics.set(queryId, {
        queryId,
        queryName,
        startTime
      });
    }
    
    // Determine cache key if enabled
    const effectiveCacheKey = cacheEnabled ? (cacheKey || `db:${queryName}`) : undefined;
    
    try {
      // Try to get from cache if enabled
      if (cacheEnabled && effectiveCacheKey) {
        const cachedResult = this.cache.get(effectiveCacheKey);
        if (cachedResult !== undefined) {
          if (traceEnabled) {
            this.recordQueryCompletion(queryId, true, true, (cachedResult as any)?.length);
          }
          return cachedResult as T;
        }
      }
      
      // Execute query with timeout and retries
      const result = await this.executeWithTimeoutAndRetry<T>(
        queryFn,
        timeoutMs,
        maxRetries
      );
      
      // Save to cache if enabled
      if (cacheEnabled && effectiveCacheKey) {
        this.cache.set(effectiveCacheKey, result, cacheTTL);
      }
      
      // Record metrics
      if (traceEnabled) {
        this.recordQueryCompletion(queryId, true, false, (result as any)?.length);
      }
      
      return result;
    } catch (error) {
      // Record error metrics
      if (traceEnabled) {
        this.recordQueryCompletion(
          queryId,
          false,
          false,
          0,
          error instanceof Error ? error.message : String(error)
        );
      }
      
      logger.error('Database query failed', 'DatabaseOptimizer', {
        queryName,
        queryId,
        error
      });
      
      throw error;
    }
  }
  
  /**
   * Execute a paginated query with optimizations
   * 
   * @param queryName A name for this query (for metrics)
   * @param model The Prisma model to query
   * @param filter The filter criteria
   * @param pagination Pagination parameters
   * @param options Query optimization options
   * @returns Paginated results
   */
  async paginate<T>(
    queryName: string,
    model: any,
    filter: any = {},
    pagination: { page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'id',
      sortOrder = 'desc'
    } = pagination;
    
    const { includeCount = true } = options;
    
    // Calculate skip/take for pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    
    // Build sort order object
    const orderBy = { [sortBy]: sortOrder };
    
    // Create a cache key that includes pagination
    const cacheKey = options.cacheKey || 
      `${queryName}:page=${page}:size=${pageSize}:sort=${sortBy}_${sortOrder}:${JSON.stringify(filter)}`;
    
    return this.query<PaginatedResult<T>>(
      queryName,
      async () => {
        // Execute queries in parallel if count is requested
        const [data, count] = await Promise.all([
          model.findMany({
            where: filter,
            skip,
            take,
            orderBy,
          }),
          includeCount ? model.count({ where: filter }) : Promise.resolve(undefined)
        ]);
        
        // Calculate pagination metadata
        const totalItems = count;
        const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : undefined;
        const hasNextPage = includeCount 
          ? page < (totalPages || 0)
          : data.length === pageSize; // If count not requested, estimate based on results
        
        return {
          data,
          pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage,
            hasPreviousPage: page > 1
          }
        };
      },
      {
        ...options,
        cacheKey
      }
    );
  }
  
  /**
   * Execute a database transaction with optimizations
   * 
   * @param queryName A name for this transaction (for metrics)
   * @param transactionFn The transaction function to execute
   * @param options Transaction options
   * @returns The transaction result
   */
  async transaction<T>(
    queryName: string,
    transactionFn: (tx: PrismaClient) => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const {
      traceEnabled = process.env.NODE_ENV !== 'production',
      timeoutMs = 30000 // Longer timeout for transactions
    } = options;
    
    // Generate a unique ID for this transaction
    const queryId = `tx_${queryName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Start timing
    const startTime = Date.now();
    if (traceEnabled) {
      this.metrics.set(queryId, {
        queryId,
        queryName: `Transaction: ${queryName}`,
        startTime
      });
    }
    
    try {
      // Execute transaction with timeout
      const result = await Promise.race([
        this.prisma.$transaction(tx => transactionFn(tx as PrismaClient)),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Transaction timeout after ${timeoutMs}ms`)), timeoutMs);
        })
      ]);
      
      // Record success metrics
      if (traceEnabled) {
        this.recordQueryCompletion(queryId, true, false);
      }
      
      return result;
    } catch (error) {
      // Record error metrics
      if (traceEnabled) {
        this.recordQueryCompletion(
          queryId,
          false,
          false,
          0,
          error instanceof Error ? error.message : String(error)
        );
      }
      
      logger.error('Database transaction failed', 'DatabaseOptimizer', {
        queryName,
        queryId,
        error
      });
      
      throw error;
    }
  }
  
  /**
   * Clear all cached database results
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get query performance metrics
   * 
   * @returns Array of query metrics
   */
  getMetrics(): QueryMetrics[] {
    return Array.from(this.metrics.values());
  }
  
  /**
   * Get slow query metrics (queries that exceeded the threshold)
   * 
   * @returns Array of slow query metrics
   */
  getSlowQueries(): QueryMetrics[] {
    return this.getMetrics().filter(
      metric => metric.duration !== undefined && metric.duration > this.slowQueryThreshold
    );
  }
  
  /**
   * Set the threshold for detecting slow queries
   * 
   * @param thresholdMs Threshold in milliseconds
   */
  setSlowQueryThreshold(thresholdMs: number): void {
    this.slowQueryThreshold = thresholdMs;
  }
  
  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }
  
  /**
   * Execute a query with timeout and retry logic
   * 
   * @param queryFn The query function to execute
   * @param timeoutMs Timeout in milliseconds
   * @param maxRetries Maximum number of retries
   * @returns The query result
   */
  private async executeWithTimeoutAndRetry<T>(
    queryFn: () => Promise<T>,
    timeoutMs: number,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Execute with timeout
        return await Promise.race([
          queryFn(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs);
          })
        ]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry certain errors
        if (this.shouldNotRetry(lastError)) {
          throw lastError;
        }
        
        // Wait before retry
        if (attempt < maxRetries - 1) {
          const backoffMs = Math.min(100 * Math.pow(2, attempt), 2000);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    // All retries failed
    throw lastError || new Error('Query failed after all retry attempts');
  }
  
  /**
   * Determine if a query error should not be retried
   * 
   * @param error The error to check
   * @returns True if the error should not be retried
   */
  private shouldNotRetry(error: Error): boolean {
    // Don't retry validation errors, constraint violations, etc.
    return (
      error.message.includes('Invalid') ||
      error.message.includes('Unique constraint') ||
      error.message.includes('Foreign key constraint') ||
      error.message.includes('does not exist') ||
      error.message.includes('not found') ||
      error.message.includes('timeout') // Don't retry timeout errors
    );
  }
  
  /**
   * Record the completion of a query
   * 
   * @param queryId The query ID
   * @param successful Whether the query was successful
   * @param cacheHit Whether the result was from cache
   * @param rowCount Number of rows returned
   * @param error Error message if query failed
   */
  private recordQueryCompletion(
    queryId: string,
    successful: boolean,
    cacheHit: boolean,
    rowCount?: number,
    error?: string
  ): void {
    const metric = this.metrics.get(queryId);
    if (!metric) return;
    
    const endTime = Date.now();
    const duration = endTime - metric.startTime;
    
    this.metrics.set(queryId, {
      ...metric,
      endTime,
      duration,
      successful,
      cacheHit,
      rowCount,
      error
    });
    
    // Log slow queries
    if (duration > this.slowQueryThreshold && !cacheHit) {
      logger.warn('Slow database query detected', 'DatabaseOptimizer', {
        queryName: metric.queryName,
        duration,
        threshold: this.slowQueryThreshold,
        rowCount
      });
    }
  }
  
  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const now = Date.now();
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [id, metric] of this.metrics.entries()) {
      const age = now - metric.startTime;
      if (age > MAX_AGE) {
        this.metrics.delete(id);
      }
    }
  }
}

// Create a singleton instance with default Prisma client
let _instance: DatabaseOptimizer | undefined;

export function getDatabaseOptimizer(prisma?: PrismaClient): DatabaseOptimizer {
  if (!_instance) {
    _instance = new DatabaseOptimizer(prisma || new PrismaClient());
  }
  return _instance;
}

export default DatabaseOptimizer; 