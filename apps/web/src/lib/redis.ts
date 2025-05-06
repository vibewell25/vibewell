import { Redis } from 'ioredis';

import { env } from '@/config/env';

if (!env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
// Create Redis client with retry strategy
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {

    const delay = Math.min(times * 50, 2000);
    return delay;
reconnectOnError(err) {
    const targetError = process.env['TARGETERROR'];
    if (err.message.includes(targetError)) {
      // Only reconnect if error includes specific message
      return true;
return false;
redis.on('error', (error) => {
  console.error('Redis Client Error:', error);
redis.on('connect', () => {
  console.log('Redis Client Connected');
export default redis;
