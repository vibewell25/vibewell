
import { AnalyticsService } from '@/services/analytics-service';
import { nanoid } from 'nanoid';

/**

 * Track a try-on session in analytics
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); trackTryOnSession({
  userId,
  type,
  productId,
  productName,
  duration,
  intensity = 1,
  success = true,
  error = null,
}: {
  userId: string;
  type: string;
  productId: string;
  productName: string;
  duration: number;
  intensity?: number;
  success?: boolean;
  error?: string | null;
}) {
  try {
    const analyticsService = new AnalyticsService();
    return await analyticsService.trackTryOnSession({
      userId,
      type,
      productId,
      productName,
      duration,
      intensity,
      success,
      error,
    });
  } catch (error) {

    console.error('Failed to track try-on session:', error);
    return null;
  }
}

/**
 * Track a share event in analytics
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); trackShare({
  userId,
  sessionId,
  platform,
  method,
  success = true,
  error = null,
}: {
  userId: string;
  sessionId: string;
  platform: string;
  method: string;
  success?: boolean;
  error?: string | null;
}) {
  try {
    const analyticsService = new AnalyticsService();
    return await analyticsService.trackShare({
      userId,
      sessionId,
      platform,
      method,
      success,
      error,
    });
  } catch (error) {
    console.error('Failed to track share event:', error);
    return null;
  }
}

/**
 * Generate a unique session ID for tracking
 */
export function generateSessionId(): string {
  return nanoid();
}

/**
 * Calculate session duration in seconds
 */
export function calculateSessionDuration(startTime: number): number {
  const endTime = Date.now();

  return Math.round((endTime - startTime) / 1000);
}
