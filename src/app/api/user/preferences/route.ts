import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthenticated, getAuthState } from '@/hooks/use-unified-auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';

// Schema for validating preferences updates
const preferencesSchema = z.object({
  preferences: z.object({
    // Appearance
    theme: z.enum(['light', 'dark', 'system']).optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    reducedMotion: z.boolean().optional(),
    highContrast: z.boolean().optional(),

    // Notifications
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    emailFrequency: z.enum(['daily', 'weekly', 'monthly', 'never']).optional(),

    // Localization
    language: z.string().optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),

    // Privacy
    shareActivity: z.boolean().optional(),
    allowDataCollection: z.boolean().optional(),
    receiveRecommendations: z.boolean().optional(),

    // Content
    contentCategories: z.array(z.string()).optional(),
    contentFilters: z.array(z.string()).optional(),
  }),
});

/**
 * GET /api/user/preferences
 * Retrieves the current user's preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from auth state
    const { user } = await getAuthState();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user preferences from database
    const userPreferences = await prisma.userPreference.findMany({
      where: { userId: user.id },
    });

    // If no preferences exist yet, return an empty object
    if (!userPreferences || userPreferences.length === 0) {
      return NextResponse.json({ preferences: {} });
    }

    // Transform the array of preferences into a structured object
    const preferences: Record<string, any> = {};

    // Transform database preferences into the expected format
    // Each UserPreference has category and weight fields
    userPreferences.forEach((pref: { category: string; weight: number }) => {
      const category = pref.category;
      preferences[category] = pref.weight;
    });

    // Return the preferences
    return NextResponse.json({ preferences });
  } catch (error) {
    logger.error(
      'Error fetching user preferences',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json({ error: 'Failed to fetch user preferences' }, { status: 500 });
  }
}

/**
 * PUT /api/user/preferences
 * Updates the current user's preferences
 */
export async function PUT(request: NextRequest) {
  try {
    // Check if the user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from auth state
    const { user } = await getAuthState();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = preferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid preferences data',
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    // Get the preferences data
    const { preferences } = validationResult.data;

    // First, delete existing preferences to avoid conflicts
    await prisma.userPreference.deleteMany({
      where: { userId: user.id },
    });

    // Convert preferences object to individual UserPreference records
    const preferencesData = Object.entries(preferences).map(([category, value]) => ({
      userId: user.id,
      category,
      weight:
        typeof value === 'boolean'
          ? value
            ? 1.0
            : 0.0
          : typeof value === 'number'
            ? value
            : typeof value === 'string'
              ? 1.0
              : 0.5,
    }));

    // Create new preferences
    if (preferencesData.length > 0) {
      await prisma.userPreference.createMany({
        data: preferencesData,
      });
    }

    // Log the update
    logger.info(`User preferences updated: ${user.id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    logger.error(
      'Error updating user preferences',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
  }
}
