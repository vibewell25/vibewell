import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { apiRateLimiter, applyRateLimit } from '@/app/api/auth/rate-limit-middleware';

// Schema for validating analytics events
const analyticsEventSchema = z.object({
  event: z.string(),
  page: z.string(),
  timestamp: z.number(),
  userId: z.string().optional(),
  sessionId: z.string(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = analyticsEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const eventData = result.data;
    
    // Get user session for authorization (if needed)
    const session = await getSession();
    const userId = session?.user?.sub || eventData.userId || 'anonymous';
    
    // Apply sampling if configured
    const analyticsRateStr = env.ANALYTICS_SAMPLE_RATE || '1.0';
    const analyticsRate = parseFloat(analyticsRateStr);
    if (Math.random() > analyticsRate) {
      // Skip logging this event based on sample rate
      return NextResponse.json({ success: true, sampled: true });
    }
    
    // Check if IP anonymization is enabled
    const anonymizeIp = env.ANONYMIZE_IP === 'true';
    
    // Store analytics event in the database
    await prisma.analyticsEvent.create({
      data: {
        eventType: eventData.event,
        page: eventData.page,
        timestamp: new Date(eventData.timestamp),
        userId: anonymizeIp ? 'anonymous' : userId,
        sessionId: eventData.sessionId,
        metadata: eventData.metadata || {},
        ipAddress: anonymizeIp ? null : req.ip || null,
        userAgent: req.headers.get('user-agent') || null,
      },
    });

    // Forward to external analytics service if configured
    if (env.ANALYTICS_ENDPOINT && env.ANALYTICS_API_KEY) {
      try {
        await fetch(env.ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': env.ANALYTICS_API_KEY,
          },
          body: JSON.stringify({
            ...eventData,
            clientId: env.NEXT_PUBLIC_ANALYTICS_ID,
            userId: anonymizeIp ? null : userId,
            ipAddress: anonymizeIp ? null : req.ip || null,
          }),
        });
      } catch (error) {
        // Log error but don't fail the request
        console.error('Failed to forward analytics event:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 