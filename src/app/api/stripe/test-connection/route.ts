import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    // Try to fetch account details to verify connection
    const account = await stripe.accounts.retrieve('account');

    return NextResponse.json({
      status: 'connected',
      message: 'Stripe connection successful',
      accountDetails: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      },
    });
  } catch (error: any) {
    console.error('Stripe connection error:', error);

    // Return detailed error information
    return NextResponse.json(
      {
        status: 'error',
        message: 'Stripe connection failed',
        error: {
          type: error.type,
          message: error.message,
          code: error.statusCode,
        },
        config: {
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
        },
      },
      { status: 500 },
    );
  }
}
