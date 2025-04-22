import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: {
    key: string;
    cert: string;
    ca: string;
  };
  cluster?: {
    nodes: Array<{ host: string; port: number }>;
    options?: Record<string, any>;
  };
  slave?: {
    host: string;
    port: number;
    password?: string;
  };
  benchmark?: {
    clients: number;
    requests: number;
    dataSize: number;
    keyspace: number;
  };
}

interface BenchmarkResult {
  summary: {
    totalRequests: number;
    totalTime: number;
    requestsPerSecond: number;
    averageLatency: number;
  };
  details: {
    operations: Array<{
      name: string;
      requests: number;
      latency: number;
    }>;
  };
}

class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private slave?: Redis;
  private config: RedisConfig;

  private constructor(config: RedisConfig) {
    this.config = config;
    this.initializeRedis();
  }

  public static getInstance(config?: RedisConfig): RedisService {
    if (!RedisService.instance && config) {
      RedisService.instance = new RedisService(config);
    }
    return RedisService.instance;
  }

  private initializeRedis(): void {
    // Initialize main Redis client
    const options: Redis.RedisOptions = {
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };

    // Configure TLS if provided
    if (this.config.tls) {
      options.tls = {
        key: fs.readFileSync(this.config.tls.key),
        cert: fs.readFileSync(this.config.tls.cert),
        ca: fs.readFileSync(this.config.tls.ca)
      };
    }

    // Initialize cluster if configured
    if (this.config.cluster) {
      this.client = new Redis.Cluster(
        this.config.cluster.nodes,
        {
          redisOptions: options,
          ...this.config.cluster.options
        }
      );
    } else {
      this.client = new Redis(options);
    }

    // Initialize slave if configured
    if (this.config.slave) {
      this.slave = new Redis({
        host: this.config.slave.host,
        port: this.config.slave.port,
        password: this.config.slave.password,
        readonly: true
      });
    }

    // Handle events
    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    if (this.slave) {
      this.slave.on('error', (error) => {
        console.error('Redis slave error:', error);
      });

      this.slave.on('connect', () => {
        console.log('Connected to Redis slave');
      });
    }
  }

  // Basic operations
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      throw error;
    }
  }

  public async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    try {
      if (expireSeconds) {
        await this.client.set(key, value, 'EX', expireSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  }

  // RDB operations
  public async saveRDB(filename: string): Promise<void> {
    try {
      await this.client.save();
      const rdbPath = await this.client.config('get', 'dir');
      const sourcePath = path.join(rdbPath[1], 'dump.rdb');
      await fs.promises.copyFile(sourcePath, filename);
    } catch (error) {
      console.error('RDB save error:', error);
      throw error;
    }
  }

  public async loadRDB(filename: string): Promise<void> {
    try {
      const rdbPath = await this.client.config('get', 'dir');
      const targetPath = path.join(rdbPath[1], 'dump.rdb');
      await fs.promises.copyFile(filename, targetPath);
      await this.client.config('resetstat');
      await this.client.flushall();
      await this.client.shutdown();
    } catch (error) {
      console.error('RDB load error:', error);
      throw error;
    }
  }

  // Slave operations
  public async enableSlaveOf(masterHost: string, masterPort: number): Promise<void> {
    try {
      await this.client.slaveof(masterHost, masterPort);
    } catch (error) {
      console.error('Slave configuration error:', error);
      throw error;
    }
  }

  public async disableSlaveOf(): Promise<void> {
    try {
      await this.client.slaveof('NO', 'ONE');
    } catch (error) {
      console.error('Slave configuration error:', error);
      throw error;
    }
  }

  // Benchmark operations
  public async runBenchmark(options?: Partial<RedisConfig['benchmark']>): Promise<BenchmarkResult> {
    const benchmarkConfig = {
      clients: options?.clients || 50,
      requests: options?.requests || 100000,
      dataSize: options?.dataSize || 3,
      keyspace: options?.keyspace || 100000
    };

    try {
      const { stdout } = await execAsync(
        `redis-benchmark -h ${this.config.host} -p ${this.config.port} ` +
        `-c ${benchmarkConfig.clients} -n ${benchmarkConfig.requests} ` +
        `-d ${benchmarkConfig.dataSize} -r ${benchmarkConfig.keyspace} --csv`
      );

      const lines = stdout.split('\n');
      const operations = lines.slice(1).filter(Boolean).map(line => {
        const [name, requests, latency] = line.split(',');
        return {
          name,
          requests: parseInt(requests, 10),
          latency: parseFloat(latency)
        };
      });

      const summary = {
        totalRequests: benchmarkConfig.requests,
        totalTime: operations.reduce((acc, op) => acc + op.latency, 0),
        requestsPerSecond: operations.reduce((acc, op) => acc + op.requests, 0) / operations.length,
        averageLatency: operations.reduce((acc, op) => acc + op.latency, 0) / operations.length
      };

      return {
        summary,
        details: { operations }
      };
    } catch (error) {
      console.error('Benchmark error:', error);
      throw error;
    }
  }

  // Monitoring and stats
  public async getStats(): Promise<Record<string, any>> {
    try {
      const info = await this.client.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      console.error('Stats error:', error);
      throw error;
    }
  }

  private parseRedisInfo(info: string): Record<string, any> {
    const sections: Record<string, any> = {};
    let currentSection = '';

    info.split('\n').forEach(line => {
      if (line.startsWith('#')) {
        currentSection = line.substring(2).toLowerCase();
        sections[currentSection] = {};
      } else if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (currentSection && key) {
          sections[currentSection][key.trim()] = value.trim();
        }
      }
    });

    return sections;
  }

  // Cleanup
  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      if (this.slave) {
        await this.slave.quit();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }
}

export default RedisService; 