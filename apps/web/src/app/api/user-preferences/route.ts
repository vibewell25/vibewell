import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { apiRateLimiter, applyRateLimit } from '@/app/api/auth/rate-limit-middleware';

// Schema for validating user preferences
const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  reducedAnimations: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  contentCategories: z.array(z.string()).optional(),
  favoriteProducts: z.array(z.string()).optional(),
  recentlyViewed: z.array(z.string()).optional(),
  shareUsageData: z.boolean().optional(),
  locationTracking: z.boolean().optional(),
  cookiePreferences: z.object({
    necessary: z.boolean().optional(),
    analytics: z.boolean().optional(),
    marketing: z.boolean().optional(),
    preferences: z.boolean().optional(),
  }).optional(),
  beautyPreferences: z.object({
    skinType: z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive']).optional(),
    skinConcerns: z.array(z.string()).optional(),
    hairType: z.enum(['straight', 'wavy', 'curly', 'coily']).optional(),
    hairConcerns: z.array(z.string()).optional(),
    makeupStyle: z.array(z.string()).optional(),
  }).optional(),
  accessibilitySettings: z.object({
    screenReader: z.boolean().optional(),
    voiceNavigation: z.boolean().optional(),
    colorBlindMode: z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia']).optional(),
    textToSpeech: z.boolean().optional(),
  }).optional(),
});

// GET endpoint to fetch user preferences
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get user session for authentication
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user preferences from database
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!userPreferences) {
      return NextResponse.json({
        theme: 'system',
        fontSize: 'medium',
        reducedAnimations: false,
        highContrast: false,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        contentCategories: [],
        favoriteProducts: [],
        recentlyViewed: [],
        shareUsageData: true,
        locationTracking: false,
        cookiePreferences: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true,
        },
        beautyPreferences: {
          skinType: 'normal',
          skinConcerns: [],
          hairType: 'straight',
          hairConcerns: [],
          makeupStyle: [],
        },
        accessibilitySettings: {
          screenReader: false,
          voiceNavigation: false,
          colorBlindMode: 'none',
          textToSpeech: false,
        },
      });
    }
    
    return NextResponse.json(userPreferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to update user preferences
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get user session for authentication
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const result = userPreferencesSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const preferencesData = result.data;
    
    // Update user preferences using upsert
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: preferencesData,
      create: {
        userId: session.user.id,
        ...preferencesData,
      },
    });
    
    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 