import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import Stripe from 'stripe';
import { financialRateLimiter, applyRateLimit } from '@/lib/rate-limiter';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

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
  try {
    // Apply financial rate limiting
    const rateLimitResponse = await applyRateLimit(req, financialRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json();
    const result = paymentIntentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Get the validated data
    const { amount, currency, description, booking_id, service_id, payment_method_id } = result.data;
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: {
        user_id: session.user.id,
        booking_id: booking_id || '',
        service_id: service_id || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      ...(payment_method_id && { payment_method: payment_method_id }),
    });
    
    // Store payment intent in database for tracking
    const { error: dbError } = await supabase
      .from('payment_intents')
      .insert([
        {
          id: paymentIntent.id,
          user_id: session.user.id,
          amount,
          currency,
          status: paymentIntent.status,
          booking_id,
          service_id,
          created_at: new Date().toISOString(),
        },
      ]);
    
    if (dbError) {
      console.error('Error storing payment intent:', dbError);
      // Continue even if DB storage fails
    }
    
    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    
    // Handle Stripe errors with appropriate status codes
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Payment processing error' },
      { status: 500 }
    );
  }
}

/**
 * Confirm a payment intent
 */
export async function PUT(req: NextRequest) {
  try {
    // Apply financial rate limiting
    const rateLimitResponse = await applyRateLimit(req, financialRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = confirmPaymentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { payment_intent_id, payment_method_id } = result.data;
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      ...(payment_method_id && { payment_method: payment_method_id }),
    });
    
    // Update payment intent in database
    const { error: dbError } = await supabase
      .from('payment_intents')
      .update({
        status: paymentIntent.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_intent_id);
    
    if (dbError) {
      console.error('Error updating payment intent:', dbError);
      // Continue even if DB update fails
    }
    
    // Return the updated payment intent status
    return NextResponse.json({
      status: paymentIntent.status,
      id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    
    // Handle Stripe errors with appropriate status codes
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Payment processing error' },
      { status: 500 }
    );
  }
}

/**
 * Get payment intents for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Apply financial rate limiting (less restrictive for read operations)
    const rateLimitResponse = await applyRateLimit(req, financialRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get payment intents for the current user
    const { data, error } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payment intents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment history' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ payments: data });
  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
} 