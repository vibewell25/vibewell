/**
 * Admin API route for retrieving rate limit events
 * Secured for admin users only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import redisClient, { RateLimitEvent } from '@/lib/redis-client';
import { logger } from '@/lib/logger';

// Define the session type
interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    // Verify the user is authenticated and an admin
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    if (session.user.role !== 'admin') {
      logger.warn(`Non-admin user ${session.user.id} attempted to access rate limit events`);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Get rate limit events from Redis
    const events = await redisClient.getRateLimitEvents();
    
    // Filter events based on parameters
    let filteredEvents = events;
    
    // Filter by time range
    const now = Date.now();
    const timeRangeMs = timeRange === '24h' 
      ? 24 * 60 * 60 * 1000 
      : timeRange === '1h' 
        ? 60 * 60 * 1000 
        : 7 * 24 * 60 * 60 * 1000;
    
    filteredEvents = filteredEvents.filter((e: RateLimitEvent) => 
      (now - (e.timestamp || 0)) <= timeRangeMs
    );
    
    // Filter by limiter type
    if (filter !== 'all') {
      if (filter === 'suspicious') {
        filteredEvents = filteredEvents.filter((e: RateLimitEvent) => e.suspicious);
      } else {
        filteredEvents = filteredEvents.filter((e: RateLimitEvent) => 
          e.limiterType.toLowerCase().includes(filter.toLowerCase())
        );
      }
    }
    
    // Sort by timestamp, most recent first
    filteredEvents.sort((a: RateLimitEvent, b: RateLimitEvent) => 
      (b.timestamp || 0) - (a.timestamp || 0)
    );
    
    // Generate summary statistics
    const stats = {
      total: filteredEvents.length,
      exceeded: filteredEvents.filter((e: RateLimitEvent) => e.exceeded).length,
      suspicious: filteredEvents.filter((e: RateLimitEvent) => e.suspicious).length,
      uniqueIPs: new Set(filteredEvents.map((e: RateLimitEvent) => e.ip)).size
    };
    
    // Generate limiter type statistics
    const limiterStats = filteredEvents.reduce((acc, event: RateLimitEvent) => {
      const type = event.limiterType;
      
      if (!acc[type]) {
        acc[type] = { total: 0, exceeded: 0, allowed: 0 };
      }
      
      acc[type].total++;
      if (event.exceeded) {
        acc[type].exceeded++;
      } else {
        acc[type].allowed++;
      }
      
      return acc;
    }, {} as Record<string, { total: number, exceeded: number, allowed: number }>);
    
    // Log the analytics request
    logger.info(`Admin ${session.user.id} retrieved ${filteredEvents.length} rate limit events`);
    
    return NextResponse.json({
      events: filteredEvents,
      stats,
      limiterStats
    });
  } catch (error) {
    logger.error(`Error retrieving rate limit events: ${error instanceof Error ? error.message : String(error)}`);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API route for blocking suspicious IPs
export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated and an admin
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    if (session.user.role !== 'admin') {
      logger.warn(`Non-admin user ${session.user.id} attempted to block IP addresses`);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { ip, action } = body;
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }
    
    if (action === 'block') {
      // Add IP to blocked list
      await redisClient.blockIP(ip);
      
      logger.warn(`Admin ${session.user.id} blocked IP ${ip}`);
      
      return NextResponse.json({
        success: true,
        message: `IP ${ip} has been blocked`
      });
    } else if (action === 'unblock') {
      // Remove IP from blocked list
      await redisClient.unblockIP(ip);
      
      logger.info(`Admin ${session.user.id} unblocked IP ${ip}`);
      
      return NextResponse.json({
        success: true,
        message: `IP ${ip} has been unblocked`
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "block" or "unblock"' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error(`Error managing blocked IPs: ${error instanceof Error ? error.message : String(error)}`);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 