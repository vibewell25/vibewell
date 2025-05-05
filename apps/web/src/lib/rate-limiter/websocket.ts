import { logger } from '@/lib/logger';
import { WebSocketRateLimitOptions, DEFAULT_WEBSOCKET_OPTIONS } from './types';
import { checkRateLimit, shouldUseRedis } from './core';

/**
 * WebSocket Rate Limiter class
 *
 * Provides specialized rate limiting for WebSocket connections including:
 * - Connection rate limiting per IP
 * - Message rate limiting
 * - Message size limiting
 * - Burst detection
 */
export class WebSocketRateLimiter {
  private options: WebSocketRateLimitOptions;
  private ipToConnections: Map<string, Set<string>>;

  /**
   * Create a new WebSocket rate limiter
   */
  constructor(options: WebSocketRateLimitOptions = {}) {
    this.options = {
      ...DEFAULT_WEBSOCKET_OPTIONS,
      ...options,
this.ipToConnections = new Map();

    logger.info('WebSocket rate limiter initialized', 'websocket', {
      maxConnectionsPerIP: this.options.maxConnectionsPerIP,
      maxMessagesPerMinute: this.options.maxMessagesPerMinute,
      maxMessageSizeBytes: this.options.maxMessageSizeBytes,
/**
   * Check if a new connection should be allowed
   */
  async canConnect(ip: string): Promise<boolean> {
    try {
      // If IP is already blocked, reject connection
      const isBlocked = await this.isIPBlocked(ip);
      if (isBlocked) {
        logger.warn(`Blocked WebSocket connection attempt from blocked IP: ${ip}`, 'websocket', {
          ip,
return false;
// In-memory connection counting
      const connections = this.ipToConnections.get(ip);
      const connectionCount = connections ? connections.size : 0;

      const maxConnections =
        this.options.maxConnectionsPerIP || DEFAULT_WEBSOCKET_OPTIONS.maxConnectionsPerIP!;

      // If too many connections from this IP, reject
      if (connectionCount >= maxConnections) {
        logger.warn(`Too many WebSocket connections from IP: ${ip}`, 'websocket', {
          ip,
          connectionCount,
          maxConnections,
return false;
// Use the core rate limiter with connection-specific settings
      const connectionOptions = {
        windowMs: this.options.connectionWindowMs || DEFAULT_WEBSOCKET_OPTIONS.connectionWindowMs!,
        max: maxConnections,
        keyPrefix: 'websocket:connection:',
const result = await checkRateLimit(
        `websocket:connection:${ip}`,
        connectionOptions,
        shouldUseRedis(),
return result.success;
catch (error) {
      logger.error(`Error checking WebSocket connection limit: ${error}`, 'websocket', {
        error,
        ip,
return true; // Allow on error, to prevent service disruption
/**
   * Register a new WebSocket connection
   */
  registerConnection(ip: string, connectionId: string): void {
    if (!this.ipToConnections.has(ip)) {
      this.ipToConnections.set(ip, new Set());
this.ipToConnections.get(ip)!.add(connectionId);

    logger.debug(`WebSocket connection registered: ${connectionId}`, 'websocket', {
      ip,
      connectionId,
      totalConnections: this.ipToConnections.get(ip)!.size,
/**
   * Unregister a WebSocket connection when it closes
   */
  unregisterConnection(ip: string, connectionId: string): void {
    const connections = this.ipToConnections.get(ip);
    if (connections) {
      connections.delete(connectionId);

      // Clean up empty sets
      if (connections.size === 0) {
        this.ipToConnections.delete(ip);
logger.debug(`WebSocket connection unregistered: ${connectionId}`, 'websocket', {
        ip,
        connectionId,
        remainingConnections: connections.size,
/**
   * Check if a message can be sent (rate limiting for messages)
   */
  async canSendMessage(ip: string, connectionId: string, messageSize: number): Promise<boolean> {
    try {
      // Check if IP is blocked
      const isBlocked = await this.isIPBlocked(ip);
      if (isBlocked) {
        return false;
// Check message size
      const maxSize =
        this.options.maxMessageSizeBytes || DEFAULT_WEBSOCKET_OPTIONS.maxMessageSizeBytes!;
      if (messageSize > maxSize) {
        logger.warn(`WebSocket message too large: ${messageSize} bytes`, 'websocket', {
          ip,
          connectionId,
          messageSize,
          maxSize,
return false;
// Rate limit messages per minute
      const messageOptions = {
        windowMs: 60 * 1000, // 1 minute
        max: this.options.maxMessagesPerMinute || DEFAULT_WEBSOCKET_OPTIONS.maxMessagesPerMinute!,
        keyPrefix: 'websocket:message:',
const result = await checkRateLimit(
        `websocket:message:${ip}:${connectionId}`,
        messageOptions,
        shouldUseRedis(),
// Check for message bursts
      if (result.success && result.remaining < 5) {
        // If nearly at the limit, check for bursts
        const burstOptions = {
          windowMs: this.options.burstDurationMs || DEFAULT_WEBSOCKET_OPTIONS.burstDurationMs!,
          max:
            (this.options.maxMessagesPerMinute || DEFAULT_WEBSOCKET_OPTIONS.maxMessagesPerMinute!) /
            (this.options.burstFactor || DEFAULT_WEBSOCKET_OPTIONS.burstFactor!),
          keyPrefix: 'websocket:burst:',
const burstResult = await checkRateLimit(
          `websocket:burst:${ip}:${connectionId}`,
          burstOptions,
          shouldUseRedis(),
if (!burstResult.success) {
          logger.warn(`WebSocket message burst detected from IP: ${ip}`, 'websocket', {
            ip,
            connectionId,
            burstFactor: this.options.burstFactor,
return false;
return result.success;
catch (error) {
      logger.error(`Error checking WebSocket message limit: ${error}`, 'websocket', {
        error,
        ip,
        connectionId,
return true; // Allow on error to prevent service disruption
/**
   * Check if an IP is blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    if (shouldUseRedis()) {

      const redisClient = (await import('@/lib/redis-client')).default;
      return redisClient.isIPBlocked(ip);
return false;
/**
 * Singleton instance of the WebSocket rate limiter
 */
export {};
