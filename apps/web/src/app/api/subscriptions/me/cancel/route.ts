import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Get user with stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
// Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
if (!subscriptions.data.length) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
const subscription = subscriptions.data[0];

    // Cancel at period end
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);

    return NextResponse.json({
      id: updatedSubscription.id,
      status: updatedSubscription.status,

      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      plan: {
        id: price.id,
        name: price.nickname || 'Default Plan',
        price: price.unit_amount! / 100,
        interval: price.recurring.interval || 'month',
catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
