import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with the secret key
const stripeSecretKey = process.env['STRIPE_SECRET_KEY'] || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent content type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Cache control - no caching for webhook responses
  response.headers.set('Cache-Control', 'no-store');
  
  return response;
}

// Define interfaces for webhook handling
interface WebhookHandlerResult {
  success: boolean;
  message: string;
}

// Use the new Next.js 14 route segment config
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto';

export async function POST(req: NextRequest) {
  try {
    // Get the webhook signature from the headers
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header in webhook request');
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Missing stripe-signature header' },
          { status: 400 }
        )
      );
    }

    // Get the Stripe webhook secret from the environment
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] || '';

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        )
      );
    }

    // Get the raw request body
    const rawBody = await req.text();
    
    if (!rawBody) {
      console.error('Empty webhook request body');
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        )
      );
    }

    // Verify the webhook signature and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return addSecurityHeaders(
        NextResponse.json(
          { error: `Webhook Error: ${err.message}` },
          { status: 400 }
        )
      );
    }

    // Log the event type (but not sensitive data)
    console.log(`Processing Stripe webhook event: ${event.type} [${event.id}]`);

    // Handle the verified webhook event
    const result = await handleWebhookEvent(event);

    if (!result.success) {
      console.error(`Error handling webhook: ${result.message}`);
      return addSecurityHeaders(
        NextResponse.json(
          { error: result.message },
          { status: 400 }
        )
      );
    }

    // Return a successful response
    return addSecurityHeaders(
      NextResponse.json({ received: true, type: event.type })
    );
  } catch (error) {
    // Handle any other errors
    console.error('Unexpected error handling webhook:', error);
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}

// Handle webhook events
async function handleWebhookEvent(event: any): Promise<WebhookHandlerResult> {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment intent
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        // Update database, send emails, etc.
        return { success: true, message: `PaymentIntent ${paymentIntent.id} was successful` };

      case 'payment_intent.payment_failed':
        // Handle failed payment intent
        const failedPaymentIntent = event.data.object;
        console.log(`Payment failed: ${failedPaymentIntent.id}`);
        // Update database, notify customer, etc.
        return { success: true, message: `PaymentIntent ${failedPaymentIntent.id} failed` };

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription changes
        const subscription = event.data.object;
        console.log(`Subscription event: ${event.type} for ${subscription.id}`);
        // Update subscription status in database
        return { success: true, message: `Subscription ${subscription.id} was ${event.type.split('.')[2]}` };
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, message: `Unhandled event type: ${event.type}` };
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error processing webhook'
    };
  }
}
