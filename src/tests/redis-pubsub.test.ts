import Redis from 'ioredis';
import RedisPubSub from '../utils/redis-pubsub';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

jest.mock('ioredis');
jest.mock('../utils/logger');

const MockRedis = Redis as jest.MockedClass<typeof Redis>;

describe('RedisPubSub', () => {
  let pubsub: RedisPubSub;
  let publisher: jest.Mocked<Redis>;
  let subscriber: jest.Mocked<Redis>;

  const pubsubConfig = {
    channelPrefix: 'test',
    messageValidation: {
      enabled: true,
      schema: {
        name: 'string',
        value: 'number'
      }
    }
  };

  beforeEach(() => {
    publisher = new MockRedis() as jest.Mocked<Redis>;
    subscriber = new MockRedis() as jest.Mocked<Redis>;
    
    // Setup subscriber as EventEmitter for testing
    Object.setPrototypeOf(subscriber, EventEmitter.prototype);
    EventEmitter.call(subscriber);

    pubsub = new RedisPubSub(publisher, subscriber, pubsubConfig);
  });

  describe('Publishing', () => {
    it('should publish a message successfully', async () => {
      publisher.publish.mockResolvedValue(1);

      const result = await pubsub.publish('test-channel', {
        name: 'test',
        value: 42
      });

      expect(result).toBe(true);
      expect(publisher.publish).toHaveBeenCalledWith(
        `${pubsubConfig.channelPrefix}:test-channel`,
        expect.stringContaining('"name":"test","value":42')
      );
    });

    it('should handle publishing errors', async () => {
      publisher.publish.mockRejectedValue(new Error('Redis error'));

      const result = await pubsub.publish('test-channel', {
        name: 'test',
        value: 42
      });

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should validate message schema before publishing', async () => {
      publisher.publish.mockResolvedValue(1);

      const result = await pubsub.publish('test-channel', {
        name: 'test',
        value: 'invalid' // Should be a number
      });

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Subscribing', () => {
    it('should subscribe to a channel', async () => {
      subscriber.subscribe.mockResolvedValue(undefined);
      const handler = jest.fn();

      await pubsub.subscribe('test-channel', handler);

      expect(subscriber.subscribe).toHaveBeenCalledWith(
        `${pubsubConfig.channelPrefix}:test-channel`
      );
      expect(logger.info).toHaveBeenCalledWith('Subscribed to channel: test-channel');
    });

    it('should handle subscription errors', async () => {
      subscriber.subscribe.mockRejectedValue(new Error('Redis error'));
      const handler = jest.fn();

      await expect(pubsub.subscribe('test-channel', handler)).rejects.toThrow('Redis error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should receive messages on subscribed channel', async () => {
      subscriber.subscribe.mockResolvedValue(undefined);
      const handler = jest.fn();
      const message = {
        channel: 'test-channel',
        data: { name: 'test', value: 42 },
        timestamp: Date.now(),
        messageId: 'test-id'
      };

      await pubsub.subscribe('test-channel', handler);
      subscriber.emit('message', `${pubsubConfig.channelPrefix}:test-channel`, JSON.stringify(message));

      expect(handler).toHaveBeenCalledWith(message);
    });

    it('should handle invalid messages', async () => {
      subscriber.subscribe.mockResolvedValue(undefined);
      const handler = jest.fn();

      await pubsub.subscribe('test-channel', handler);
      subscriber.emit('message', `${pubsubConfig.channelPrefix}:test-channel`, 'invalid json');

      expect(handler).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Pattern Subscription', () => {
    it('should subscribe to a pattern', async () => {
      subscriber.psubscribe.mockResolvedValue(undefined);
      const handler = jest.fn();

      await pubsub.pattern('test-*', handler);

      expect(subscriber.psubscribe).toHaveBeenCalledWith(
        `${pubsubConfig.channelPrefix}:test-*`
      );
      expect(logger.info).toHaveBeenCalledWith('Subscribed to pattern: test-*');
    });

    it('should handle pattern subscription errors', async () => {
      subscriber.psubscribe.mockRejectedValue(new Error('Redis error'));
      const handler = jest.fn();

      await expect(pubsub.pattern('test-*', handler)).rejects.toThrow('Redis error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Unsubscribing', () => {
    it('should unsubscribe from a channel', async () => {
      subscriber.subscribe.mockResolvedValue(undefined);
      subscriber.unsubscribe.mockResolvedValue(undefined);
      const handler = jest.fn();

      await pubsub.subscribe('test-channel', handler);
      await pubsub.unsubscribe('test-channel', handler);

      expect(subscriber.unsubscribe).toHaveBeenCalledWith(
        `${pubsubConfig.channelPrefix}:test-channel`
      );
      expect(logger.info).toHaveBeenCalledWith('Unsubscribed from channel: test-channel');
    });

    it('should handle unsubscribe errors', async () => {
      subscriber.unsubscribe.mockRejectedValue(new Error('Redis error'));

      await expect(pubsub.unsubscribe('test-channel')).rejects.toThrow('Redis error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track published messages', async () => {
      publisher.publish.mockResolvedValue(1);

      await pubsub.publish('test-channel', {
        name: 'test',
        value: 42
      });

      const stats = pubsub.getStats();
      expect(stats.published).toBe(1);
    });

    it('should track received messages', async () => {
      subscriber.subscribe.mockResolvedValue(undefined);
      const handler = jest.fn();
      const message = {
        channel: 'test-channel',
        data: { name: 'test', value: 42 },
        timestamp: Date.now(),
        messageId: 'test-id'
      };

      await pubsub.subscribe('test-channel', handler);
      subscriber.emit('message', `${pubsubConfig.channelPrefix}:test-channel`, JSON.stringify(message));

      const stats = pubsub.getStats();
      expect(stats.received).toBe(1);
    });

    it('should track errors', async () => {
      publisher.publish.mockRejectedValue(new Error('Redis error'));

      await pubsub.publish('test-channel', {
        name: 'test',
        value: 42
      });

      const stats = pubsub.getStats();
      expect(stats.errors).toBe(1);
    });

    it('should reset statistics', () => {
      pubsub.resetStats();
      const stats = pubsub.getStats();
      
      expect(stats.published).toBe(0);
      expect(stats.received).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.channels.size).toBe(0);
    });
  });

  describe('Cleanup', () => {
    it('should disconnect properly', async () => {
      publisher.quit.mockResolvedValue('OK');
      subscriber.quit.mockResolvedValue('OK');

      await pubsub.disconnect();

      expect(publisher.quit).toHaveBeenCalled();
      expect(subscriber.quit).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Redis pub/sub disconnected');
    });

    it('should handle disconnect errors', async () => {
      publisher.quit.mockRejectedValue(new Error('Redis error'));
      subscriber.quit.mockRejectedValue(new Error('Redis error'));

      await expect(pubsub.disconnect()).rejects.toThrow('Redis error');
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 