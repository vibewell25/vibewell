import { prisma } from '@/lib/prisma';

import type { WebAuthnAuditLog } from '@prisma/client';

export type WebAuthnAction = 'register' | 'authenticate' | 'revoke' | 'recovery';

export interface WebAuthnAuditLogData {
  userId: string;
  action: WebAuthnAction;
  deviceId: string;
  success: boolean;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
export class WebAuthnAuditLogger {
  static async log(data: WebAuthnAuditLogData) {
    try {
      await prisma.webAuthnAuditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          deviceId: data.deviceId,
          success: data.success,
          errorMessage: data.errorMessage,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
catch (error) {
      // Log to error monitoring service but don't fail the request
      console.error('Failed to create WebAuthn audit log:', error);
static async getRecentLogs(userId: string, limit = 10): Promise<WebAuthnAuditLog[]> {
    return await prisma.webAuthnAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
static async getFailedAttempts(userId: string, windowMs: number): Promise<number> {
    const windowStart = new Date(Date.now() - windowMs);
    
    return await prisma.webAuthnAuditLog.count({
      where: {
        userId,
        success: false,
        createdAt: {
          gte: windowStart,
