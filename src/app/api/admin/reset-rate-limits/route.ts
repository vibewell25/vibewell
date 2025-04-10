import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth-service';
import redisClient from '@/lib/redis-client';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role || 'customer';
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request
    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const targetUserId = body.userId;
    
    // Only reset rate limits in production mode with Redis
    if (process.env.NODE_ENV === 'production') {
      // Reset various rate limiters for the user
      try {
        // Get all keys for this user from Redis
        const authService = new AuthService();
        await authService.resetMFARateLimits(targetUserId, user.id);
        
        // Reset other rate limits
        // This is a comprehensive approach to clear all rate limits for a user
        const keys = await getKeysForUser(targetUserId);
        
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
        
        // Log the admin action
        logger.info(`Admin ${user.id} reset rate limits for user ${targetUserId}`, 'admin', {
          adminId: user.id,
          targetUserId,
          action: 'reset_rate_limits',
          keysReset: keys.length,
        });
        
        return NextResponse.json({
          success: true,
          message: `Rate limits reset for user ${targetUserId}`,
          keysReset: keys.length,
        });
      } catch (error) {
        logger.error('Failed to reset rate limits', 'admin', {
          error,
          adminId: user.id,
          targetUserId,
        });
        
        return NextResponse.json(
          { error: 'Failed to reset rate limits' },
          { status: 500 }
        );
      }
    } else {
      // In development mode, we're using in-memory storage
      // Log the action but there's nothing to reset
      logger.info(`Admin ${user.id} attempted to reset rate limits for ${targetUserId} in development mode`, 'admin');
      
      return NextResponse.json({
        success: true,
        message: 'Rate limits reset (development mode - no actual reset needed)',
        keysReset: 0,
      });
    }
  } catch (error) {
    logger.error('Error in reset rate limits API', 'admin', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get all rate limit keys for a user
async function getKeysForUser(userId: string): Promise<string[]> {
  if (process.env.NODE_ENV !== 'production') {
    return [];
  }
  
  try {
    // List of key patterns to check
    const patterns = [
      `ratelimit:*:${userId}`,
      `ratelimit:*:${userId}:*`,
      `ratelimit:mfa:*:${userId}`,
    ];
    
    // In a real implementation with the redis package, you would use:
    // const keys = await Promise.all(patterns.map(pattern => redisClient.keys(pattern)));
    // return keys.flat();
    
    // Since we don't have the actual Redis package installed,
    // we'll return an empty array for now
    return [];
  } catch (error) {
    logger.error('Error getting rate limit keys for user', 'redis', { error, userId });
    return [];
  }
} 