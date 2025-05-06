import Redis from 'ioredis';
import { EventEmitter } from 'events';

    import fs from 'fs/promises';
import path from 'path';

interface ReplicationConfig {
  master: {
    host: string;
    port: number;
    password?: string;
slave: {
    port: number;
    slaveof?: string;
    rdbFilename?: string;
    rdbCompression?: boolean;
    rdbChecksum?: boolean;
class RedisReplication extends EventEmitter {
  private master: Redis;
  private slave: Redis;
  private config: ReplicationConfig;
  private rdbPath: string;

  constructor(config: ReplicationConfig) {
    super();
    this.config = config;
    this.rdbPath = path.join(process.cwd(), 'data', 'redis');
    
    // Initialize master connection
    this.master = new Redis({
      host: config.master.host,
      port: config.master.port,
      password: config.master.password,
      retryStrategy: (times) => {

    const delay = Math.min(times * 50, 2000);
        return delay;
// Initialize slave connection
    this.slave = new Redis({
      port: config.slave.port,
      retryStrategy: (times) => {

    const delay = Math.min(times * 50, 2000);
        return delay;
this.setupEventHandlers();
private setupEventHandlers(): void {
    // Master events
    this.master.on('connect', () => {
      this.emit('master:connect');
this.master.on('error', (error) => {
      this.emit('master:error', error);
// Slave events
    this.slave.on('connect', () => {
      this.emit('slave:connect');
this.slave.on('error', (error) => {
      this.emit('slave:error', error);
public async startReplication(): Promise<void> {
    try {
      // Configure slave
      if (this.config.slave.slaveof) {
        await this.slave.slaveof(
          this.config.master.host,
          this.config.master.port
// Configure RDB
      if (this.config.slave.rdbFilename) {
        await this.configureRDB();
this.emit('replication:start');
catch (error) {
      this.emit('replication:error', error);
      throw error;
public async stopReplication(): Promise<void> {
    try {
      await this.slave.slaveof('NO', 'ONE');
      this.emit('replication:stop');
catch (error) {
      this.emit('replication:error', error);
      throw error;
private async configureRDB(): Promise<void> {
    try {
      // Ensure RDB directory exists
      await fs.mkdir(this.rdbPath, { recursive: true });

      const rdbConfig = [
        `dir ${this.rdbPath}`,
        `dbfilename ${this.config.slave.rdbFilename}`,
        `rdbcompression ${this.config.slave.rdbCompression ? 'yes' : 'no'}`,
        `rdbchecksum ${this.config.slave.rdbChecksum ? 'yes' : 'no'}`
      ];

      // Apply RDB configuration
      for (const config of rdbConfig) {
        await this.slave.config('SET', ...config.split(' '));
this.emit('rdb:configured');
catch (error) {
      this.emit('rdb:error', error);
      throw error;
public async saveRDB(): Promise<void> {
    try {
      await this.slave.bgsave();
      this.emit('rdb:save:start');

      // Wait for background save to complete
      while (true) {
        const info = await this.slave.info('persistence');
        if (!info.includes('rdb_bgsave_in_progress:1')) {
          break;
await new Promise(resolve => setTimeout(resolve, 100));
this.emit('rdb:save:complete');
catch (error) {
      this.emit('rdb:save:error', error);
      throw error;
public async getRDBInfo(): Promise<object> {
    try {
      const info = await this.slave.info('persistence');
      const rdbInfo: { [key: string]: string | number } = {};

      info.split('\n').forEach(line => {
        if (line.startsWith('rdb_')) {
          const [key, value] = line.split(':');

    rdbInfo[key] = isNaN(Number(value)) ? value : Number(value);
return rdbInfo;
catch (error) {
      this.emit('rdb:info:error', error);
      throw error;
public async getReplicationInfo(): Promise<object> {
    try {
      const masterInfo = await this.master.info('replication');
      const slaveInfo = await this.slave.info('replication');
      
      return {
        master: this.parseInfo(masterInfo),
        slave: this.parseInfo(slaveInfo)
catch (error) {
      this.emit('replication:info:error', error);
      throw error;
private parseInfo(info: string): object {
    const result: { [key: string]: string | number } = {};

    info.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {

    result[key] = isNaN(Number(value)) ? value.trim() : Number(value);
return result;
public async disconnect(): Promise<void> {
    await Promise.all([
      this.master.disconnect(),
      this.slave.disconnect()
    ]);
    this.emit('disconnect');
export default RedisReplication; 