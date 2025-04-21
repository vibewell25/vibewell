import { Pool } from 'pg';
import { promisify } from 'util';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Query optimization utilities
export const dbOptimization = {
  // Execute query with retry logic
  async executeWithRetry<T>(query: string, params: any[] = [], maxRetries = 3): Promise<T> {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await pool.query(query, params);
        return result.rows;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    throw lastError;
  },

  // Execute query with timeout
  async executeWithTimeout<T>(query: string, params: any[] = [], timeoutMs = 5000): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query(`SET statement_timeout = ${timeoutMs}`);
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Batch insert optimization
  async batchInsert<T>(
    table: string,
    columns: string[],
    values: any[][],
    batchSize = 1000
  ): Promise<void> {
    const columnList = columns.join(', ');
    const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columnList}) VALUES (${valuePlaceholders})`;

    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      await pool.query('BEGIN');
      try {
        for (const row of batch) {
          await pool.query(query, row);
        }
        await pool.query('COMMIT');
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }
  },

  // Query result caching
  async cachedQuery<T>(key: string, query: string, params: any[] = [], ttl = 3600): Promise<T> {
    const cacheKey = `query:${key}:${JSON.stringify(params)}`;
    const cached = await pool.query(
      'SELECT result FROM query_cache WHERE key = $1 AND expires_at > NOW()',
      [cacheKey]
    );

    if (cached.rows.length > 0) {
      return JSON.parse(cached.rows[0].result);
    }

    const result = await pool.query(query, params);
    await pool.query(
      'INSERT INTO query_cache (key, result, expires_at) VALUES ($1, $2, NOW() + $3::interval)',
      [cacheKey, JSON.stringify(result.rows), `${ttl} seconds`]
    );

    return result.rows;
  },

  // Connection pool monitoring
  async getPoolStats() {
    return {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };
  },

  // Query performance monitoring
  async logSlowQueries(thresholdMs = 1000) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slow_queries (
        id SERIAL PRIMARY KEY,
        query TEXT,
        duration_ms INTEGER,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const client = await pool.connect();
    try {
      await client.query('SET log_min_duration_statement = $1', [thresholdMs]);
      await client.query(`
        CREATE OR REPLACE FUNCTION log_slow_query()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO slow_queries (query, duration_ms)
          VALUES (current_query(), EXTRACT(MILLISECONDS FROM (clock_timestamp() - statement_timestamp())));
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `);
    } finally {
      client.release();
    }
  },
};
