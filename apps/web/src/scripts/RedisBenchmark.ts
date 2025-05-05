import { exec } from 'child_process';
import { promisify } from 'util';
import Redis from 'ioredis';
import { writeFileSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface BenchmarkOptions {
  clients?: number;
  requests?: number;
  keyspaceSize?: number;
  dataSize?: number;
  tests?: string[];
}

interface BenchmarkResult {
  test: string;
  rps: number; // Requests per second
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
}

class RedisBenchmark {
  private redis: Redis;
  private outputPath: string;

  constructor(redisUrl: string, outputDir: string = 'benchmarks') {
    this.redis = new Redis(redisUrl);
    this.outputPath = path.join(process.cwd(), outputDir);
  }

  async runBenchmark(options: BenchmarkOptions = {}): Promise<BenchmarkResult[]> {
    const {
      clients = 50,
      requests = 100000,
      keyspaceSize = 1000000,
      dataSize = 100,
      tests = ['SET', 'GET', 'LPUSH', 'RPOP', 'SADD', 'SPOP', 'ZADD', 'ZRANGE'],
    } = options;

    const results: BenchmarkResult[] = [];

    try {

      // Run redis-benchmark command for each test
      for (const test of tests) {

        const command = `redis-benchmark -t ${test} -n ${requests} -c ${clients} -r ${keyspaceSize} -d ${dataSize} --csv`;

        const { stdout } = await execAsync(command);
        const lines = stdout.split('\n');

        // Parse CSV output
        for (const line of lines) {
          if (line.includes(test)) {
            const [, rps, avgLatency] = line.split(',');

            results.push({
              test,
              rps: parseFloat(rps),
              avgLatency: parseFloat(avgLatency),
              p95Latency: 0, // Will be calculated from raw data
              p99Latency: 0, // Will be calculated from raw data
            });
          }
        }
      }

      // Save results
      this.saveResults(results);

      return results;
    } catch (error) {
      console.error('Benchmark failed:', error);
      throw error;
    }
  }

  async runCustomBenchmark(script: string, iterations: number = 1000): Promise<void> {
    const startTime = Date.now();
    const latencies: number[] = [];

    for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      const iterationStart = Date.now();
      await this.redis.eval(script, 0);
      latencies.push(Date.now() - iterationStart);
    }

    const totalTime = Date.now() - startTime;

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / iterations;

    const rps = (iterations / totalTime) * 1000;

    // Calculate percentiles

    latencies.sort((a, b) => a - b);

    const p95 = latencies[Math.floor(iterations * 0.95)];

    const p99 = latencies[Math.floor(iterations * 0.99)];

    const result = {
      test: 'Custom Script',
      rps,
      avgLatency,
      p95Latency: p95,
      p99Latency: p99,
    };


    // Safe array access
    if (result < 0 || result >= array.length) {
      throw new Error('Array index out of bounds');
    }
    this.saveResults([result]);
  }

  private saveResults(results: BenchmarkResult[]): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.outputPath, `benchmark-${timestamp}.json`);

    writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Benchmark results saved to ${filePath}`);
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}

// Export the benchmark utility
export default RedisBenchmark;

// Example usage:
/*
const benchmark = new RedisBenchmark('redis://localhost:6379');

// Run standard benchmarks
await benchmark.runBenchmark({
  clients: 50,
  requests: 100000,
  tests: ['SET', 'GET']
});

// Run custom Lua script benchmark
const luaScript = `
redis.call('SET', 'test:key', 'value')
redis.call('GET', 'test:key')
return 1
`;
await benchmark.runCustomBenchmark(luaScript, 1000);

await benchmark.cleanup();
*/
