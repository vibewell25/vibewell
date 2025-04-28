import Redis, { RedisOptions } from 'ioredis';
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';

interface BenchmarkOptions {
  operations?: number;
  dataSize?: number;
  pipeline?: boolean;
  parallel?: number;
  tests?: Array<keyof typeof TEST_OPERATIONS>;
}

interface BenchmarkResult {
  name: string;
  opsPerSecond: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  memoryUsed: number;
}

interface TLSConfig {
  port: number;
  cert: string;
  key: string;
  ca: string;
  protocols?: string[];
  cipherSuite?: string;
  preferServerCiphers?: boolean;
  sessionTimeout?: number;
  rejectUnauthorized?: boolean;
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  tls?: TLSConfig | TLSConfig[]; // Support for multiple TLS configurations
  replication?: {
    role: 'master' | 'slave';
    masterHost?: string;
    masterPort?: number;
    masterAuth?: string;
  };
  benchmark?: BenchmarkOptions;
}

const TEST_OPERATIONS = {
  SET: (client: Redis, data: string) => client.set(`benchmark:key:${Math.random()}`, data),
  GET: (client: Redis) => client.get('benchmark:key:1'),
  HSET: (client: Redis, data: string) =>
    client.hset(`benchmark:hash:${Math.random()}`, 'field', data),
  HGET: (client: Redis) => client.hget('benchmark:hash:1', 'field'),
  LPUSH: (client: Redis, data: string) => client.lpush(`benchmark:list:${Math.random()}`, data),
  LPOP: (client: Redis) => client.lpop('benchmark:list:1'),
  SADD: (client: Redis, data: string) => client.sadd(`benchmark:set:${Math.random()}`, data),
  SPOP: (client: Redis) => client.spop('benchmark:set:1'),
  ZADD: (client: Redis, data: string) =>
    client.zadd(`benchmark:zset:${Math.random()}`, Math.random(), data),
  ZRANGE: (client: Redis) => client.zrange('benchmark:zset:1', 0, -1),
} as const;

class RedisManager {
  private static instance: RedisManager;
  private client: Redis;
  private tlsClients: Map<number, Redis> = new Map();
  private slaves: Redis[] = [];
  private benchmarkResults: Map<string, number> = new Map();

  private constructor(config: RedisConfig) {
    const redisOptions: RedisOptions = {
      host: config.host,
      port: config.port,
      ...(config.password && { password: config.password }),
      ...(config.tls &&
        !Array.isArray(config.tls) && {
          tls: {
            cert: config.tls.cert,
            key: config.tls.key,
            ca: [config.tls.ca],
          },
        }),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // Initialize main client
    this.client = new Redis(redisOptions);

    // Initialize TLS clients if configured
    if (config.tls) {
      const tlsConfigs = Array.isArray(config.tls) ? config.tls : [config.tls];
      for (const tlsConfig of tlsConfigs) {
        const tlsOptions: RedisOptions = {
          ...redisOptions,
          port: tlsConfig.port,
          tls: {
            cert: tlsConfig.cert,
            key: tlsConfig.key,
            ca: [tlsConfig.ca],
            ...(tlsConfig.protocols && { secureProtocol: tlsConfig.protocols.join(' ') }),
            ...(tlsConfig.cipherSuite && { ciphers: tlsConfig.cipherSuite }),
            ...(tlsConfig.preferServerCiphers !== undefined && {
              honorCipherOrder: tlsConfig.preferServerCiphers,
            }),
            ...(tlsConfig.sessionTimeout !== undefined && {
              sessionTimeout: tlsConfig.sessionTimeout,
            }),
            ...(tlsConfig.rejectUnauthorized !== undefined && {
              rejectUnauthorized: tlsConfig.rejectUnauthorized,
            }),
          },
        };

        const tlsClient = new Redis(tlsOptions);
        this.tlsClients.set(tlsConfig.port, tlsClient);
        this.setupEventHandlers(tlsClient, `TLS Client (Port ${tlsConfig.port})`);
      }
    }

    // Setup replication if configured
    if (config.replication) {
      if (config.replication.role === 'slave' && config.replication.masterHost) {
        this.client.slaveof(config.replication.masterHost, config.replication.masterPort ?? 6379);
      }
    }

    this.setupEventHandlers(this.client, 'Main Client');
  }

  private setupEventHandlers(client: Redis, clientName: string) {
    client.on('error', (error: Error) => {
      logger.error(`Redis ${clientName} error:`, error.message);
    });

    client.on('connect', () => {
      logger.info(`Connected to Redis (${clientName})`);
    });

    client.on('ready', () => {
      logger.info(`Redis ${clientName} is ready`);
    });
  }

  public static getInstance(config: RedisConfig): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager(config);
    }
    return RedisManager.instance;
  }

  private async measureLatency(operation: () => Promise<any>, samples: number): Promise<number[]> {
    const latencies: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = performance.now();
      await operation();
      const end = performance.now();
      latencies.push(end - start);
    }

    return latencies;
  }

  private calculatePercentile(latencies: number[], percentile: number): number {
    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] ?? 0; // Provide default value if undefined
  }

  public async runBenchmark(options: BenchmarkOptions = {}): Promise<BenchmarkResult[]> {
    const {
      operations = 1000,
      dataSize = 100,
      pipeline = false,
      parallel = 1,
      tests = Object.keys(TEST_OPERATIONS) as Array<keyof typeof TEST_OPERATIONS>,
    } = options;

    const results: BenchmarkResult[] = [];
    const testData = 'x'.repeat(dataSize);

    for (const testName of tests) {
      const operation = TEST_OPERATIONS[testName];
      const start = performance.now();
      const latencies: number[] = [];

      if (pipeline) {
        const pipeline = this.client.pipeline();
        for (let i = 0; i < operations; i++) {
          pipeline.call(testName, () => operation(this.client, testData));
        }
        await pipeline.exec();
      } else if (parallel > 1) {
        const batchSize = Math.ceil(operations / parallel);
        const batches = Array(parallel)
          .fill(null)
          .map(() =>
            Array(batchSize)
              .fill(null)
              .map(() => operation(this.client, testData)),
          );
        await Promise.all(batches.map((batch) => Promise.all(batch)));
      } else {
        const operationLatencies = await this.measureLatency(
          () => operation(this.client, testData),
          operations,
        );
        latencies.push(...operationLatencies);
      }

      const end = performance.now();
      const totalTime = (end - start) / 1000;
      const opsPerSecond = operations / totalTime;

      const memoryInfo = await this.client.info('memory');
      const memoryBefore = memoryInfo.match(/used_memory:(\d+)/)?.[1];
      const memoryAfter = memoryInfo.match(/used_memory:(\d+)/)?.[1];
      const memoryUsed =
        memoryBefore && memoryAfter ? parseInt(memoryAfter) - parseInt(memoryBefore) : 0;

      results.push({
        name: testName,
        opsPerSecond,
        averageLatency: latencies.length
          ? latencies.reduce((a, b) => a + b, 0) / latencies.length
          : 0,
        p95Latency: latencies.length ? this.calculatePercentile(latencies, 95) : 0,
        p99Latency: latencies.length ? this.calculatePercentile(latencies, 99) : 0,
        memoryUsed,
      });

      // Clean up test data
      await this.client.del(`benchmark:${testName.toLowerCase()}:*`);
    }

    return results;
  }

  public async generateBenchmarkReport(options?: BenchmarkOptions): Promise<string> {
    const results = await this.runBenchmark(options);
    let report = '=== Redis Benchmark Report ===\n\n';

    report += `Time: ${new Date().toISOString()}\n`;
    report += `Host: ${this.client.options.host}:${this.client.options.port}\n`;
    report += `Operations: ${options?.operations || 1000}\n`;
    report += `Data Size: ${options?.dataSize || 100} bytes\n`;
    report += `Pipeline: ${options?.pipeline ? 'Yes' : 'No'}\n`;
    report += `Parallel Connections: ${options?.parallel || 1}\n\n`;

    report += 'Results:\n';
    report += '-'.repeat(80) + '\n';
    report +=
      'Operation'.padEnd(15) +
      'Ops/sec'.padEnd(15) +
      'Avg Latency'.padEnd(15) +
      'P95 Latency'.padEnd(15) +
      'P99 Latency'.padEnd(15) +
      'Memory Used\n';
    report += '-'.repeat(80) + '\n';

    for (const result of results) {
      report +=
        `${result.name.padEnd(15)}` +
        `${Math.round(result.opsPerSecond).toString().padEnd(15)}` +
        `${Math.round(result.averageLatency)}ms`.padEnd(15) +
        `${Math.round(result.p95Latency)}ms`.padEnd(15) +
        `${Math.round(result.p99Latency)}ms`.padEnd(15) +
        `${Math.round(result.memoryUsed / 1024)}KB\n`;
    }

    return report;
  }

  public async addSlave(config: RedisConfig): Promise<void> {
    const redisOptions: RedisOptions = {
      host: config.host,
      port: config.port,
      ...(config.password && { password: config.password }),
      ...(config.tls &&
        !Array.isArray(config.tls) && {
          tls: {
            port: config.tls.port,
            cert: config.tls.cert,
            key: config.tls.key,
            ca: [config.tls.ca],
          },
        }),
    };

    const slave = new Redis(redisOptions);

    const host = this.client.options.host;
    const port = this.client.options.port;

    if (typeof host === 'string' && typeof port === 'number') {
      await slave.slaveof(host, port);
      this.slaves.push(slave);
    }
  }

  public async removeSlave(host: string, port: number): Promise<void> {
    const index = this.slaves.findIndex(
      (slave) => slave.options.host === host && slave.options.port === port,
    );

    if (index !== -1) {
      const slave = this.slaves[index];
      if (slave) {
        await slave.slaveof('NO', 'ONE');
        await slave.disconnect();
        this.slaves.splice(index, 1);
      }
    }
  }

  public async saveRDB(filename?: string): Promise<boolean> {
    try {
      if (filename) {
        // Use SAVE for synchronous save with custom filename
        await this.client.config('SET', 'dbfilename', filename);
        await this.client.save();
      } else {
        // Use BGSAVE for asynchronous save
        await this.client.bgsave();
      }

      // Wait for save to complete
      let saving = true;
      while (saving) {
        const info = await this.client.info('persistence');
        saving = info.includes('rdb_bgsave_in_progress:1');
        if (saving) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return true;
    } catch (error) {
      logger.error('Error saving RDB:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  public async configureRDB(options: {
    saveFrequency?: { seconds: number; changes: number }[];
    compression?: boolean;
    filename?: string;
  }): Promise<void> {
    try {
      // Configure save points
      if (options.saveFrequency) {
        // First, disable all existing save points
        await this.client.config('SET', 'save', '');

        // Then add new save points
        for (const { seconds, changes } of options.saveFrequency) {
          await this.client.config('SET', 'save', `${seconds} ${changes}`);
        }
      }

      // Configure compression
      if (typeof options.compression === 'boolean') {
        await this.client.config('SET', 'rdbcompression', options.compression ? 'yes' : 'no');
      }

      // Configure filename
      if (options.filename) {
        await this.client.config('SET', 'dbfilename', options.filename);
      }
    } catch (error) {
      logger.error(
        'Error configuring RDB:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  public async configureSlave(options: {
    masterHost: string;
    masterPort: number;
    masterAuth?: string;
    readonly?: boolean;
    priority?: number;
    serverId?: number;
  }): Promise<void> {
    try {
      // Configure slave
      await this.client.slaveof(options.masterHost, options.masterPort);

      if (options.masterAuth) {
        await this.client.auth(options.masterAuth);
      }

      if (typeof options.readonly === 'boolean') {
        await this.client.config('SET', 'slave-read-only', options.readonly ? 'yes' : 'no');
      }

      if (typeof options.priority === 'number') {
        await this.client.config('SET', 'slave-priority', options.priority.toString());
      }

      if (typeof options.serverId === 'number') {
        await this.client.config('SET', 'replica-announce-id', options.serverId.toString());
      }

      // Wait for sync to start
      let syncing = true;
      while (syncing) {
        const info = await this.client.info('replication');
        const syncStatus = info.match(/master_sync_in_progress:(\d)/)?.[1];
        syncing = syncStatus === '1';
        if (syncing) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      logger.error(
        'Error configuring slave:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  public async getReplicationStatus(): Promise<{
    role: string;
    connectedSlaves: number;
    slaves: Array<{
      id: string;
      ip: string;
      port: number;
      state: string;
      offset: number;
      lag: number;
    }>;
  }> {
    const info = await this.client.info('replication');
    const role = info.match(/role:(\w+)/)?.[1] || 'unknown';
    const connectedSlaves = parseInt(info.match(/connected_slaves:(\d+)/)?.[1] || '0');

    const slaves = [];
    for (let i = 0; i < connectedSlaves; i++) {
      const slaveInfo = info.match(new RegExp(`slave${i}:([^\n]+)`))?.[1];
      if (slaveInfo) {
        const [ip = '', port = '0', state = '', offset = '0', lag = '0'] = slaveInfo.split(',');
        slaves.push({
          id: `slave${i}`,
          ip: ip || 'unknown',
          port: parseInt(port),
          state: state || 'unknown',
          offset: parseInt(offset),
          lag: parseInt(lag),
        });
      }
    }

    return {
      role,
      connectedSlaves,
      slaves,
    };
  }

  public async getSlaveInfo(): Promise<any[]> {
    const info = await this.client.info('replication');
    return this.parseSlaveInfo(info);
  }

  private parseSlaveInfo(info: string): any[] {
    const slaves: any[] = [];
    const lines = info.split('\n');

    for (const line of lines) {
      if (line.startsWith('slave')) {
        const parts = line.split(':');
        if (parts.length < 2) continue;

        const [, index] = parts;
        const details = parts[2];
        if (!details) continue;

        const slaveDetails = details.split(',');
        if (slaveDetails.length < 3) continue;

        slaves.push({
          id: index,
          ip: slaveDetails[0] || 'unknown',
          port: parseInt(slaveDetails[1] || '0'),
          state: slaveDetails[2] || 'unknown',
        });
      }
    }

    return slaves;
  }

  public async monitorPerformance(interval: number = 5000): Promise<void> {
    setInterval(async () => {
      const info = await this.client.info();
      const memory = await this.client.info('memory');
      const cpu = await this.client.info('cpu');

      const metrics = {
        memory: this.parseMemoryInfo(memory),
        cpu: this.parseCPUInfo(cpu),
        general: this.parseGeneralInfo(info),
      };

      logger.info('Redis Performance Metrics: ' + JSON.stringify(metrics));
    }, interval);
  }

  private parseMemoryInfo(info: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (line.includes('used_memory') || line.includes('maxmemory')) {
        const parts = line.split(':');
        if (parts.length !== 2) continue;
        const [key, value] = parts;
        if (key && value) {
          metrics[key] = parseInt(value) || 0;
        }
      }
    }

    return metrics;
  }

  private parseCPUInfo(info: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (line.includes('used_cpu')) {
        const parts = line.split(':');
        if (parts.length !== 2) continue;
        const [key, value] = parts;
        if (key && value) {
          metrics[key] = parseFloat(value) || 0;
        }
      }
    }

    return metrics;
  }

  private parseGeneralInfo(info: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (
        line.includes('connected_clients') ||
        line.includes('total_connections_received') ||
        line.includes('total_commands_processed')
      ) {
        const parts = line.split(':');
        if (parts.length !== 2) continue;
        const [key, value] = parts;
        if (key && value) {
          metrics[key] = parseInt(value) || 0;
        }
      }
    }

    return metrics;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    for (const slave of this.slaves) {
      await slave.disconnect();
    }
  }

  public async configureTLS(options: TLSConfig | number[]): Promise<void> {
    if (Array.isArray(options)) {
      for (const port of options) {
        await this.client.config('SET', 'tls-port', port.toString());
      }
      return;
    }
    const config = options as TLSConfig;
    try {
      // Configure TLS settings
      const port = config.port.toString();
      await this.client.config('SET', 'tls-port', port);

      if (config.cert) {
        await this.client.config('SET', 'tls-cert-file', config.cert);
      }

      if (config.key) {
        await this.client.config('SET', 'tls-key-file', config.key);
      }

      if (config.ca) {
        await this.client.config('SET', 'tls-ca-cert-file', config.ca);
      }

      if (config.protocols) {
        await this.client.config('SET', 'tls-protocols', config.protocols.join(' '));
      }

      if (config.cipherSuite) {
        await this.client.config('SET', 'tls-ciphers', config.cipherSuite);
      }

      if (typeof config.preferServerCiphers === 'boolean') {
        await this.client.config(
          'SET',
          'tls-prefer-server-ciphers',
          config.preferServerCiphers ? 'yes' : 'no',
        );
      }

      if (typeof config.sessionTimeout === 'number') {
        await this.client.config('SET', 'tls-session-timeout', config.sessionTimeout.toString());
      }

      // Create new TLS client
      const tlsOptions: RedisOptions = {
        host: this.client.options.host as string,
        port: config.port,
        ...(this.client.options.password && { password: this.client.options.password }),
        tls: {
          cert: config.cert,
          key: config.key,
          ca: [config.ca],
          ...(config.protocols && { secureProtocol: config.protocols.join(' ') }),
          ...(config.cipherSuite && { ciphers: config.cipherSuite }),
          ...(config.preferServerCiphers !== undefined && {
            honorCipherOrder: config.preferServerCiphers,
          }),
          ...(config.sessionTimeout !== undefined && { sessionTimeout: config.sessionTimeout }),
          ...(config.rejectUnauthorized !== undefined && {
            rejectUnauthorized: config.rejectUnauthorized,
          }),
        },
      };

      const tlsClient = new Redis(tlsOptions);
      this.tlsClients.set(config.port, tlsClient);
      this.setupEventHandlers(tlsClient, `TLS Client (Port ${config.port})`);
    } catch (error) {
      logger.error(
        'Error configuring TLS:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  public getTLSClient(port: number): Redis | undefined {
    return this.tlsClients.get(port);
  }

  public async getTLSStatus(): Promise<{
    enabled: boolean;
    ports: number[];
    activeConnections: number;
    authClients: string;
  }> {
    const info = await this.client.info('server');
    return {
      enabled: info.includes('tls_enabled:1'),
      ports: Array.from(this.tlsClients.keys()),
      activeConnections: this.tlsClients.size,
      authClients: info.match(/tls_auth_clients:(\w+)/)?.[1] || 'unknown',
    };
  }

  public async getSlaveClients(): Promise<Redis[]> {
    return this.slaves;
  }

  public async enableRDB(options: { filename: string; frequency: number }): Promise<void> {
    await this.client.config('SET', 'dbfilename', options.filename);
    await this.client.config('SET', 'save', `${options.frequency} 1`);
  }

  public parseBenchmarkResults(
    output: string,
  ): Record<string, { requestsPerSecond: number; averageLatency: number }> {
    const results: Record<string, { requestsPerSecond: number; averageLatency: number }> = {};
    for (const line of output.trim().split('\n')) {
      const [name, ops, lat] = line.split(',');
      results[name] = { requestsPerSecond: Number(ops), averageLatency: Number(lat) };
    }
    return results;
  }
}

export default RedisManager;
