import Redis from 'ioredis';
import logger from './logger';

interface BenchmarkConfig {
  host: string;
  port: number;
  password?: string;
  operations: number;
  parallel: number;
  dataSize: number;
}

interface BenchmarkResult {
  operation: string;
  totalTime: number;
  opsPerSecond: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  errors: number;
}

class RedisBenchmark {
  private redis: Redis;
  private config: BenchmarkConfig;
  private results: Map<string, BenchmarkResult>;

  constructor(config: BenchmarkConfig) {
    this.config = config;
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
    });
    this.results = new Map<string, BenchmarkResult>();
  }

  private generateData(size: number): string {
    return 'x'.repeat(size);
  }

  private calculatePercentile(latencies: number[], percentile: number): number {
    const sorted = [...latencies].sort((a, b) => a - b);

    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    if (index < 0 || index >= sorted.length) {
      throw new Error('Index out of bounds');
    }
    return sorted[index];
  }

  private async runOperation(
    name: string,
    operation: () => Promise<void>,
  ): Promise<BenchmarkResult> {
    const latencies: number[] = [];
    let errors = 0;
    const startTime = Date.now();

    const tasks = Array(this.config.operations)
      .fill(null)
      .map(async () => {
        const opStart = process.hrtime();
        try {
          await operation();
          const [seconds, nanoseconds] = process.hrtime(opStart);

          latencies.push(seconds * 1000 + nanoseconds / 1e6);
        } catch (error) {
          errors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Error in benchmark operation ${name}:`, errorMessage);
        }
      });

    // Run operations in parallel batches
    for (let i = 0; i < tasks.length; i += this.config.parallel) {
      const batch = tasks.slice(i, i + this.config.parallel);
      await Promise.all(batch);
    }

    const totalTime = Date.now() - startTime;

    const opsPerSecond = (this.config.operations - errors) / (totalTime / 1000);

    const result: BenchmarkResult = {
      operation: name,
      totalTime,
      opsPerSecond,

      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: this.calculatePercentile(latencies, 95),
      p99Latency: this.calculatePercentile(latencies, 99),
      errors,
    };

    this.results.set(name, result);
    return result;
  }

  public async benchmarkSet(): Promise<BenchmarkResult> {
    const data = this.generateData(this.config.dataSize);
    return this.runOperation('SET', async () => {
      const key = `bench:${Math.random().toString(36).substring(7)}`;
      await this.redis.set(key, data);
    });
  }

  public async benchmarkGet(): Promise<BenchmarkResult> {
    // First, set up test data

    const key = 'bench:get-test';
    const data = this.generateData(this.config.dataSize);
    await this.redis.set(key, data);

    return this.runOperation('GET', async () => {
      await this.redis.get(key);
    });
  }

  public async benchmarkHSet(): Promise<BenchmarkResult> {
    const data = this.generateData(Math.floor(this.config.dataSize / 10));
    return this.runOperation('HSET', async () => {
      const hash = `bench:hash:${Math.random().toString(36).substring(7)}`;
      await this.redis.hset(hash, {
        field1: data,
        field2: data,
        field3: data,
      });
    });
  }

  public async benchmarkPipeline(): Promise<BenchmarkResult> {
    const data = this.generateData(this.config.dataSize);
    return this.runOperation('PIPELINE', async () => {
      const pipeline = this.redis.pipeline();
      const key = `bench:pipeline:${Math.random().toString(36).substring(7)}`;

      pipeline.set(key, data);
      pipeline.get(key);
      pipeline.del(key);

      await pipeline.exec();
    });
  }

  public async benchmarkParallel(): Promise<BenchmarkResult> {
    const data = this.generateData(this.config.dataSize);
    return this.runOperation('PARALLEL', async () => {
      const promises = Array(10)
        .fill(null)
        .map(async (_, i) => {
          const key = `bench:parallel:${i}:${Math.random().toString(36).substring(7)}`;
          await this.redis.set(key, data);
          await this.redis.get(key);
          await this.redis.del(key);
        });
      await Promise.all(promises);
    });
  }

  public async runAll(): Promise<Map<string, BenchmarkResult>> {
    try {
      await this.benchmarkSet();
      await this.benchmarkGet();
      await this.benchmarkHSet();
      await this.benchmarkPipeline();
      await this.benchmarkParallel();

      return this.results;
    } finally {
      await this.cleanup();
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Clean up benchmark keys
      const keys = await this.redis.keys('bench:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      await this.redis.quit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error during benchmark cleanup:', errorMessage);
    }
  }

  public printResults(): void {
    console.log('\nRedis Benchmark Results:');
    console.log('=======================');

    this.results.forEach((result) => {
      console.log(`\nOperation: ${result.operation}`);
      console.log(`Total Time: ${result.totalTime}ms`);

      console.log(`Operations/sec: ${result.opsPerSecond.toFixed(2)}`);
      console.log(`Average Latency: ${result.avgLatency.toFixed(2)}ms`);
      console.log(`P95 Latency: ${result.p95Latency.toFixed(2)}ms`);
      console.log(`P99 Latency: ${result.p99Latency.toFixed(2)}ms`);
      console.log(`Errors: ${result.errors}`);
    });
  }
}

export default RedisBenchmark;
