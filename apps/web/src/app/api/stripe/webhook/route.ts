import Stripe from 'stripe';

import { headers } from 'next/headers';

import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: Request) {
  try {
    const body = await req.text();

    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        // Handle new subscription
        await handleNewSubscription(subscription);
        break;

      case 'customer.subscription.updated':
        // Handle subscription update
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        // Handle successful payment
        await handleSuccessfulPayment(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        // Handle failed payment
        await handleFailedPayment(event.data.object as Stripe.Invoice);
        break;
return NextResponse.json({ received: true });
catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handleNewSubscription(subscription: Stripe.Subscription) {
  // Update your database with new subscription details
  // Send welcome email to customer
  // Update user's access level
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Update subscription details in your database
  // Handle plan changes
  // Update user's access level if needed
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  // Update subscription status in your database
  // Remove user's access
  // Send cancellation email
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handleSuccessfulPayment(invoice: Stripe.Invoice) {
  // Update payment status in your database
  // Send receipt to customer
  // Update subscription status
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handleFailedPayment(invoice: Stripe.Invoice) {
  // Mark payment as failed in your database
  // Send notification to customer
  // Update subscription status
