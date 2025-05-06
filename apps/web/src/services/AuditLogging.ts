import { Redis } from 'ioredis';

import { logger } from '@/lib/logger';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  changes?: Record<string, AuditChange>;
  metadata: AuditMetadata;
interface AuditChange {
  old: unknown;
  new: unknown;
interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country: string;
    city: string;
    coordinates: [number, number];
sessionId?: string;
  requestId?: string;
  [key: string]: unknown;
type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'share'
  | 'archive'
  | 'restore'
  | 'custom';

export class AuditLoggingService {
  private redis: Redis;
  private readonly logTTL = 365 * 24 * 60 * 60; // 1 year

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
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
try {
      // Store in Redis with TTL
      await this.redis.setex(`audit:log:${id}`, this.logTTL, JSON.stringify(log));

      // Store index by user
      if (log.userId) {
        await this.redis.zadd(`audit:user:${log.userId}`, log.timestamp.getTime(), id);
// Store index by resource
      if (log.resourceType && log.resourceId) {
        await this.redis.zadd(
          `audit:resource:${log.resourceType}:${log.resourceId}`,
          log.timestamp.getTime(),
          id,
// Log to application logger
      logger.info('Audit log', 'audit', {
        action: log.action,
        userId: log.userId,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        changes: log.changes,
catch (error) {
      logger.error('Failed to create audit log', 'audit', { error, log });
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
= {},
  ): Promise<AuditLog[]> {
    try {
      const { limit = 100, offset = 0, startTime, endTime } = options;

      // Get log IDs from sorted set
      const logIds = await this.redis.zrevrangebyscore(
        `audit:user:${userId}`,
        endTime.getTime() || '+inf',
        startTime.getTime() || '-inf',
        'LIMIT',
        offset,
        limit,
// Get log details
      return await this.getLogDetails(logIds);
catch (error) {
      logger.error('Failed to get user audit logs', 'audit', { error, userId });
      return [];
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
= {},
  ): Promise<AuditLog[]> {
    try {
      const { limit = 100, offset = 0, startTime, endTime } = options;

      // Get log IDs from sorted set
      const logIds = await this.redis.zrevrangebyscore(
        `audit:resource:${resourceType}:${resourceId}`,
        endTime.getTime() || '+inf',
        startTime.getTime() || '-inf',
        'LIMIT',
        offset,
        limit,
// Get log details
      return await this.getLogDetails(logIds);
catch (error) {
      logger.error('Failed to get resource audit logs', 'audit', {
        error,
        resourceType,
        resourceId,
return [];
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
options: {
      limit?: number;
      offset?: number;
= {},
  ): Promise<AuditLog[]> {
    try {
      const { limit = 100, offset = 0 } = options;
      let logIds: string[] = [];

      // Get candidate log IDs based on query
      if (query.userId) {
        logIds = await this.redis.zrevrangebyscore(
          `audit:user:${query.userId}`,
          query.endTime.getTime() || '+inf',
          query.startTime.getTime() || '-inf',
else if (query.resourceType && query.resourceId) {
        logIds = await this.redis.zrevrangebyscore(
          `audit:resource:${query.resourceType}:${query.resourceId}`,
          query.endTime.getTime() || '+inf',
          query.startTime.getTime() || '-inf',
// Get log details and filter
      const logs = await this.getLogDetails(logIds);
      const filtered = logs.filter((log) => {
        if (query.action && log.action !== query.action) return false;
        if (query.userId && log.userId !== query.userId) return false;
        if (query.resourceType && log.resourceType !== query.resourceType) return false;
        if (query.resourceId && log.resourceId !== query.resourceId) return false;
        if (query.startTime && log.timestamp < query.startTime) return false;
        if (query.endTime && log.timestamp > query.endTime) return false;
        return true;
return filtered.slice(offset, offset + limit);
catch (error) {
      logger.error('Failed to search audit logs', 'audit', { error, query });
      return [];
private async getLogDetails(logIds: string[]): Promise<AuditLog[]> {
    const logs: AuditLog[] = [];

    for (const id of logIds) {
      const logData = await this.redis.get(`audit:log:${id}`);
      if (logData) {
        try {
          const log = JSON.parse(logData);
          log.timestamp = new Date(log.timestamp);
          logs.push(log);
catch (error) {
          logger.error('Failed to parse audit log', 'audit', { error, id });
return logs;
async logAuditEvent(
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, AuditChange>,
    metadata?: AuditMetadata,
  ): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: crypto.randomUUID(),
        userId,
        action,
        resourceType,
        resourceId,
        timestamp: new Date(),
        changes,
        metadata: metadata || {},
await prisma.auditLog.create({
        data: auditLog,
// Store in Redis for real-time analysis
      const key = `audit:${resourceType}:${resourceId}`;
      await this.redis.lpush(key, JSON.stringify(auditLog));
      await this.redis.ltrim(key, 0, 99); // Keep last 100 events
      await this.redis.expire(key, 86400 * 30); // Expire after 30 days
catch (error) {
      logger.error('Failed to log audit event', {
        error,
        userId,
        action,
        resourceType,
        resourceId,
throw error;
async getAuditLogs(
    filters: {
      userId?: string;
      action?: AuditAction;
      resourceType?: string;
      resourceId?: string;
      startDate?: Date;
      endDate?: Date;
pagination: {
      page: number;
      limit: number;
): Promise<{
    logs: AuditLog[];
    total: number;
> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.resourceType) where.resourceType = filters.resourceType;
      if (filters.resourceId) where.resourceId = filters.resourceId;
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,

          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
          orderBy: { timestamp: 'desc' },
),
        prisma.auditLog.count({ where }),
      ]);

      return { logs, total };
catch (error) {
      logger.error('Failed to get audit logs', { error, filters });
      throw error;
