import { Redis } from 'ioredis';

import { logger } from '@/lib/logger';

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  metadata?: Record<string, any>;
export interface Permission {
  resource: string;
  action: string; // 'create' | 'read' | 'update' | 'delete' | 'manage'
  conditions?: Record<string, any>;
export class IAMService {
  private redis: Redis;
  private readonly keyPrefix = 'iam';

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
/**
   * Create or update a role
   */
  async upsertRole(role: Role): Promise<void> {
    try {
      await this.redis.hset(`${this.keyPrefix}:role:${role.id}`, {
        name: role.name,
        permissions: JSON.stringify(role.permissions),
        metadata: JSON.stringify(role.metadata || {}),
logger.info('Role updated', 'iam', { roleId: role.id });
catch (error) {
      logger.error('Failed to update role', 'iam', { error, role });
      throw error;
/**
   * Get a role by ID
   */
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const roleData = await this.redis.hgetall(`${this.keyPrefix}:role:${roleId}`);
      if (!roleData.name) return null;

      return {
        id: roleId,
        name: roleData.name,
        permissions: JSON.parse(roleData.permissions),
        metadata: JSON.parse(roleData.metadata),
catch (error) {
      logger.error('Failed to get role', 'iam', { error, roleId });
      return null;
/**
   * Assign roles to a user
   */
  async assignUserRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      await this.redis.sadd(`${this.keyPrefix}:user:${userId}:roles`, ...roleIds);
      logger.info('Roles assigned to user', 'iam', { userId, roleIds });
catch (error) {
      logger.error('Failed to assign roles', 'iam', { error, userId, roleIds });
      throw error;
/**
   * Get user's roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const roleIds = await this.redis.smembers(`${this.keyPrefix}:user:${userId}:roles`);
      const roles: Role[] = [];

      for (const roleId of roleIds) {
        const role = await this.getRole(roleId);
        if (role) roles.push(role);
return roles;
catch (error) {
      logger.error('Failed to get user roles', 'iam', { error, userId });
      return [];
/**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);

      for (const role of roles) {
        const hasPermission = role.permissions.some((p) => {
          const [resource, action] = p.split(':');
          return (
            (resource === '*' || resource === permission.resource) &&
            (action === '*' || action === permission.action)
if (hasPermission) return true;
return false;
catch (error) {
      logger.error('Failed to check permission', 'iam', { error, userId, permission });
      return false;
/**
   * Create default roles
   */
  async createDefaultRoles(): Promise<void> {
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        permissions: ['*:*'],
        metadata: { isSystem: true },
{
        id: 'user',
        name: 'Standard User',
        permissions: [
          'profile:read',
          'profile:update',
          'meditation:*',
          'booking:create',
          'booking:read',
          'booking:update',
        ],
        metadata: { isSystem: true },
{
        id: 'guest',
        name: 'Guest',
        permissions: ['meditation:read', 'booking:read'],
        metadata: { isSystem: true },
];

    for (const role of defaultRoles) {
      await this.upsertRole(role);
