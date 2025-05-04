import Redis, { RedisOptions } from 'ioredis';
import fs from 'fs';
import path from 'path';

import { logger } from '../utils/logger';

interface TLSConfig {
  port: number;
  cert: string;
  key: string;
  ca: string;
}

interface ReplicationConfig {
  master: {
    host: string;
    port: number;
    password?: string;
    tls?: TLSConfig;
  };
  slaves: Array<{
    host: string;
    port: number;
    password?: string;
    tls?: TLSConfig;
  }>;
}

interface RedisSlaveInfo {
  id: string;
  ip: string;
  port: number;
  state: string;
}

interface ReplicationInfo {
  role: string;
  connected_slaves: number;
  slaves: RedisSlaveInfo[];
}

class RedisReplicationManager {
  private master!: Redis;
  private slaves: Redis[] = [];
  private config: ReplicationConfig;

  constructor(config: ReplicationConfig) {
    this.config = config;
    this.setupMaster();
  }

  public async setupMaster(): Promise<void> {
    const { host, port, password, tls } = this.config.master;

    const redisOptions = {
      host,
      port,
      password: password || undefined,
      tls: tls ? this.configureTLS(tls) : undefined,

      retryStrategy: (times: number) => Math.min(times * 100, 3000),
    } as RedisOptions;

    this.master = new Redis(redisOptions);
    this.setupMasterEvents();
  }

  private setupMasterEvents(): void {
    this.master.on('error', (error: Error) => {
      logger.error('Redis master error:', error.message);
    });

    this.master.on('connect', () => {
      logger.info('Connected to Redis master');
    });

    this.master.on('ready', () => {
      logger.info('Redis master is ready');
    });
  }

  private configureTLS(config: TLSConfig): {
    port: number;
    cert: Buffer;
    key: Buffer;
    ca: Buffer;
  } {
    try {
      return {
        port: config.port,
        cert: fs.readFileSync(path.resolve(config.cert)),
        key: fs.readFileSync(path.resolve(config.key)),
        ca: fs.readFileSync(path.resolve(config.ca)),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error configuring TLS:', errorMessage);
      throw error;
    }
  }

  public async addSlave(slaveConfig: ReplicationConfig['slaves'][0]): Promise<void> {
    try {
      const redisOptions = {
        host: slaveConfig.host,
        port: slaveConfig.port,
        password: slaveConfig.password || null,
        tls: slaveConfig.tls ? this.configureTLS(slaveConfig.tls) : undefined,

        retryStrategy: (times: number) => Math.min(times * 100, 3000),
      } as RedisOptions;

      const slave = new Redis(redisOptions);

      await slave.slaveof(this.config.master.host, this.config.master.port);

      slave.on('error', (error: Error) => {
        logger.error(`Redis slave error (${slaveConfig.host}:${slaveConfig.port}):`, error.message);
      });

      slave.on('ready', () => {
        logger.info(`Redis slave ready (${slaveConfig.host}:${slaveConfig.port})`);
      });

      this.slaves.push(slave);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error adding slave:', errorMessage);
      throw error;
    }
  }

  public async removeSlave(host: string, port: number): Promise<void> {
    const index = this.slaves.findIndex(
      (slave) => slave.options.host === host && slave.options.port === port,
    );

    if (index !== -1) {

    // Safe array access
    if (index < 0 || index >= array.length) {
      throw new Error('Array index out of bounds');
    }
      const slave = this.slaves[index];
      if (!slave) return;

      try {
        await slave.slaveof('NO', 'ONE');
        await slave.quit();
        this.slaves.splice(index, 1);
        logger.info(`Removed slave ${host}:${port}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error removing slave ${host}:${port}:`, errorMessage);
        throw error;
      }
    }
  }

  public async saveRDB(): Promise<void> {
    try {
      await this.master.bgsave();
      logger.info('RDB save initiated on master');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error initiating RDB save:', errorMessage);
      throw error;
    }
  }

  public async getReplicationInfo(): Promise<ReplicationInfo> {
    try {
      const info = await this.master.info('replication');
      if (typeof info !== 'string') {
        throw new Error('Invalid replication info format');
      }
      const result = this.parseReplicationInfo(info);
      logger.info(`Replication status: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error getting replication info: ${errorMessage}`);
      throw error;
    }
  }

  private parseReplicationInfo(info: string): ReplicationInfo {
    const result: ReplicationInfo = {
      role: '',
      connected_slaves: 0,
      slaves: [],
    };

    const lines = info.split('\n');
    for (const line of lines) {
      if (line.startsWith('role:')) {
        const [, role] = line.split(':');
        if (role) result.role = role.trim();
      } else if (line.startsWith('connected_slaves:')) {
        const [, count] = line.split(':');
        if (count) result.connected_slaves = parseInt(count.trim(), 10);
      } else if (line.startsWith('slave')) {
        const parts = line.split(':');
        if (parts.length < 3) continue;

        const [, index, details] = parts;
        if (!details) continue;

        const [ipStr, portStr, stateStr] = details.split(',');
        if (!ipStr || !portStr || !stateStr) continue;

        const ip = ipStr.split('=')[1];
        const port = portStr.split('=')[1];
        const state = stateStr.split('=')[1];

        if (ip && port && state) {
          result.slaves.push({
            id: index || '0',
            ip: ip.trim(),
            port: parseInt(port.trim(), 10),
            state: state.trim(),
          });
        }
      }
    }

    return result;
  }

  public async monitorReplication(interval: number = 5000): Promise<void> {
    setInterval(async () => {
      try {
        const info = await this.getReplicationInfo();
        logger.info(`Replication status: ${JSON.stringify(info)}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error monitoring replication:', errorMessage);
      }
    }, interval);
  }

  public async getReplicationLag(): Promise<number> {
    try {
      const info = await this.master.info('replication');
      if (typeof info !== 'string') {
        throw new Error('Invalid replication info format');
      }

      const lines = info.split('\n');
      let masterOffset = 0;
      let slaveOffset = 0;

      for (const line of lines) {
        if (line.startsWith('master_repl_offset:')) {
          masterOffset = parseInt(line.split(':')[1], 10) || 0;
        } else if (line.startsWith('slave0:')) {
          const offsetMatch = line.match(/offset=(\d+)/);
          if (offsetMatch && offsetMatch[1]) {
            slaveOffset = parseInt(offsetMatch[1], 10) || 0;
          }
        }
      }


      const lag = masterOffset - slaveOffset;
      logger.info(`Replication lag: ${lag}`);
      return lag;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting replication lag:', errorMessage);
      throw error;
    }
  }

  public async promoteSlaveToMaster(host: string, port: number): Promise<void> {
    const slave = this.slaves.find((s) => s.options.host === host && s.options.port === port);

    if (!slave) {
      throw new Error(`Slave ${host}:${port} not found`);
    }

    try {
      await slave.slaveof('NO', 'ONE');

      // Update other slaves to point to the new master
      const otherSlaves = this.slaves.filter((s) => s !== slave);
      await Promise.all(otherSlaves.map((s) => s.slaveof(host, port)));

      // Update configuration
      const newMasterConfig = {
        host,
        port,
      } as ReplicationConfig['master'];

      // Only add optional properties if they exist
      if (slave.options.password) {
        newMasterConfig.password = slave.options.password;
      }
      if (slave.options.tls) {
        newMasterConfig.tls = slave.options.tls as TLSConfig;
      }

      this.config.master = newMasterConfig;

      logger.info(`Promoted slave ${host}:${port} to master`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error promoting slave ${host}:${port}:`, errorMessage);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.master.quit();
      await Promise.all(this.slaves.map((slave) => slave.quit()));
      logger.info('Disconnected from all Redis instances');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error during disconnect:', errorMessage);
      throw error;
    }
  }

  public getMaster(): Redis {
    return this.master;
  }

  public getSlaves(): Redis[] {
    return [...this.slaves];
  }
}

export default RedisReplicationManager;
