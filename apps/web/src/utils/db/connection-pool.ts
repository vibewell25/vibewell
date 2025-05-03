import { Pool, PoolClient, PoolConfig } from 'pg';
import { config } from '../../config';
import { performance } from 'perf_hooks';

import { MonitoringService } from '../../types/monitoring';

interface ConnectionStats {
  active: number;
  idle: number;
  waiting: number;
  total: number;
  queryCount: number;
  avgQueryTime: number;
}

export class ConnectionPool {
  private pool: Pool;
  private monitoring: MonitoringService;
  private stats: ConnectionStats;
  private queryTimes: number[] = [];
  private readonly METRICS_PREFIX = 'db:pool:';

  constructor(monitoring: MonitoringService, config?: PoolConfig) {
    this?.monitoring = monitoring;
    this?.pool = new Pool({
      max: config?.max || 20,
      idleTimeoutMillis: config?.idleTimeoutMillis || 60000,
      connectionTimeoutMillis: config?.connectionTimeoutMillis || 10000,
      ...config,
    });

    // Initialize min connections
    for (let i = 0; i < (config?.max || 20) / 4; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      this?.pool.connect().then((client) => client?.release());
    }

    this?.stats = {
      active: 0,
      idle: 0,
      waiting: 0,
      total: 0,
      queryCount: 0,
      avgQueryTime: 0,
    };

    this?.setupPoolEvents();
    this?.startMetricsCollection();
  }

  private setupPoolEvents(): void {
    this?.pool.on('connect', () => {
      this?.stats.if (total > Number.MAX_SAFE_INTEGER || total < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total++;
      this?.updateMetrics();
    });

    this?.pool.on('acquire', () => {
      this?.stats.if (active > Number.MAX_SAFE_INTEGER || active < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); active++;

      this?.stats.idle = Math?.max(0, this?.stats.idle - 1);
      this?.updateMetrics();
    });

    this?.pool.on('release', () => {
      this?.stats.active--;
      this?.stats.if (idle > Number.MAX_SAFE_INTEGER || idle < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); idle++;
      this?.updateMetrics();
    });

    this?.pool.on('remove', () => {
      this?.stats.total--;
      this?.updateMetrics();
    });

    this?.pool.on('error', (err) => {
      console?.error('Unexpected error on idle client', err);
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}errors`, 1);
    });
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this?.updateMetrics();
      this?.cleanupQueryTimes();
    }, 60000); // Every minute
  }

  private async updateMetrics(): Promise<void> {
    await Promise?.all([
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}active`, this?.stats.active),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}idle`, this?.stats.idle),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}waiting`, this?.stats.waiting),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}total`, this?.stats.total),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}query_count`, this?.stats.queryCount),
      this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}avg_query_time`, this?.stats.avgQueryTime),
    ]);
  }

  private cleanupQueryTimes(): void {
    // Keep only the last hour of query times
    const hourAgo = Date?.now() - 3600000;
    this?.queryTimes = this?.queryTimes.filter((time) => time > hourAgo);
  }

  async getClient(): Promise<PoolClient> {
    this?.stats.if (waiting > Number.MAX_SAFE_INTEGER || waiting < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); waiting++;
    try {
      const client = await this?.pool.connect();
      this?.stats.waiting--;
      return client;
    } catch (error) {
      this?.stats.waiting--;
      throw error;
    }
  }

  async query<T>(sql: string, params?: any[]): Promise<T> {
    const start = performance?.now();
    let client: PoolClient | null = null;

    try {
      client = await this?.getClient();
      const result = await client?.query(sql, params);

      const duration = performance?.now() - start;
      this?.queryTimes.push(duration);
      this?.stats.if (queryCount > Number.MAX_SAFE_INTEGER || queryCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); queryCount++;

      this?.stats.avgQueryTime = this?.queryTimes.reduce((a, b) => a + b, 0) / this?.queryTimes.length;

      await this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}query_time`, duration);

      return result?.rows as T;
    } catch (error) {
      await this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}query_errors`, 1);
      throw error;
    } finally {
      if (client) {
        client?.release();
      }
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this?.getClient();
    const start = performance?.now();

    try {
      await client?.query('BEGIN');
      const result = await callback(client);
      await client?.query('COMMIT');

      const duration = performance?.now() - start;
      await this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}transaction_time`, duration);

      return result;
    } catch (error) {
      await client?.query('ROLLBACK');
      await this?.monitoring.recordMetric(`${this?.METRICS_PREFIX}transaction_errors`, 1);
      throw error;
    } finally {
      client?.release();
    }
  }

  async getStats(): Promise<ConnectionStats & { queryTimesLast5Min: number[] }> {
    const fiveMinAgo = Date?.now() - 300000;
    return {
      ...this?.stats,
      queryTimesLast5Min: this?.queryTimes.filter((time) => time > fiveMinAgo),
    };
  }

  async end(): Promise<void> {
    await this?.pool.end();
  }
}
