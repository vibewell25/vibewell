import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    [key: string]: any;
  };
}

export class AuditLoggingService {
  private redis: Redis;
  private readonly logTTL = 365 * 24 * 60 * 60; // 1 year

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
  }

  /**
   * Log an auditable action
   */
  async log(action: string, details: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const id = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const log: AuditLog = {
      id,
      timestamp: new Date(),
      action,
      ...details,
    };

    try {
      // Store in Redis with TTL
      await this.redis.setex(`audit:log:${id}`, this.logTTL, JSON.stringify(log));

      // Store index by user
      if (log.userId) {
        await this.redis.zadd(`audit:user:${log.userId}`, log.timestamp.getTime(), id);
      }

      // Store index by resource
      if (log.resourceType && log.resourceId) {
        await this.redis.zadd(
          `audit:resource:${log.resourceType}:${log.resourceId}`,
          log.timestamp.getTime(),
          id
        );
      }

      // Log to application logger
      logger.info('Audit log', 'audit', {
        action: log.action,
        userId: log.userId,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        changes: log.changes,
      });
    } catch (error) {
      logger.error('Failed to create audit log', 'audit', { error, log });
    }
  }

  /**
   * Get audit logs for a user
   */
  async getUserLogs(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      startTime?: Date;
      endTime?: Date;
    } = {}
  ): Promise<AuditLog[]> {
    try {
      const { limit = 100, offset = 0, startTime, endTime } = options;

      // Get log IDs from sorted set
      const logIds = await this.redis.zrevrangebyscore(
        `audit:user:${userId}`,
        endTime?.getTime() || '+inf',
        startTime?.getTime() || '-inf',
        'LIMIT',
        offset,
        limit
      );

      // Get log details
      return await this.getLogDetails(logIds);
    } catch (error) {
      logger.error('Failed to get user audit logs', 'audit', { error, userId });
      return [];
    }
  }

  /**
   * Get audit logs for a resource
   */
  async getResourceLogs(
    resourceType: string,
    resourceId: string,
    options: {
      limit?: number;
      offset?: number;
      startTime?: Date;
      endTime?: Date;
    } = {}
  ): Promise<AuditLog[]> {
    try {
      const { limit = 100, offset = 0, startTime, endTime } = options;

      // Get log IDs from sorted set
      const logIds = await this.redis.zrevrangebyscore(
        `audit:resource:${resourceType}:${resourceId}`,
        endTime?.getTime() || '+inf',
        startTime?.getTime() || '-inf',
        'LIMIT',
        offset,
        limit
      );

      // Get log details
      return await this.getLogDetails(logIds);
    } catch (error) {
      logger.error('Failed to get resource audit logs', 'audit', {
        error,
        resourceType,
        resourceId,
      });
      return [];
    }
  }

  /**
   * Search audit logs
   */
  async searchLogs(
    query: {
      action?: string;
      userId?: string;
      resourceType?: string;
      resourceId?: string;
      startTime?: Date;
      endTime?: Date;
    },
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLog[]> {
    try {
      const { limit = 100, offset = 0 } = options;
      let logIds: string[] = [];

      // Get candidate log IDs based on query
      if (query.userId) {
        logIds = await this.redis.zrevrangebyscore(
          `audit:user:${query.userId}`,
          query.endTime?.getTime() || '+inf',
          query.startTime?.getTime() || '-inf'
        );
      } else if (query.resourceType && query.resourceId) {
        logIds = await this.redis.zrevrangebyscore(
          `audit:resource:${query.resourceType}:${query.resourceId}`,
          query.endTime?.getTime() || '+inf',
          query.startTime?.getTime() || '-inf'
        );
      }

      // Get log details and filter
      const logs = await this.getLogDetails(logIds);
      const filtered = logs.filter(log => {
        if (query.action && log.action !== query.action) return false;
        if (query.userId && log.userId !== query.userId) return false;
        if (query.resourceType && log.resourceType !== query.resourceType) return false;
        if (query.resourceId && log.resourceId !== query.resourceId) return false;
        if (query.startTime && log.timestamp < query.startTime) return false;
        if (query.endTime && log.timestamp > query.endTime) return false;
        return true;
      });

      return filtered.slice(offset, offset + limit);
    } catch (error) {
      logger.error('Failed to search audit logs', 'audit', { error, query });
      return [];
    }
  }

  private async getLogDetails(logIds: string[]): Promise<AuditLog[]> {
    const logs: AuditLog[] = [];

    for (const id of logIds) {
      const logData = await this.redis.get(`audit:log:${id}`);
      if (logData) {
        try {
          const log = JSON.parse(logData);
          log.timestamp = new Date(log.timestamp);
          logs.push(log);
        } catch (error) {
          logger.error('Failed to parse audit log', 'audit', { error, id });
        }
      }
    }

    return logs;
  }
}
