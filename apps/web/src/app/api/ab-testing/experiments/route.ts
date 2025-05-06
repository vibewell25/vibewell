import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { getSession } from '@auth0/nextjs-auth0';

// Schema for validating experiment assignment
const experimentAssignmentSchema = z.object({
  experimentId: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  clientId: z.string().optional(),
});

// Define active experiments
const ACTIVE_EXPERIMENTS = [
  {
    id: 'virtual-try-on-layout',
    name: 'Virtual Try-On Layout',
    variants: ['A', 'B', 'C'],
    defaultVariant: 'A',
    weights: { A: 0.4, B: 0.3, C: 0.3 },
    isActive: true,
  },
  {
    id: 'homepage-hero',
    name: 'Homepage Hero Image',
    variants: ['A', 'B'],
    defaultVariant: 'A',
    weights: { A: 0.5, B: 0.5 },
    isActive: true,
  },
  {
    id: 'checkout-flow',
    name: 'Checkout Flow Steps',
    variants: ['A', 'B'],
    defaultVariant: 'A',
    weights: { A: 0.5, B: 0.5 },
    isActive: true,
  },
];

/**
 * GET all active experiments
 */
export async function GET(req: NextRequest) {
  // Check if A/B testing is enabled
  if (env.NEXT_PUBLIC_ENABLE_AB_TESTING !== 'true') {
    return NextResponse.json({ 
      experiments: [],
      message: 'A/B testing is disabled'
    });
  }

  // Get all active experiments
  return NextResponse.json({ 
    experiments: ACTIVE_EXPERIMENTS.filter(exp => exp.isActive)
  });
}

/**
 * POST assigns a variant for an experiment to a user
 */
export async function POST(req: NextRequest) {
  try {
    // Check if A/B testing is enabled
    if (env.NEXT_PUBLIC_ENABLE_AB_TESTING !== 'true') {
      return NextResponse.json({ 
        error: 'A/B testing is disabled'
      }, { status: 400 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = experimentAssignmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { experimentId, userId: requestUserId, sessionId } = result.data;

    // Find experiment
    const experiment = ACTIVE_EXPERIMENTS.find(exp => exp.id === experimentId);
    if (!experiment || !experiment.isActive) {
      return NextResponse.json({ 
        error: 'Experiment not found or inactive' 
      }, { status: 404 });
    }

    // Get authentication if available
    const session = await getSession();
    const userId = session?.user?.sub || requestUserId;

    // First check if user already has an assignment in the database
    if (userId) {
      const existingAssignment = await prisma.userPreferences.findUnique({
        where: { userId },
        select: { abTestAssignments: true }
      });

      if (existingAssignment?.abTestAssignments) {
        const assignments = existingAssignment.abTestAssignments as Record<string, string>;
        
        // If user already has assignment for this experiment, return it
        if (assignments[experimentId]) {
          return NextResponse.json({
            experimentId,
            variant: assignments[experimentId],
            isNewAssignment: false
          });
        }
      }
    }

    // Assign variant based on weights
    const variant = assignVariant(experiment.variants, experiment.weights || {}, experiment.defaultVariant);

    // If user is authenticated, save assignment in database
    if (userId) {
      // Get current assignments
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      if (preferences) {
        // Update existing preferences
        const currentAssignments = (preferences.abTestAssignments as Record<string, string>) || {};
        await prisma.userPreferences.update({
          where: { userId },
          data: {
            abTestAssignments: {
              ...currentAssignments,
              [experimentId]: variant
            }
          }
        });
      } else {
        // Create new preferences record
        await prisma.userPreferences.create({
          data: {
            userId,
            abTestAssignments: {
              [experimentId]: variant
            }
          }
        });
      }
    }

    return NextResponse.json({
      experimentId,
      variant,
      isNewAssignment: true
    });
  } catch (error) {
    console.error('Error assigning experiment variant:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Assigns a variant based on weights
 */
function assignVariant(
  variants: string[],
  weights: Record<string, number>,
  defaultVariant: string
): string {
  // If no variants or weights, return default
  if (!variants.length) {
    return defaultVariant;
  }

  // Normalize weights if provided
  const effectiveWeights: Record<string, number> = {};
  let totalWeight = 0;
  
  for (const variant of variants) {
    const weight = weights[variant] || 1 / variants.length;
    effectiveWeights[variant] = weight;
    totalWeight += weight;
  }
  
  // Normalize the weights to sum to 1
  for (const variant of variants) {
    effectiveWeights[variant] /= totalWeight;
  }
  
  // Use weighted random selection
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const variant of variants) {
    cumulativeWeight += effectiveWeights[variant];
    if (random <= cumulativeWeight) {
      return variant;
    }
  }
  
  // Fallback to default if something goes wrong
  return defaultVariant;
}

/**
 * POST tracks a conversion event for an experiment
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check if A/B testing is enabled
    if (env.NEXT_PUBLIC_ENABLE_AB_TESTING !== 'true') {
      return NextResponse.json({ 
        error: 'A/B testing is disabled'
      }, { status: 400 });
    }

    // Schema for conversion tracking
    const conversionSchema = z.object({
      experimentId: z.string(),
      variant: z.string(),
      conversionType: z.string(),
      userId: z.string().optional(),
      sessionId: z.string(),
      value: z.number().optional(),
    });

    // Parse and validate the request body
    const body = await req.json();
    const result = conversionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { experimentId, variant, conversionType, userId: requestUserId, sessionId, value } = result.data;

    // Get authentication if available
    const session = await getSession();
    const userId = session?.user?.sub || requestUserId;

    // Store conversion in analytics
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'ab_test_conversion',
        page: '',
        timestamp: new Date(),
        userId: userId || 'anonymous',
        sessionId,
        metadata: {
          experimentId,
          variant,
          conversionType,
          value: value || 1
        },
      },
    });

    return NextResponse.json({
      success: true,
      experimentId,
      variant,
      conversionType
    });
  } catch (error) {
    console.error('Error tracking experiment conversion:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 