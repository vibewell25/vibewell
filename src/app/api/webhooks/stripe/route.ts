import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature') || '';

    if (!endpointSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification is disabled.');
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing successful payment:', paymentIntent.id);

    // Get the metadata from the payment intent
    const { userId, productId, bookingId } = paymentIntent.metadata || {};

    if (bookingId) {
      // Update booking status in your database
      // await prisma.booking.update({ where: { id: bookingId }, data: { status: 'paid' } });
      console.log(`Booking ${bookingId} marked as paid`);
    }

    if (productId) {
      // Process product purchase
      // await prisma.order.create({ ... });
      console.log(`Product ${productId} purchase processed`);
    }

    // Send confirmation email to customer
    // await sendPaymentConfirmation(paymentIntent.receipt_email, paymentIntent.amount, paymentIntent.currency);
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
    // Consider implementing a retry mechanism or alerting system
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing failed payment:', paymentIntent.id);

    const { userId, bookingId } = paymentIntent.metadata || {};

    if (bookingId) {
      // Update booking status in your database
      // await prisma.booking.update({ where: { id: bookingId }, data: { status: 'payment_failed' } });
      console.log(`Booking ${bookingId} marked as payment failed`);
    }

    // Notify customer about the failed payment
    // await sendPaymentFailureNotification(paymentIntent.receipt_email);
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout session:', session.id);

    // Retrieve the session with line items
    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });

    const lineItems = expandedSession.line_items;

    // Process subscription or one-time payment
    if (session.mode === 'subscription') {
      // Handle subscription
      // await processSubscription(session);
      console.log(`Subscription processed for session ${session.id}`);
    } else if (session.mode === 'payment') {
      // Handle one-time payment
      // await processOneTimePayment(session, lineItems);
      console.log(`One-time payment processed for session ${session.id}`);
    }
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
  }
}
