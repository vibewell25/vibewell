import { RateLimiterRedis } from 'rate-limiter-flexible';

import redisClient from '@/lib/redis-client';

interface RateLimitConfig {
  points: number; // Number of points
  duration: number; // Per duration in seconds
  blockDuration?: number; // Block duration in seconds
// Define rate limits for different endpoints and actions
export const rateLimits: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'auth:login': {
    points: 5,
    duration: 60 * 15, // 15 minutes
    blockDuration: 60 * 60, // 1 hour block
'auth:signup': {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60 * 24, // 24 hour block
// API endpoints
  'api:general': {
    points: 100,
    duration: 60, // 1 minute
'api:ar': {
    points: 200,
    duration: 60, // Higher limit for AR endpoints
// User actions

  'user:profile-update': {
    points: 10,
    duration: 60 * 5, // 5 minutes
'booking:create': {
    points: 20,
    duration: 60 * 15, // 15 minutes
// Create rate limiters
export const rateLimiters = new Map<string, RateLimiterRedis>();

// Initialize rate limiters
Object.entries(rateLimits).forEach(([key, config]) => {
  rateLimiters.set(
    key,
    new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: `ratelimit:${key}:`,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
),
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); checkRateLimit(
  key: string,
  identifier: string,
): Promise<{ success: boolean; remainingPoints?: number; msBeforeNext?: number }> {
  const limiter = rateLimiters.get(key);
  if (!limiter) {
    return { success: true }; // No rate limit defined
try {
    const rateLimitResult = await limiter.consume(identifier);
    return {
      success: true,
      remainingPoints: rateLimitResult.remainingPoints,
      msBeforeNext: rateLimitResult.msBeforeNext,
catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        msBeforeNext: (error as any).msBeforeNext,
return { success: false };
// Helper function to get rate limit info
export function getRateLimitInfo(key: string): RateLimitConfig | undefined {

    return rateLimits[key];
