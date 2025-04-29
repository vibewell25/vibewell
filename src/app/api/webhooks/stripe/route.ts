import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { PaymentStatus, PaymentProcessingStatus } from '@prisma/client';

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

// Idempotency key TTL in seconds (24 hours)
const IDEMPOTENCY_TTL = 86400;

async function updatePaymentStatus(
  paymentIntentId: string,
  status: PaymentStatus,
  processingStatus: PaymentProcessingStatus,
  errorMessage?: string
) {
  try {
    await prisma.payment.update({
      where: { stripeId: paymentIntentId },
      data: {
        status,
        processingStatus,
        errorMessage,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return new NextResponse('Missing stripe-signature header', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Check idempotency
    const idempotencyKey = `stripe:webhook:${event.id}`;
    const processed = await redis.get(idempotencyKey);
    if (processed) {
      return new NextResponse('Event already processed', { status: 200 });
    }

    // Process the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updatePaymentStatus(
          paymentIntent.id,
          PaymentStatus.COMPLETED,
          PaymentProcessingStatus.CAPTURED
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const error = paymentIntent.last_payment_error;
        await updatePaymentStatus(
          paymentIntent.id,
          PaymentStatus.FAILED,
          PaymentProcessingStatus.FAILED,
          error?.message
        );
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updatePaymentStatus(
          paymentIntent.id,
          PaymentStatus.PENDING,
          PaymentProcessingStatus.REQUIRES_ACTION
        );
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntent = await stripe.paymentIntents.retrieve(dispute.payment_intent as string);
        await updatePaymentStatus(
          paymentIntent.id,
          PaymentStatus.DISPUTED,
          PaymentProcessingStatus.FAILED,
          dispute.reason
        );
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
        const isPartialRefund = charge.amount_refunded < charge.amount;
        
        await updatePaymentStatus(
          paymentIntent.id,
          isPartialRefund ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
          PaymentProcessingStatus.CAPTURED
        );
        break;
      }
    }

    // Mark event as processed
    await redis.setex(idempotencyKey, IDEMPOTENCY_TTL, 'true');

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
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
