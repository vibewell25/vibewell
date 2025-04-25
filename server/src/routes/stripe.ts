// @ts-nocheck
import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

dotenv.config();

const router: Router = Router();
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not set');
const stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' });

// Subscription management endpoints
router.get('/subscriptions', checkJwt, async (req: Request, res: Response) => {
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const subs = await prisma.subscription.findMany({ where: { userId: user.id } });
  res.json({ subscriptions: subs });
});

router.post('/subscriptions/cancel', checkJwt, async (req: Request, res: Response) => {
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { subscriptionId } = req.body;
  const subscription = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!subscription || subscription.userId !== user.id) return res.status(404).json({ error: 'Subscription not found' });
  const canceled = await stripe.subscriptions.del(subscriptionId);
  await prisma.subscription.update({ where: { stripeSubscriptionId: subscriptionId }, data: { status: 'canceled' } });
  res.json({ canceled });
});

// Create a Stripe Checkout Session
router.post('/checkout-session', async (req: Request, res: Response) => {
  try {
    const { priceId, successUrl, cancelUrl, mode } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || 'payment',
      metadata: { priceId, mode: mode || 'payment' },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Cannot create checkout session' });
  }
});

// Setup Intent endpoint for adding new payment methods
router.post('/setup-intent', async (req: Request, res: Response) => {
  try {
    const setupIntent = await stripe.setupIntents.create({});
    res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('Setup Intent error:', err);
    res.status(500).json({ error: 'Cannot create setup intent' });
  }
});

// Stripe Webhook handler
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email;
        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            const metadata = session.metadata as any;
            const amount = session.amount_total ?? 0;
            const currency = session.currency ?? 'usd';
            if (metadata.mode === 'subscription') {
              const subscriptionId = session.subscription as string;
              const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
              await prisma.subscription.create({
                data: {
                  stripeSubscriptionId: subscriptionId,
                  userId: user.id,
                  priceId: metadata.priceId,
                  status: stripeSub.status,
                  currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                  currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                },
              });
              // Record initial subscription revenue
              await prisma.paymentTransaction.create({ data: { userId: user.id, amount, currency, mode: 'subscription' } });
            } else {
              const points = Math.floor(amount / 100);
              await prisma.loyaltyTransaction.create({
                data: { userId: user.id, points, type: 'EARN' },
              });
              // Record one-time payment revenue
              await prisma.paymentTransaction.create({ data: { userId: user.id, amount, currency, mode: 'payment' } });
            }
          }
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        const stripeSub = await stripe.subscriptions.retrieve(subId);
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subId },
          data: {
            status: stripeSub.status,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
        });
        // Record subscription renewal revenue
        const invoiceObj = event.data.object as Stripe.Invoice;
        const paid = invoiceObj.amount_paid ?? 0;
        const invCurrency = invoiceObj.currency;
        await prisma.paymentTransaction.create({ data: { userId: user.id, amount: paid, currency: invCurrency, mode: 'subscription' } });
        break;
      }
      default:
        console.log(`Unhandled event: ${event.type}`);
    }
    res.json({ received: true });
  }
);

export default router;
