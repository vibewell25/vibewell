import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: {
    cert: string;
    key: string;
    ca: string;
interface SlaveConfig extends RedisConfig {
  masterHost: string;
  masterPort: number;
  masterPassword?: string;
class RedisManager extends EventEmitter {
  private master: Redis | null = null;
  private slaves: Map<string, Redis> = new Map();
  private rdbPath: string;


  constructor(rdbDir: string = 'redis-data') {
    super();
    this.rdbPath = path.join(process.cwd(), rdbDir);
    if (!fs.existsSync(this.rdbPath)) {
      fs.mkdirSync(this.rdbPath, { recursive: true });
async initializeMaster(config: RedisConfig): Promise<void> {
    try {
      this.master = new Redis({
        ...config,
        lazyConnect: true,

        retryStrategy: (times) => Math.min(times * 50, 2000),
await this.master.connect();

      // Configure RDB persistence
      await this.master.config('SET', 'dir', this.rdbPath);
      await this.master.config('SET', 'dbfilename', 'dump.rdb');
      await this.master.config('SET', 'save', '900 1 300 10 60 10000');

      this.master.on('error', (error) => {
        this.emit('error', { type: 'master', error });
this.master.on('ready', () => {
        this.emit('ready', { type: 'master' });
console.log('Redis master initialized successfully');
catch (error) {
      console.error('Failed to initialize Redis master:', error);
      throw error;
async addSlave(id: string, config: SlaveConfig): Promise<void> {
    try {
      const slave = new Redis({
        ...config,
        lazyConnect: true,

        retryStrategy: (times) => Math.min(times * 50, 2000),
await slave.connect();

      // Configure as slave
      await slave.slaveof(config.masterHost, config.masterPort);

      if (config.masterPassword) {
        await slave.auth(config.masterPassword);
slave.on('error', (error) => {
        this.emit('error', { type: 'slave', id, error });
slave.on('ready', () => {
        this.emit('ready', { type: 'slave', id });
this.slaves.set(id, slave);
      console.log(`Redis slave ${id} initialized successfully`);
catch (error) {
      console.error(`Failed to initialize Redis slave ${id}:`, error);
      throw error;
async removeSlave(id: string): Promise<void> {
    const slave = this.slaves.get(id);
    if (slave) {
      await slave.quit();
      this.slaves.delete(id);
      console.log(`Redis slave ${id} removed`);
async saveRDB(): Promise<void> {
    if (!this.master) {
      throw new Error('Master not initialized');
try {
      await this.master.bgsave();
      console.log('RDB save initiated');
catch (error) {
      console.error('Failed to initiate RDB save:', error);
      throw error;
async loadRDB(filePath: string): Promise<void> {
    if (!this.master) {
      throw new Error('Master not initialized');
try {
      // Stop the server to load the RDB file
      await this.master.shutdown('SAVE');

      // Copy the new RDB file
      fs.copyFileSync(filePath, path.join(this.rdbPath, 'dump.rdb'));

      // Restart the server
      await this.initializeMaster({
        host: this.master.options.host as string,
        port: this.master.options.port as number,
        password: this.master.options.password,
console.log('RDB file loaded successfully');
catch (error) {
      console.error('Failed to load RDB file:', error);
      throw error;
async getReplicationInfo(): Promise<any> {
    if (!this.master) {
      throw new Error('Master not initialized');
try {
      const info = await this.master.info('replication');
      return this.parseRedisInfo(info);
catch (error) {
      console.error('Failed to get replication info:', error);
      throw error;
private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key.trim()] = value.trim();
return result;
async cleanup(): Promise<void> {
    if (this.master) {
      await this.master.quit();
for (const [id, slave] of this.slaves) {
      await this.removeSlave(id);
export default RedisManager;
