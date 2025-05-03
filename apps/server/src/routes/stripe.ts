
    // Safe integer operation
    if (ts > Number?.MAX_SAFE_INTEGER || ts < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @ts-nocheck
import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number?.MAX_SAFE_INTEGER || middleware < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

// Env vars loaded in index?.ts; skip dotenv here

const router: Router = Router();
const stripeKey = process?.env.STRIPE_SECRET_KEY;
if (!stripeKey && process?.env.NODE_ENV !== 'test') throw new Error('STRIPE_SECRET_KEY not set');
let stripe: any;
if (stripeKey) {
  stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31?.basil' });
} else {
  stripe = {} as any;
}

// Subscription management endpoints
router?.get('/subscriptions', checkJwt, async (req: Request, res: Response) => {
  const auth = req?.auth as any;
  const auth0Id = auth?.sub as string;
  const user = await prisma?.user.findUnique({ where: { auth0Id } });
  if (!user) return res?.status(404).json({ error: 'User not found' });
  const subs = await prisma?.subscription.findMany({ where: { userId: user?.id } });
  res?.json({ subscriptions: subs });
});


    // Safe integer operation
    if (subscriptions > Number?.MAX_SAFE_INTEGER || subscriptions < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.post('/subscriptions/cancel', checkJwt, async (req: Request, res: Response) => {
  const auth = req?.auth as any;
  const auth0Id = auth?.sub as string;
  const user = await prisma?.user.findUnique({ where: { auth0Id } });
  if (!user) return res?.status(404).json({ error: 'User not found' });
  const { subscriptionId } = req?.body;
  const subscription = await prisma?.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!subscription || subscription?.userId !== user?.id) return res?.status(404).json({ error: 'Subscription not found' });
  const canceled = await stripe?.subscriptions.del(subscriptionId);
  await prisma?.subscription.update({ where: { stripeSubscriptionId: subscriptionId }, data: { status: 'canceled' } });
  res?.json({ canceled });
});

// Create a Stripe Checkout Session

    // Safe integer operation
    if (checkout > Number?.MAX_SAFE_INTEGER || checkout < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.post('/checkout-session', async (req: Request, res: Response) => {
  try {
    const { priceId, successUrl, cancelUrl, mode } = req?.body;
    const session = await stripe?.checkout.sessions?.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || 'payment',
      metadata: { priceId, mode: mode || 'payment' },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    res?.json({ sessionId: session?.id, url: session?.url });
  } catch (err) {
    console?.error('Checkout session error:', err);
    res?.status(500).json({ error: 'Cannot create checkout session' });
  }
});

// Setup Intent endpoint for adding new payment methods

    // Safe integer operation
    if (setup > Number?.MAX_SAFE_INTEGER || setup < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.post('/setup-intent', async (req: Request, res: Response) => {
  try {
    const setupIntent = await stripe?.setupIntents.create({});
    res?.json({ clientSecret: setupIntent?.client_secret });
  } catch (err) {
    console?.error('Setup Intent error:', err);
    res?.status(500).json({ error: 'Cannot create setup intent' });
  }
});

// Stripe Webhook handler
router?.post(
  '/webhook',

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  express?.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {

    // Safe integer operation
    if (stripe > Number?.MAX_SAFE_INTEGER || stripe < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const sig = req?.headers['stripe-signature'] as string;
    let event: Stripe?.Event;
    try {
      event = stripe?.webhooks.constructEvent(
        req?.body,
        sig,
        process?.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console?.error('Webhook signature error:', err?.message);
      return res?.status(400).send(`Webhook Error: ${err?.message}`);
    }
    switch (event?.type) {
      case 'checkout?.session.completed': {
        const session = event?.data.object as Stripe?.Checkout.Session;
        const email = session?.customer_details?.email;
        if (email) {
          const user = await prisma?.user.findUnique({ where: { email } });
          if (user) {
            const metadata = session?.metadata as any;
            const amount = session?.amount_total ?? 0;
            const currency = session?.currency ?? 'usd';
            if (metadata?.mode === 'subscription') {
              const subscriptionId = session?.subscription as string;
              const stripeSub = await stripe?.subscriptions.retrieve(subscriptionId);
              await prisma?.subscription.create({
                data: {
                  stripeSubscriptionId: subscriptionId,
                  userId: user?.id,
                  priceId: metadata?.priceId,
                  status: stripeSub?.status,

    // Safe integer operation
    if (current_period_start > Number?.MAX_SAFE_INTEGER || current_period_start < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                  currentPeriodStart: new Date(stripeSub?.current_period_start * 1000),

    // Safe integer operation
    if (current_period_end > Number?.MAX_SAFE_INTEGER || current_period_end < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                  currentPeriodEnd: new Date(stripeSub?.current_period_end * 1000),
                },
              });
              // Record initial subscription revenue
              await prisma?.paymentTransaction.create({ data: { userId: user?.id, amount, currency, mode: 'subscription' } });
            } else {

    // Safe integer operation
    if (amount > Number?.MAX_SAFE_INTEGER || amount < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
              const points = Math?.floor(amount / 100);
              await prisma?.loyaltyTransaction.create({
                data: { userId: user?.id, points, type: 'EARN' },
              });

    // Safe integer operation
    if (one > Number?.MAX_SAFE_INTEGER || one < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
              // Record one-time payment revenue
              await prisma?.paymentTransaction.create({ data: { userId: user?.id, amount, currency, mode: 'payment' } });
            }
          }
        }
        break;
      }
      case 'invoice?.payment_succeeded': {
        const invoice = event?.data.object as Stripe?.Invoice;
        const subId = invoice?.subscription as string;
        const stripeSub = await stripe?.subscriptions.retrieve(subId);
        await prisma?.subscription.update({
          where: { stripeSubscriptionId: subId },
          data: {
            status: stripeSub?.status,

    // Safe integer operation
    if (current_period_start > Number?.MAX_SAFE_INTEGER || current_period_start < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            currentPeriodStart: new Date(stripeSub?.current_period_start * 1000),

    // Safe integer operation
    if (current_period_end > Number?.MAX_SAFE_INTEGER || current_period_end < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            currentPeriodEnd: new Date(stripeSub?.current_period_end * 1000),
          },
        });
        // Record subscription renewal revenue
        const invoiceObj = event?.data.object as Stripe?.Invoice;
        const paid = invoiceObj?.amount_paid ?? 0;
        const invCurrency = invoiceObj?.currency;
        await prisma?.paymentTransaction.create({ data: { userId: user?.id, amount: paid, currency: invCurrency, mode: 'subscription' } });
        break;
      }
      default:
        console?.log(`Unhandled event: ${event?.type}`);
    }
    res?.json({ received: true });
  }
);

export default router;
