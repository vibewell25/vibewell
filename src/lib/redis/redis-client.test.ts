/**
 * Redis Client Tests
 * 
 * These tests verify that the Redis client works correctly in
 * both mock (development) and production modes.
 */

import redisClient from './redis-client';

// Store original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

describe('Redis Client (Mock Mode)', () => {
  beforeEach(() => {
    // Reset the environment for testing
    process.env.NODE_ENV = 'development';
    // Clear any existing keys
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('should set and get values', async () => {
    await redisClient.set('test-key', 'test-value');
    const value = await redisClient.get('test-key');
    expect(value).toBe('test-value');
  });

  test('should increment values', async () => {
    await redisClient.set('counter', '5');
    const newValue = await redisClient.incr('counter');
    expect(newValue).toBe(6);
    const storedValue = await redisClient.get('counter');
    expect(storedValue).toBe('6');
  });

  test('should handle expiration', async () => {
    await redisClient.set('expire-key', 'expire-value');
    await redisClient.expire('expire-key', 1); // 1 second
    
    // Value should exist initially
    let value = await redisClient.get('expire-key');
    expect(value).toBe('expire-value');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Value should be gone after expiration
    value = await redisClient.get('expire-key');
    expect(value).toBeNull();
  });
  
  test('should delete keys', async () => {
    await redisClient.set('delete-key', 'delete-value');
    let value = await redisClient.get('delete-key');
    expect(value).toBe('delete-value');
    
    await redisClient.del('delete-key');
    value = await redisClient.get('delete-key');
    expect(value).toBeNull();
  });
  
  test('should set with expiration in one call', async () => {
    await redisClient.set('expire-key', 'expire-value', { ex: 1 });
    
    // Value should exist initially
    let value = await redisClient.get('expire-key');
    expect(value).toBe('expire-value');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Value should be gone after expiration
    value = await redisClient.get('expire-key');
    expect(value).toBeNull();
  });
  
  test('should log rate limit events', async () => {
    const event = {
      ip: '192.168.1.1',
      endpoint: '/api/test',
      exceeded: true,
      suspicious: true,
      timestamp: Date.now(),
      threshold: 100,
      current: 101
    };
    
    await redisClient.logRateLimitEvent(event);
    const events = await redisClient.getRateLimitEvents();
    
    expect(events.length).toBeGreaterThan(0);
    const firstEvent = events[0];
    expect(firstEvent.ip).toBe('192.168.1.1');
    expect(firstEvent.endpoint).toBe('/api/test');
    expect(firstEvent.exceeded).toBeTruthy();
  });
  
  test('should clear old rate limit events', async () => {
    // Create one old event (3 days ago)
    const oldEvent = {
      ip: '192.168.1.2',
      endpoint: '/api/test',
      timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
      exceeded: true
    };
    
    // Create one recent event
    const recentEvent = {
      ip: '192.168.1.3',
      endpoint: '/api/test',
      timestamp: Date.now(),
      exceeded: false
    };
    
    await redisClient.logRateLimitEvent(oldEvent);
    await redisClient.logRateLimitEvent(recentEvent);
    
    const beforeCount = (await redisClient.getRateLimitEvents()).length;
    
    // Clear events older than 1 day
    const removed = await redisClient.clearOldRateLimitEvents(24 * 60 * 60 * 1000);
    
    const afterEvents = await redisClient.getRateLimitEvents();
    
    // We should have removed at least the old event
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(afterEvents.length).toBe(beforeCount - removed);
    
    // Check that only recent events remain
    const remainingIps = afterEvents.map(e => e.ip);
    expect(remainingIps).toContain('192.168.1.3');
    expect(remainingIps).not.toContain('192.168.1.2');
  });
  
  test('should handle sorted sets with zadd and zrange', async () => {
    await redisClient.zadd('myzset', 1, 'one');
    await redisClient.zadd('myzset', 2, 'two');
    await redisClient.zadd('myzset', 3, 'three');
    
    const range = await redisClient.zrange('myzset', 0, -1);
    expect(range).toEqual(['one', 'two', 'three']);
    
    const revRange = await redisClient.zrevrange('myzset', 0, -1);
    expect(revRange).toEqual(['three', 'two', 'one']);
  });
  
  test('should remove elements from sorted sets by rank', async () => {
    await redisClient.zadd('rankzset', 1, 'one');
    await redisClient.zadd('rankzset', 2, 'two');
    await redisClient.zadd('rankzset', 3, 'three');
    await redisClient.zadd('rankzset', 4, 'four');
    
    // Remove the first two elements (lowest scores)
    const removed = await redisClient.zremrangebyrank('rankzset', 0, 1);
    
    expect(removed).toBe(2);
    
    const remaining = await redisClient.zrange('rankzset', 0, -1);
    expect(remaining).toEqual(['three', 'four']);
  });
  
  test('should remove elements from sorted sets by score', async () => {
    await redisClient.zadd('scorezset', 10, 'ten');
    await redisClient.zadd('scorezset', 20, 'twenty');
    await redisClient.zadd('scorezset', 30, 'thirty');
    await redisClient.zadd('scorezset', 40, 'forty');
    
    // Remove elements with scores between 20 and 30 inclusive
    const removed = await redisClient.zremrangebyscore('scorezset', 20, 30);
    
    expect(removed).toBe(2);
    
    const remaining = await redisClient.zrange('scorezset', 0, -1);
    expect(remaining).toEqual(['ten', 'forty']);
  });
  
  test('should get cardinality of a sorted set', async () => {
    await redisClient.zadd('cardzset', 1, 'one');
    await redisClient.zadd('cardzset', 2, 'two');
    
    const card = await redisClient.zcard('cardzset');
    expect(card).toBe(2);
    
    await redisClient.zadd('cardzset', 3, 'three');
    const newCard = await redisClient.zcard('cardzset');
    expect(newCard).toBe(3);
  });
});

// Tests for production Redis client would be similar but would require
// a real Redis instance to be running. These could be integration tests
// rather than unit tests. 