import { Redis } from 'ioredis';

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { env } from '@/config/env';

const redis = new Redis(env.REDIS_URL);

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  keyPrefix: string; // Prefix for Redis keys
const PAYMENT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  'payment:create': {
    windowMs: 60 * 1000, // 1 minute
    max: 5,              // 5 requests per minute
    keyPrefix: 'rl:payment:create',
'payment:refund': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3,                  // 3 refunds per 5 minutes
    keyPrefix: 'rl:payment:refund',
'payment:verify': {
    windowMs: 60 * 1000, // 1 minute
    max: 10,             // 10 verifications per minute
    keyPrefix: 'rl:payment:verify',
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); paymentRateLimit(
  req: NextRequest,
  operation: keyof typeof PAYMENT_RATE_LIMITS
): Promise<NextResponse | null> {

    const config = PAYMENT_RATE_LIMITS[operation];
  if (!config) {
    throw new Error(`Unknown rate limit operation: ${operation}`);
const ip = req.ip || 'unknown';

  const userId = req.headers.get('x-user-id') || 'anonymous';
  const key = `${config.keyPrefix}:${ip}:${userId}`;

  const now = Date.now();

  const windowStart = now - config.windowMs;

  // Use Redis transaction to ensure atomic operations
  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart); // Remove old entries
  multi.zcard(key);                            // Count remaining entries
  multi.zadd(key, now, `${now}`);             // Add current request
  multi.pexpire(key, config.windowMs);         // Set expiry

  const [, count] = await multi.exec() as [any, [null | Error, number]];
  
  if (count[1] >= config.max) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',

        retryAfter: Math.ceil(config.windowMs / 1000),
),
      {
        status: 429,
        headers: {


          'Retry-After': Math.ceil(config.windowMs / 1000).toString(),


          'Content-Type': 'application/json',
return null; // Continue with the request
