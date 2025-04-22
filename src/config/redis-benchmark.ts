import dotenv from 'dotenv';
import Redis, { RedisOptions } from 'ioredis';
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';
import { cpus } from 'os';

dotenv.config();

export interface RedisBenchmarkConfig {
  host: string;
  port: number;
  password?: string | undefined;
  operations: number;
  parallel: number;
  dataSize: number;
  memoryLimit?: number;
  cpuAffinity?: boolean;
  keepAlive?: boolean;
  tls?: {
    enabled: boolean;
    cert?: string | undefined;
    key?: string | undefined;
  };
}

export const redisBenchmarkConfig: RedisBenchmarkConfig = {
  host: process.env['REDIS_HOST'] || 'localhost',
  port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
  password: process.env['REDIS_PASSWORD'],
  operations: parseInt(process.env['REDIS_BENCHMARK_OPERATIONS'] || '10000', 10),
  parallel: parseInt(process.env['REDIS_BENCHMARK_PARALLEL'] || '100', 10),
  dataSize: parseInt(process.env['REDIS_BENCHMARK_DATA_SIZE'] || '1024', 10),
  memoryLimit: parseInt(process.env['REDIS_BENCHMARK_MEMORY_LIMIT'] || '0', 10),
  cpuAffinity: process.env['REDIS_BENCHMARK_CPU_AFFINITY'] === 'true',
  keepAlive: process.env['REDIS_BENCHMARK_KEEP_ALIVE'] === 'true',
  tls: {
    enabled: process.env['REDIS_BENCHMARK_TLS_ENABLED'] === 'true',
    ...(process.env['REDIS_BENCHMARK_TLS_CERT'] && { cert: process.env['REDIS_BENCHMARK_TLS_CERT'] }),
    ...(process.env['REDIS_BENCHMARK_TLS_KEY'] && { key: process.env['REDIS_BENCHMARK_TLS_KEY'] }),
  },
};

export const redisClientConfig: RedisOptions = {
  host: redisBenchmarkConfig.host,
  port: redisBenchmarkConfig.port,
  ...(redisBenchmarkConfig.password && { password: redisBenchmarkConfig.password }),
  maxRetriesPerRequest: 1,
  keepAlive: redisBenchmarkConfig.keepAlive ? 60000 : 0,
  tls: redisBenchmarkConfig.tls?.enabled ? {
    ...(redisBenchmarkConfig.tls.cert && { cert: redisBenchmarkConfig.tls.cert }),
    ...(redisBenchmarkConfig.tls.key && { key: redisBenchmarkConfig.tls.key }),
  } : undefined,
} as RedisOptions;

interface BenchmarkResult {
  operation: string;
  opsPerSecond: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

class RedisBenchmark {
  private redis: Redis;
  private results: Map<string, BenchmarkResult>;
  private memoryUsage: number;
  private cpuUsage: number;
  private info: Record<string, string>;

  constructor(config: RedisBenchmarkConfig) {
    this.redis = new Redis(redisClientConfig);
    this.results = new Map();
    this.memoryUsage = 0;
    this.cpuUsage = 0;
    this.info = {};
  }

  private generateRandomData(size: number): string {
    return 'x'.repeat(size);
  }

  private async measureLatency(
    operation: () => Promise<any>,
    samples: number
  ): Promise<number[]> {
    const latencies: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const start = performance.now();
      await operation();
      latencies.push(performance.now() - start);
    }
    
    return latencies;
  }

  private calculateMetrics(latencies: number[]): {
    average: number;
    p95: number;
    p99: number;
    opsPerSecond: number;
  } {
    const sorted = [...latencies].sort((a, b) => a - b);
    const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      average,
      p95: sorted[p95Index] || average,
      p99: sorted[p99Index] || average,
      opsPerSecond: 1000 / average
    };
  }

  private async monitorResources(): Promise<void> {
    const info = await this.redis.info() || '';
    const memory = /used_memory:(\d+)/.exec(info);
    this.memoryUsage = memory ? parseInt(memory[1], 10) : 0;

    const startCpu = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const endCpu = process.cpuUsage(startCpu);
    this.cpuUsage = (endCpu.user + endCpu.system) / 1000000;
  }

  private async runMemoryTest(): Promise<void> {
    if (!redisBenchmarkConfig.memoryLimit) return;

    const testData = this.generateRandomData(redisBenchmarkConfig.dataSize);
    let keys = 0;

    while (this.memoryUsage < redisBenchmarkConfig.memoryLimit) {
      await this.redis.set(`benchmark:memory:${keys}`, testData);
      keys++;

      if (keys % 1000 === 0) {
        await this.monitorResources();
      }
    }

    this.results.set('MEMORY', {
      operation: 'MEMORY',
      opsPerSecond: keys,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      memoryUsage: this.memoryUsage,
    });
  }

  private async runCpuAffinityTest(): Promise<void> {
    if (!redisBenchmarkConfig.cpuAffinity) return;

    const numCpus = cpus().length;
    const clients = Array.from({ length: numCpus }, () => new Redis(redisClientConfig));
    const testData = this.generateRandomData(redisBenchmarkConfig.dataSize);
    const opsPerCpu = Math.floor(redisBenchmarkConfig.operations / numCpus);

    const cpuLatencies = await Promise.all(
      clients.map((client, index) =>
        this.measureLatency(
          async () => {
            process.env['UV_THREADPOOL_SIZE'] = '1';
            process.env['NODE_WORKER_ID'] = index.toString();
            return await client.set('benchmark:cpu', testData);
          },
          opsPerCpu
        )
      )
    );

    const allLatencies = cpuLatencies.flat();
    const metrics = this.calculateMetrics(allLatencies);

    this.results.set('CPU_AFFINITY', {
      operation: 'CPU_AFFINITY',
      opsPerSecond: metrics.opsPerSecond * numCpus,
      averageLatency: metrics.average,
      p95Latency: metrics.p95,
      p99Latency: metrics.p99,
      cpuUsage: this.cpuUsage,
    });

    await Promise.all(clients.map(client => client.quit()));
  }

  public async runBenchmark(config: RedisBenchmarkConfig): Promise<Map<string, BenchmarkResult>> {
    await this.monitorResources();
    
    const testData = this.generateRandomData(config.dataSize);
    
    // Run basic benchmarks
    await this.runBasicBenchmarks(testData, config);
    
    // Run memory test if configured
    await this.runMemoryTest();
    
    // Run CPU affinity test if configured
    await this.runCpuAffinityTest();

    // Get Redis info for version
    this.info = await this.redis.info().then(info => 
      info.split('\n').reduce((acc: Record<string, string>, line) => {
        const [key, value] = line.split(':');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
      }, {})
    );

    return this.results;
  }

  private async runBasicBenchmarks(testData: string, config: RedisBenchmarkConfig): Promise<void> {
    // SET benchmark
    const setLatencies = await this.measureLatency(
      async () => await this.redis.set('benchmark:key', testData),
      config.operations
    );
    const setMetrics = this.calculateMetrics(setLatencies);
    this.results.set('SET', {
      operation: 'SET',
      opsPerSecond: setMetrics.opsPerSecond,
      averageLatency: setMetrics.average,
      p95Latency: setMetrics.p95,
      p99Latency: setMetrics.p99
    });

    // GET benchmark
    const getLatencies = await this.measureLatency(
      async () => await this.redis.get('benchmark:key'),
      config.operations
    );
    const getMetrics = this.calculateMetrics(getLatencies);
    this.results.set('GET', {
      operation: 'GET',
      opsPerSecond: getMetrics.opsPerSecond,
      averageLatency: getMetrics.average,
      p95Latency: getMetrics.p95,
      p99Latency: getMetrics.p99
    });

    // Pipeline benchmark
    const pipelineLatencies = await this.measureLatency(
      async () => {
        const pipeline = this.redis.pipeline();
        for (let i = 0; i < 100; i++) {
          pipeline.set(`benchmark:pipeline:${i}`, testData);
        }
        await pipeline.exec();
      },
      Math.floor(config.operations / 100)
    );
    const pipelineMetrics = this.calculateMetrics(pipelineLatencies);
    this.results.set('PIPELINE', {
      operation: 'PIPELINE',
      opsPerSecond: pipelineMetrics.opsPerSecond * 100,
      averageLatency: pipelineMetrics.average / 100,
      p95Latency: pipelineMetrics.p95,
      p99Latency: pipelineMetrics.p99
    });
  }

  public printResults(): void {
    console.log('\nRedis Benchmark Results:');
    console.log('=======================\n');

    this.results.forEach((result, operation) => {
      console.log(`${operation}:`);
      console.log(`  Operations/sec: ${result.opsPerSecond.toFixed(2)}`);
      console.log(`  Average Latency: ${result.averageLatency.toFixed(2)}ms`);
      console.log(`  P95 Latency: ${result.p95Latency.toFixed(2)}ms`);
      console.log(`  P99 Latency: ${result.p99Latency.toFixed(2)}ms`);
      
      if ('memoryUsage' in result) {
        console.log(`  Memory Usage: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
      
      if ('cpuUsage' in result) {
        console.log(`  CPU Usage: ${result.cpuUsage.toFixed(2)}%`);
      }
      
      console.log('');
    });

    console.log('System Info:');
    console.log(`  Redis Version: ${this.info['redis_version'] || 'Unknown'}`);
    console.log(`  Memory Usage: ${(this.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  CPU Usage: ${this.cpuUsage.toFixed(2)}%`);
    console.log(`  TLS Enabled: ${redisBenchmarkConfig.tls?.enabled}`);
    console.log(`  Keep-Alive: ${redisBenchmarkConfig.keepAlive}`);
    console.log('');
  }
}

export default RedisBenchmark; 