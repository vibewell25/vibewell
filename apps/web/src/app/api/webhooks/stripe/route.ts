import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleWebhookEvent } from '@/lib/stripe';
import { headers } from 'next/headers';

// Disable Next.js body parsing to get the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Get the webhook signature from the headers
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get the Stripe webhook secret from the environment
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] || '';

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get the raw request body
    const rawBody = await req.text();

    // Verify the webhook signature and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the verified webhook event
    const result = await handleWebhookEvent(event);

    if (!result.success) {
      console.error(`Error handling webhook: ${result.message}`);
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Return a successful response
    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    // Handle any other errors
    console.error('Unexpected error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
