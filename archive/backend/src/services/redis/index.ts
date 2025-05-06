import Redis from 'ioredis';

/**
 * Initialize Redis client with connection options
 */
let redisClient: Redis;

// Initialize the Redis client based on the environment
if (process.env.NODE_ENV === 'production') {
  // Production configuration
  const redisUrl = process.env['REDIS_URL'] || '';
  
  // Check for TLS connections (Upstash, Redis Enterprise, etc.)
  if (redisUrl.startsWith('rediss://')) {
    redisClient = new Redis(redisUrl, {
      tls: {
        rejectUnauthorized: false
else {
    // Standard connection
    redisClient = new Redis(redisUrl);
else {
  // Local development
  redisClient = new Redis({
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379'),
    password: process.env['REDIS_PASSWORD'] || undefined
// Error handling
redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
  // Implement proper logging here in production
// Successful connection
redisClient.on('connect', () => {
  console.log('Connected to Redis successfully');
export default redisClient; 