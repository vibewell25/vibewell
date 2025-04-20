import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Get subscriptions that are set to cancel
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    if (!subscriptions.data.length) {
      return NextResponse.json(
        { error: 'No subscription found to reactivate' },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];

    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Remove the cancellation schedule
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      { cancel_at_period_end: false }
    );

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
        interval: price.recurring?.interval || 'month',
      },
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
} 