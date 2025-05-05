import Redis from 'ioredis';
import fs from 'fs';
import { exec } from 'child_process';

    import RedisService from '../redis/RedisService';

// Mock dependencies
jest.mock('ioredis');
jest.mock('fs');
jest.mock('child_process');

describe('RedisService', () => {
  let redisService: typeof RedisService;
  const mockConfig = {
    host: 'localhost',
    port: 6379,

    password: 'test-password',
    tls: {

    key: '/path/to/key.pem',

    cert: '/path/to/cert.pem',

    ca: '/path/to/ca.pem'
slave: {
      host: 'slave.host',
      port: 6380,

    password: 'slave-password'
benchmark: {
      clients: 50,
      requests: 10000,
      dataSize: 3,
      keyspace: 10000
};

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Redis client methods
    (Redis as jest.Mock).mockImplementation(() => ({
      on: jest.fn(),
      get: jest.fn().mockResolvedValue('value'),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      save: jest.fn().mockResolvedValue('OK'),
      config: jest.fn().mockResolvedValue(['dir', '/tmp']),
      flushall: jest.fn().mockResolvedValue('OK'),
      shutdown: jest.fn().mockResolvedValue('OK'),
      slaveof: jest.fn().mockResolvedValue('OK'),
      info: jest.fn().mockResolvedValue('# Server\nredis_version:6.0.0\n# Clients\nconnected_clients:1'),
      quit: jest.fn().mockResolvedValue('OK')
));

    // Mock fs methods

    (fs.readFileSync as jest.Mock).mockReturnValue('mock-cert-content');
    (fs.promises.copyFile as jest.Mock).mockResolvedValue(undefined);

    // Mock exec
    (exec as unknown as jest.Mock).mockImplementation((command, callback) => {
      callback(null, {
        stdout: 'SET,100000,1.23\nGET,100000,1.45\n',
        stderr: ''
redisService = RedisService.getInstance(mockConfig);
describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = RedisService.getInstance(mockConfig);
      expect(instance).toBeDefined();
      expect(Redis).toHaveBeenCalledWith(expect.any(Object));
it('should return existing instance without config', () => {
      const instance1 = RedisService.getInstance(mockConfig);
      const instance2 = RedisService.getInstance();
      expect(instance1).toBe(instance2);
it('should initialize with TLS configuration', () => {
      RedisService.getInstance(mockConfig);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockConfig.tls.key);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockConfig.tls.cert);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockConfig.tls.ca);
it('should initialize slave if configured', () => {
      RedisService.getInstance(mockConfig);
      expect(Redis).toHaveBeenCalledWith(expect.objectContaining({
        host: mockConfig.slave.host,
        port: mockConfig.slave.port,
        password: mockConfig.slave.password,
        readonly: true
));
describe('Basic Operations', () => {
    it('should get a value', async () => {

    const result = await redisService.get('test-key');
      expect(result).toBe('value');
it('should set a value', async () => {

    await redisService.set('test-key', 'test-value');

    expect(Redis.prototype.set).toHaveBeenCalledWith('test-key', 'test-value');
it('should set a value with expiration', async () => {

    await redisService.set('test-key', 'test-value', 60);

    expect(Redis.prototype.set).toHaveBeenCalledWith('test-key', 'test-value', 'EX', 60);
it('should delete a key', async () => {

    await redisService.delete('test-key');

    expect(Redis.prototype.del).toHaveBeenCalledWith('test-key');
it('should handle operation errors', async () => {
      const error = new Error('Redis error');
      (Redis.prototype.get as jest.Mock).mockRejectedValue(error);
      

    await expect(redisService.get('test-key')).rejects.toThrow('Redis error');
describe('RDB Operations', () => {
    it('should save RDB file', async () => {
      await redisService.saveRDB('backup.rdb');
      expect(Redis.prototype.save).toHaveBeenCalled();
      expect(fs.promises.copyFile).toHaveBeenCalled();
it('should load RDB file', async () => {
      await redisService.loadRDB('backup.rdb');
      expect(fs.promises.copyFile).toHaveBeenCalled();
      expect(Redis.prototype.config).toHaveBeenCalled();
      expect(Redis.prototype.flushall).toHaveBeenCalled();
      expect(Redis.prototype.shutdown).toHaveBeenCalled();
it('should handle RDB operation errors', async () => {
      const error = new Error('RDB error');
      (Redis.prototype.save as jest.Mock).mockRejectedValue(error);
      
      await expect(redisService.saveRDB('backup.rdb')).rejects.toThrow('RDB error');
describe('Slave Operations', () => {
    it('should enable slave mode', async () => {
      await redisService.enableSlaveOf('master.host', 6379);
      expect(Redis.prototype.slaveof).toHaveBeenCalledWith('master.host', 6379);
it('should disable slave mode', async () => {
      await redisService.disableSlaveOf();
      expect(Redis.prototype.slaveof).toHaveBeenCalledWith('NO', 'ONE');
it('should handle slave operation errors', async () => {
      const error = new Error('Slave error');
      (Redis.prototype.slaveof as jest.Mock).mockRejectedValue(error);
      
      await expect(redisService.enableSlaveOf('master.host', 6379)).rejects.toThrow('Slave error');
describe('Benchmark Operations', () => {
    it('should run benchmark', async () => {
      const result = await redisService.runBenchmark();
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('details');
      expect(result.summary).toHaveProperty('totalRequests');
      expect(result.summary).toHaveProperty('requestsPerSecond');
it('should run benchmark with custom options', async () => {
      const options = {
        clients: 100,
        requests: 50000,
        dataSize: 1,
        keyspace: 5000
await redisService.runBenchmark(options);
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining(`-c ${options.clients}`),
        expect.any(Function)
it('should handle benchmark errors', async () => {
      (exec as unknown as jest.Mock).mockImplementation((command, callback) => {
        callback(new Error('Benchmark error'), null);
await expect(redisService.runBenchmark()).rejects.toThrow('Benchmark error');
describe('Monitoring and Stats', () => {
    it('should get Redis stats', async () => {
      const stats = await redisService.getStats();
      expect(stats).toHaveProperty('server');
      expect(stats).toHaveProperty('clients');
it('should parse Redis info correctly', async () => {
      const stats = await redisService.getStats();
      expect(stats.server.redis_version).toBe('6.0.0');
      expect(stats.clients.connected_clients).toBe('1');
it('should handle stats errors', async () => {
      const error = new Error('Stats error');
      (Redis.prototype.info as jest.Mock).mockRejectedValue(error);
      
      await expect(redisService.getStats()).rejects.toThrow('Stats error');
describe('Cleanup', () => {
    it('should disconnect clients', async () => {
      await redisService.disconnect();
      expect(Redis.prototype.quit).toHaveBeenCalled();
it('should handle disconnect errors', async () => {
      const error = new Error('Disconnect error');
      (Redis.prototype.quit as jest.Mock).mockRejectedValue(error);
      
      await expect(redisService.disconnect()).rejects.toThrow('Disconnect error');
