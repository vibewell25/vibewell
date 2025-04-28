import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { logger } from './logger';

interface PubSubConfig {
  channelPrefix: string;
  messageValidation?: {
    enabled: boolean;
    schema?: Record<string, unknown>;
  };
}

interface PubSubMessage<T = unknown> {
  channel: string;
  data: T;
  timestamp: number;
  messageId: string;
}

interface PubSubStats {
  published: number;
  received: number;
  errors: number;
  channels: Map<string, number>;
}

class RedisPubSub extends EventEmitter {
  private publisher: Redis;
  private subscriber: Redis;
  private config: PubSubConfig;
  private subscriptions: Map<string, Set<(message: PubSubMessage) => void>>;
  private stats: PubSubStats;

  constructor(publisher: Redis, subscriber: Redis, config: PubSubConfig) {
    super();
    this.publisher = publisher;
    this.subscriber = subscriber;
    this.config = config;
    this.subscriptions = new Map();
    this.stats = {
      published: 0,
      received: 0,
      errors: 0,
      channels: new Map(),
    };

    this.setupSubscriber();
  }

  private setupSubscriber(): void {
    this.subscriber.on('message', (channel: string, message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as PubSubMessage;

        if (this.config.messageValidation?.enabled) {
          this.validateMessage(parsedMessage);
        }

        this.stats.received++;
        this.stats.channels.set(channel, (this.stats.channels.get(channel) || 0) + 1);

        const handlers = this.subscriptions.get(channel);
        if (handlers) {
          handlers.forEach((handler) => handler(parsedMessage));
        }

        this.emit('message', channel, parsedMessage);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error processing message on channel ${channel}:`, errorMessage);
        this.stats.errors++;
      }
    });

    this.subscriber.on('error', (error: Error) => {
      logger.error('Redis subscriber error:', error.message);
      this.stats.errors++;
      this.emit('error', error);
    });
  }

  private validateMessage(message: PubSubMessage): void {
    if (!message.channel || !message.data || !message.timestamp || !message.messageId) {
      throw new Error('Invalid message format');
    }

    if (this.config.messageValidation?.schema) {
      // Add custom schema validation here if needed
      // For now, we just check if required fields exist
      const schema = this.config.messageValidation.schema;
      for (const [key, type] of Object.entries(schema)) {
        if (!(key in message.data) || typeof message.data[key] !== type) {
          throw new Error(`Invalid message data: ${key} should be of type ${String(type)}`);
        }
      }
    }
  }

  private getFullChannel(channel: string): string {
    return `${this.config.channelPrefix}:${channel}`;
  }

  public async publish<T>(channel: string, data: T): Promise<boolean> {
    const fullChannel = this.getFullChannel(channel);
    try {
      const message: PubSubMessage<T> = {
        channel,
        data,
        timestamp: Date.now(),
        messageId: Math.random().toString(36).substring(2, 15),
      };

      if (this.config.messageValidation?.enabled) {
        this.validateMessage(message);
      }

      const result = await this.publisher.publish(fullChannel, JSON.stringify(message));

      if (result > 0) {
        this.stats.published++;
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error publishing to channel ${channel}:`, errorMessage);
      this.stats.errors++;
      return false;
    }
  }

  public async subscribe<T>(
    channel: string,
    handler: (message: PubSubMessage<T>) => void,
  ): Promise<void> {
    const fullChannel = this.getFullChannel(channel);
    try {
      await this.subscriber.subscribe(fullChannel);

      if (!this.subscriptions.has(fullChannel)) {
        this.subscriptions.set(fullChannel, new Set());
      }

      this.subscriptions.get(fullChannel)?.add(handler as (message: PubSubMessage) => void);
      logger.info(`Subscribed to channel: ${channel}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error subscribing to channel ${channel}:`, errorMessage);
      this.stats.errors++;
      throw error;
    }
  }

  public async unsubscribe(
    channel: string,
    handler?: (message: PubSubMessage) => void,
  ): Promise<void> {
    const fullChannel = this.getFullChannel(channel);
    try {
      if (handler) {
        this.subscriptions.get(fullChannel)?.delete(handler);
        if (this.subscriptions.get(fullChannel)?.size === 0) {
          await this.subscriber.unsubscribe(fullChannel);
          this.subscriptions.delete(fullChannel);
        }
      } else {
        await this.subscriber.unsubscribe(fullChannel);
        this.subscriptions.delete(fullChannel);
      }
      logger.info(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error unsubscribing from channel ${channel}:`, errorMessage);
      this.stats.errors++;
      throw error;
    }
  }

  public async pattern<T>(
    pattern: string,
    handler: (message: PubSubMessage<T>) => void,
  ): Promise<void> {
    const fullPattern = this.getFullChannel(pattern);
    try {
      await this.subscriber.psubscribe(fullPattern);

      if (!this.subscriptions.has(fullPattern)) {
        this.subscriptions.set(fullPattern, new Set());
      }

      this.subscriptions.get(fullPattern)?.add(handler as (message: PubSubMessage) => void);
      logger.info(`Subscribed to pattern: ${pattern}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error subscribing to pattern ${pattern}:`, errorMessage);
      this.stats.errors++;
      throw error;
    }
  }

  public getStats(): PubSubStats {
    return {
      ...this.stats,
      channels: new Map(this.stats.channels),
    };
  }

  public resetStats(): void {
    this.stats = {
      published: 0,
      received: 0,
      errors: 0,
      channels: new Map(),
    };
  }

  public async disconnect(): Promise<void> {
    try {
      await Promise.all([this.publisher.quit(), this.subscriber.quit()]);
      this.subscriptions.clear();
      this.removeAllListeners();
      logger.info('Redis pub/sub disconnected');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error disconnecting pub/sub:', errorMessage);
      throw error;
    }
  }
}

export default RedisPubSub;
