import Redis from 'ioredis';
import RedisManager from '../config/redis';
import { logger } from '../utils/logger';

jest.mock('ioredis');
jest.mock('../utils/logger');

describe('RedisManager', () => {
  let redisManager: RedisManager;
  const mockConfig = {
    host: 'localhost',
    port: 6379,
    password: 'test-password',
    tls: {
      port: 6380,
      cert: 'test-cert',
      key: 'test-key',
      ca: 'test-ca'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Redis as jest.Mock).mockImplementation(() => ({
      on: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      hset: jest.fn(),
      hget: jest.fn(),
      lpush: jest.fn(),
      lpop: jest.fn(),
      info: jest.fn(),
      bgsave: jest.fn(),
      slaveof: jest.fn(),
      disconnect: jest.fn(),
      options: mockConfig
    }));
  });

  it('should create a singleton instance', () => {
    const instance1 = RedisManager.getInstance(mockConfig);
    const instance2 = RedisManager.getInstance(mockConfig);
    expect(instance1).toBe(instance2);
  });

  it('should initialize with correct configuration', () => {
    redisManager = RedisManager.getInstance(mockConfig);
    expect(Redis).toHaveBeenCalledWith(expect.objectContaining({
      host: mockConfig.host,
      port: mockConfig.port,
      password: mockConfig.password,
      tls: expect.objectContaining({
        port: mockConfig.tls.port,
        cert: mockConfig.tls.cert,
        key: mockConfig.tls.key,
        ca: [mockConfig.tls.ca]
      })
    }));
  });

  it('should run benchmark operations', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const client = redisManager.getClient();
    
    (client.set as jest.Mock).mockResolvedValue('OK');
    (client.get as jest.Mock).mockResolvedValue('value');
    (client.hset as jest.Mock).mockResolvedValue(1);
    (client.hget as jest.Mock).mockResolvedValue('value');
    (client.lpush as jest.Mock).mockResolvedValue(1);
    (client.lpop as jest.Mock).mockResolvedValue('value');

    const results = await redisManager.runBenchmark(100);
    
    expect(results.size).toBe(6);
    expect(results.has('SET')).toBe(true);
    expect(results.has('GET')).toBe(true);
    expect(results.has('HSET')).toBe(true);
    expect(results.has('HGET')).toBe(true);
    expect(results.has('LPUSH')).toBe(true);
    expect(results.has('LPOP')).toBe(true);
  });

  it('should add and remove slaves', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const slaveConfig = { ...mockConfig, port: 6381 };
    
    await redisManager.addSlave(slaveConfig);
    const client = redisManager.getClient();
    expect(Redis).toHaveBeenCalledTimes(2);
    expect(client.slaveof).toHaveBeenCalled();

    await redisManager.removeSlave(slaveConfig.host, slaveConfig.port);
    const slaveMock = (Redis as jest.Mock).mock.results[1].value;
    expect(slaveMock.slaveof).toHaveBeenCalledWith('NO', 'ONE');
    expect(slaveMock.disconnect).toHaveBeenCalled();
  });

  it('should save RDB successfully', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const client = redisManager.getClient();
    (client.bgsave as jest.Mock).mockResolvedValue('OK');

    const result = await redisManager.saveRDB();
    expect(result).toBe(true);
    expect(client.bgsave).toHaveBeenCalled();
  });

  it('should handle RDB save failure', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const client = redisManager.getClient();
    (client.bgsave as jest.Mock).mockRejectedValue(new Error('Save failed'));

    const result = await redisManager.saveRDB();
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith('Error saving RDB:', expect.any(Error));
  });

  it('should parse slave info correctly', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const client = redisManager.getClient();
    const mockInfo = `# Replication
role:master
connected_slaves:2
slave0:ip=10.0.0.1,port=6380,state=online
slave1:ip=10.0.0.2,port=6381,state=online`;

    (client.info as jest.Mock).mockResolvedValue(mockInfo);

    const slaveInfo = await redisManager.getSlaveInfo();
    expect(slaveInfo).toHaveLength(2);
    expect(slaveInfo[0]).toEqual({
      id: '0',
      ip: 'ip=10.0.0.1',
      port: 6380,
      state: 'state=online'
    });
  });

  it('should monitor performance metrics', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const client = redisManager.getClient();
    
    const mockMemoryInfo = 'used_memory:1024\nmaxmemory:2048\n';
    const mockCPUInfo = 'used_cpu_sys:1.5\nused_cpu_user:2.5\n';
    const mockGeneralInfo = 'connected_clients:10\ntotal_connections_received:100\n';

    (client.info as jest.Mock)
      .mockResolvedValueOnce(mockGeneralInfo)
      .mockResolvedValueOnce(mockMemoryInfo)
      .mockResolvedValueOnce(mockCPUInfo);

    jest.useFakeTimers();
    await redisManager.monitorPerformance(1000);
    jest.advanceTimersByTime(1000);

    expect(client.info).toHaveBeenCalledTimes(3);
    expect(logger.info).toHaveBeenCalledWith('Redis Performance Metrics:', expect.any(Object));
  });

  it('should disconnect all clients', async () => {
    redisManager = RedisManager.getInstance(mockConfig);
    const client = redisManager.getClient();
    
    await redisManager.addSlave({ ...mockConfig, port: 6381 });
    await redisManager.addSlave({ ...mockConfig, port: 6382 });

    await redisManager.disconnect();
    expect(client.disconnect).toHaveBeenCalled();
    const slaves = (Redis as jest.Mock).mock.results;
    expect(slaves[1].value.disconnect).toHaveBeenCalled();
    expect(slaves[2].value.disconnect).toHaveBeenCalled();
  });
}); 