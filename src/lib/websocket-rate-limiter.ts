/**
 * WebSocket rate limiting implementation
 * 
 * This module provides rate limiting for WebSocket connections and messages
 * to prevent abuse and ensure fair usage of resources.
 */

import { logger } from '@/lib/logger';
import redisClient from '@/lib/redis-client';

interface WebSocketRateLimitOptions {
  // Connection limits
  maxConnectionsPerIP: number;
  connectionWindowMs: number;
  
  // Message limits
  maxMessagesPerMinute: number;
  maxMessageSizeBytes: number;
  
  // Burst handling
  burstFactor: number; // Allow short bursts (e.g., 2x normal rate) for this factor
  burstDurationMs: number; // For this duration
  
  // Key prefixes
  connectionKeyPrefix: string;
  messageKeyPrefix: string;
}

// Default rate limit configuration
const DEFAULT_OPTIONS: WebSocketRateLimitOptions = {
  maxConnectionsPerIP: 10, // 10 WebSocket connections per IP
  connectionWindowMs: 60 * 1000, // 1 minute
  
  maxMessagesPerMinute: 120, // 2 messages per second average
  maxMessageSizeBytes: 8192, // 8 KB maximum message size
  
  burstFactor: 2, // Allow 2x burst
  burstDurationMs: 5000, // For 5 seconds
  
  connectionKeyPrefix: 'ratelimit:ws:conn:',
  messageKeyPrefix: 'ratelimit:ws:msg:',
};

/**
 * WebSocket rate limiter implementation
 */
export class WebSocketRateLimiter {
  private options: WebSocketRateLimitOptions;
  private ipToConnections: Map<string, Set<string>>;
  
  constructor(options: Partial<WebSocketRateLimitOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.ipToConnections = new Map();
  }
  
  /**
   * Check if a new WebSocket connection should be allowed
   * @param ip Client IP address
   * @returns Boolean indicating if the connection is allowed
   */
  async canConnect(ip: string): Promise<boolean> {
    try {
      const key = `${this.options.connectionKeyPrefix}${ip}`;
      
      // In production, use Redis
      if (process.env.NODE_ENV === 'production') {
        // Get current connection count
        const count = await redisClient.get(key);
        const currentCount = count ? parseInt(count, 10) : 0;
        
        // Check if over limit
        if (currentCount >= this.options.maxConnectionsPerIP) {
          this.logRateLimitExceeded('connection', ip);
          return false;
        }
        
        // Increment count and set expiry if new
        if (currentCount === 0) {
          await redisClient.set(key, '1', { ex: Math.ceil(this.options.connectionWindowMs / 1000) });
        } else {
          await redisClient.incr(key);
        }
        
        return true;
      } 
      // In development, use in-memory store
      else {
        // Get or create connection set for this IP
        if (!this.ipToConnections.has(ip)) {
          this.ipToConnections.set(ip, new Set());
        }
        
        const connections = this.ipToConnections.get(ip)!;
        
        // Check if over limit
        if (connections.size >= this.options.maxConnectionsPerIP) {
          this.logRateLimitExceeded('connection', ip);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      // Log error and fail open (allow connection)
      logger.error('WebSocket rate limiter error', 'websocket', { error });
      return true;
    }
  }
  
  /**
   * Register a new WebSocket connection
   * @param ip Client IP address
   * @param connectionId Unique connection identifier
   */
  registerConnection(ip: string, connectionId: string): void {
    if (process.env.NODE_ENV !== 'production') {
      const connections = this.ipToConnections.get(ip);
      if (connections) {
        connections.add(connectionId);
      }
    }
    
    logger.debug(`WebSocket connection registered: ${connectionId}`, 'websocket', {
      ip: logger['hashSensitiveData'](ip),
      connectionId,
    });
  }
  
  /**
   * Unregister a WebSocket connection when closed
   * @param ip Client IP address
   * @param connectionId Unique connection identifier
   */
  unregisterConnection(ip: string, connectionId: string): void {
    if (process.env.NODE_ENV !== 'production') {
      const connections = this.ipToConnections.get(ip);
      if (connections) {
        connections.delete(connectionId);
        if (connections.size === 0) {
          this.ipToConnections.delete(ip);
        }
      }
    }
    
    logger.debug(`WebSocket connection unregistered: ${connectionId}`, 'websocket', {
      ip: logger['hashSensitiveData'](ip),
      connectionId,
    });
  }
  
  /**
   * Check if a WebSocket message should be rate limited
   * @param ip Client IP address
   * @param connectionId Unique connection identifier
   * @param messageSize Size of the message in bytes
   * @returns Boolean indicating if the message is allowed
   */
  async canSendMessage(ip: string, connectionId: string, messageSize: number): Promise<boolean> {
    try {
      // First check message size
      if (messageSize > this.options.maxMessageSizeBytes) {
        this.logRateLimitExceeded('message_size', ip, connectionId, messageSize);
        return false;
      }
      
      const key = `${this.options.messageKeyPrefix}${connectionId}`;
      const burstKey = `${key}:burst`;
      
      // In production, use Redis
      if (process.env.NODE_ENV === 'production') {
        const now = Date.now();
        const messageWindow = 60 * 1000; // 1 minute (in ms)
        const messageWindowKey = `${key}:window`;
        
        // Get current count and window expiry
        const [countStr, windowExpires, burstCountStr] = await Promise.all([
          redisClient.get(key),
          redisClient.get(messageWindowKey),
          redisClient.get(burstKey),
        ]);
        
        const currentCount = countStr ? parseInt(countStr, 10) : 0;
        const burstCount = burstCountStr ? parseInt(burstCountStr, 10) : 0;
        
        // If window doesn't exist or has expired, create a new one
        if (!windowExpires || parseInt(windowExpires, 10) < now) {
          const resetTime = now + messageWindow;
          
          await Promise.all([
            redisClient.set(key, '1'),
            redisClient.set(messageWindowKey, resetTime.toString(), { ex: 60 }), // 60 seconds
          ]);
          
          return true;
        }
        
        // Calculate the normal and burst limits
        const normalLimit = this.options.maxMessagesPerMinute;
        const burstLimit = normalLimit * this.options.burstFactor;
        
        // Check if over normal limit
        if (currentCount >= normalLimit) {
          // If over normal limit but under burst limit, allow but track burst usage
          if (currentCount < burstLimit && burstCount < burstLimit - normalLimit) {
            // Increment burst count
            await redisClient.incr(burstKey);
            
            // Set burst key expiry if not set
            if (burstCount === 0) {
              await redisClient.expire(burstKey, Math.ceil(this.options.burstDurationMs / 1000));
            }
            
            // Increment normal counter too
            await redisClient.incr(key);
            
            return true;
          }
          
          // Over limit even with burst, rate limit it
          this.logRateLimitExceeded('message_rate', ip, connectionId);
          return false;
        }
        
        // Under normal limit, just increment
        await redisClient.incr(key);
        return true;
      } 
      // In development, for now just allow all messages
      else {
        return true;
      }
    } catch (error) {
      // Log error and fail open (allow message)
      logger.error('WebSocket message rate limiter error', 'websocket', { error });
      return true;
    }
  }
  
  /**
   * Log rate limit exceeded events
   */
  private logRateLimitExceeded(
    type: 'connection' | 'message_rate' | 'message_size',
    ip: string,
    connectionId?: string,
    size?: number
  ): void {
    const message = `WebSocket rate limit exceeded: ${type}`;
    
    logger.warn(message, 'websocket', {
      type,
      ip: logger['hashSensitiveData'](ip),
      connectionId,
      size,
      limits: {
        maxConnectionsPerIP: this.options.maxConnectionsPerIP,
        maxMessagesPerMinute: this.options.maxMessagesPerMinute,
        maxMessageSizeBytes: this.options.maxMessageSizeBytes,
      },
    });
  }
}

// Export a singleton instance with default options
export const webSocketRateLimiter = new WebSocketRateLimiter(); 