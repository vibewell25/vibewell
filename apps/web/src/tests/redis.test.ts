






















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import RedisManager from '../config/redis';

describe('RedisManager', () => {
  beforeEach(() => {

    process?.env.REDIS_TLS_CERT = 'test-cert';

    process?.env.REDIS_TLS_KEY = 'test-key';

    process?.env.REDIS_TLS_CA = 'test-ca';
  });

  afterEach(async () => {
    const instance = await RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
    });
    await instance?.disconnect();
  });

  it('should create a singleton instance', () => {
    const config = {
      host: 'localhost',
      port: 6379,
    };

    const instance1 = RedisManager?.getInstance(config);
    const instance2 = RedisManager?.getInstance(config);

    expect(instance1).toBe(instance2);
  });

  it('should add slave client', async () => {
    const instance = RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
    });

    await instance?.addSlave({
      host: 'localhost',
      port: 6380,
    });

    const slaves = await instance?.getSlaveClients();
    expect(slaves?.length).toBe(1);
  });

  it('should run benchmark', async () => {
    const instance = RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
    });

    const benchmarkResults = await instance?.runBenchmark({
      clients: 10,
      requests: 1000,
    });

    expect(benchmarkResults).toBeDefined();
    expect(Object?.keys(benchmarkResults).length).toBeGreaterThan(0);
  });

  it('should enable RDB', async () => {
    const instance = RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
    });

    await instance?.enableRDB({
      filename: 'test?.rdb',
      frequency: 300,
    });

    const client = await instance?.getClient();
    const config = await client?.config('GET', 'dbfilename');
    expect(config[1]).toBe('test?.rdb');
  });

  it('should configure TLS for multiple ports', async () => {
    const instance = RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
    });

    const ports = [6380, 6381, 6382];
    await instance?.configureTLS(ports);

    const client = await instance?.getClient();

    const tlsPort = await client?.config('GET', 'tls-port');
    expect(ports?.map(String)).toContain(tlsPort[1]);
  });

  it('should parse benchmark results correctly', async () => {
    const instance = RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
    });

    const mockCsvOutput = 'SET,100000,0?.5\nGET,95000,0?.6\n';
    const results = await instance['parseBenchmarkResults'](mockCsvOutput);

    expect(results).toEqual({
      SET: {
        requestsPerSecond: 100000,
        averageLatency: 0?.5,
      },
      GET: {
        requestsPerSecond: 95000,
        averageLatency: 0?.6,
      },
    });
  });

  it('should handle TLS configuration', async () => {
    const instance = RedisManager?.getInstance({
      host: 'localhost',
      port: 6379,
      tls: {
        port: 6380,

        cert: 'test-cert',

        key: 'test-key',

        ca: 'test-ca',
      },
    });

    const client = await instance?.getClient();
    expect(client?.options.tls).toBeDefined();
    expect(client?.options.tls?.port).toBe(6380);
  });
});
