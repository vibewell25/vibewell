import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { env } from '@/config/env';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Disable Next.js body parsing - we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Get the raw body as a buffer
    const rawBody = await buffer(req);
    
    // Validate Stripe signature
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      logger.warn('Stripe webhook called without signature', {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        timestamp: new Date().toISOString(),
      });
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const error = err as Error;
      logger.error('Stripe webhook signature verification failed', {
        error: error.message,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      });
      return res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
    }

    // Log event for monitoring
    logger.info('Stripe webhook received', {
      eventType: event.type,
      eventId: event.id,
      timestamp: event.created,
    });

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Extract metadata (add validation if needed)
        const { userId, orderId } = paymentIntent.metadata;
        
        if (!userId || !orderId) {
          logger.warn('Payment intent missing required metadata', {
            paymentIntentId: paymentIntent.id,
          });
          return res.status(400).json({ error: 'Missing required metadata' });
        }
        
        // Update order status in database
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentId: paymentIntent.id,
            updatedAt: new Date(),
          },
        });
        
        logger.info('Payment succeeded', {
          paymentIntentId: paymentIntent.id,
          userId,
          orderId,
          amount: paymentIntent.amount,
        });
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, orderId } = paymentIntent.metadata;
        
        if (userId && orderId) {
          // Update order status
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'FAILED',
              paymentId: paymentIntent.id,
              updatedAt: new Date(),
            },
          });
        }
        
        logger.warn('Payment failed', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message || 'Unknown error',
          userId,
          orderId,
        });
        
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId },
        });
        
        if (!user) {
          logger.warn('Subscription event for unknown customer', {
            subscriptionId: subscription.id,
            stripeCustomerId,
          });
          return res.status(400).json({ error: 'Unknown customer' });
        }
        
        // Update subscription status
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscription.id
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            planId: subscription.items.data[0]?.price.id || '',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        
        logger.info('Subscription updated', {
          subscriptionId: subscription.id,
          userId: user.id,
          status: subscription.status,
        });
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'canceled',
            canceledAt: new Date(),
          },
        });
        
        logger.info('Subscription canceled', {
          subscriptionId: subscription.id,
        });
        
        break;
      }
      
      default:
        // Unexpected event type
        logger.info('Unhandled Stripe event', { eventType: event.type });
    }
    
    // Return success response
    res.status(200).json({ received: true });
  } catch (err) {
    // Handle any unexpected errors
    const error = err as Error;
    logger.error('Error processing Stripe webhook', {
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({ error: 'Internal server error' });
  }
} 