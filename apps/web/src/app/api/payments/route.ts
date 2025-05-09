import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@auth0/nextjs-auth0';
import { z } from 'zod';
import Stripe from 'stripe';

// Import from app/api/auth/rate-limit-middleware.ts
import { apiRateLimiter, applyRateLimit } from '@/app/api/auth/rate-limit-middleware';
import { prisma } from '@/lib/database/client';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Security headers for payment endpoints
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Strict Transport Security - force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent content type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache control - no caching for payment data
  response.headers.set('Cache-Control', 'no-store, private, max-age=0');
  
  return response;
}

// Schema for validating payment intent creation
const paymentIntentSchema = z.object({
  amount: z.number().min(100, 'Amount must be at least 1.00'),
  currency: z.string().length(3).default('usd'),
  description: z.string().optional(),
  booking_id: z.string().optional(),
  service_id: z.string().optional(),
  payment_method_id: z.string().optional(),
});

// Schema for confirming payment
const confirmPaymentSchema = z.object({
  payment_intent_id: z.string(),
  payment_method_id: z.string().optional(),
});

/**
 * Create a payment intent
 */
export async function POST(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply financial rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse); // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const result = paymentIntentSchema.safeParse(body);

    if (!result.success) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Get the validated data
    const { amount, currency, description, booking_id, service_id, payment_method_id } =
      result.data;

    // Check if user is authenticated with Auth0
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const userId = session.user.sub;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: {
        user_id: userId,
        booking_id: booking_id || '',
        service_id: service_id || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      ...(payment_method_id && { payment_method: payment_method_id }),
    });

    // Store payment intent in database for tracking using Prisma
    try {
      await prisma.paymentIntent.create({
        data: {
          id: paymentIntent.id,
          userId: userId,
          amount,
          currency,
          status: paymentIntent.status,
          bookingId: booking_id,
          serviceId: service_id,
          createdAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error('Error storing payment intent:', dbError);
      // Continue even if DB storage fails
    }

    // Return the client secret to the client
    const successResponse = NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
    
    return addSecurityHeaders(successResponse);
  } catch (error: any) {
    console.error('Payment intent creation error:', error);

    // Handle Stripe errors with appropriate status codes
    if (error.type === 'StripeCardError') {
      const errorResponse = NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const errorResponse = NextResponse.json(
      { error: 'Payment processing error' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

/**
 * Confirm a payment intent
 */
export async function PUT(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply financial rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse); // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const result = confirmPaymentSchema.safeParse(body);

    if (!result.success) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const { payment_intent_id, payment_method_id } = result.data;

    // Check if user is authenticated with Auth0
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Verify that this payment intent belongs to the user
    const paymentRecord = await prisma.paymentIntent.findUnique({
      where: { id: payment_intent_id }
    });
    
    if (!paymentRecord || paymentRecord.userId !== session.user.sub) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 403 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      ...(payment_method_id && { payment_method: payment_method_id }),
    });

    // Update payment intent in database using Prisma
    try {
      await prisma.paymentIntent.update({
        where: { id: payment_intent_id },
        data: {
          status: paymentIntent.status,
          updatedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error('Error updating payment intent:', dbError);
      // Continue even if DB update fails
    }

    // Return the updated payment intent status
    const successResponse = NextResponse.json({
      status: paymentIntent.status,
      id: paymentIntent.id,
    });
    
    return addSecurityHeaders(successResponse);
  } catch (error: any) {
    console.error('Payment confirmation error:', error);

    // Handle Stripe errors with appropriate status codes
    if (error.type === 'StripeCardError') {
      const errorResponse = NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const errorResponse = NextResponse.json(
      { error: 'Payment processing error' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

/**
 * Get payment intents for the current user
 */
export async function GET(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply financial rate limiting (less restrictive for read operations)
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse); // Rate limit exceeded
    }

    // Check if user is authenticated with Auth0
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const userId = session.user.sub;

    // Get payment intents for the current user using Prisma
    try {
      const payments = await prisma.paymentIntent.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
      });
      
      const successResponse = NextResponse.json({ payments });
      return addSecurityHeaders(successResponse);
    } catch (dbError) {
      console.error('Error fetching payment intents:', dbError);
      const errorResponse = NextResponse.json(
        { error: 'Failed to fetch payment history' }, 
        { status: 500 }
      );
      return addSecurityHeaders(errorResponse);
    }
  } catch (error) {
    console.error('Payment history error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch payment history' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}
