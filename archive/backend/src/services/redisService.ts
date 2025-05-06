import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private readonly secretPrefix = 'temp_2fa_secret:';
  private readonly secretExpiry = 60 * 15; // 15 minutes

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {

    const delay = Math.min(times * 50, 2000);
        return delay;
this.client.on('error', (error) => {
      console.error('Redis error:', error);
public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
return RedisService.instance;
public async setTemporarySecret(userId: string, secret: string): Promise<void> {
    const key = this.getKey(userId);
    await this.client.setex(key, this.secretExpiry, secret);
public async getTemporarySecret(userId: string): Promise<string | null> {
    const key = this.getKey(userId);
    return await this.client.get(key);
public async deleteTemporarySecret(userId: string): Promise<void> {
    const key = this.getKey(userId);
    await this.client.del(key);
private getKey(userId: string): string {
    return `${this.secretPrefix}${userId}`;
public async disconnect(): Promise<void> {
    await this.client.quit();
export default RedisService; 