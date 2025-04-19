import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/auth/middleware';
import { createPaymentIntent, getCustomerByEmail, createCustomer } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { amount, currency = 'usd', description, metadata = {} } = await req.json();

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount' },
          { status: 400 }
        );
      }

      // Find or create a Stripe customer
      let customerId: string | undefined;

      if (user.email) {
        const customer = await getCustomerByEmail(user.email);
        
        if (customer) {
          customerId = customer.id;
        } else {
          // Create a new customer if one doesn't exist
          const newCustomer = await createCustomer({
            email: user.email,
            name: user.name,
            metadata: {
              userId: user.sub,
            },
          });
          
          customerId = newCustomer.id;
        }
      }

      // Create payment intent with the customer ID if available
      const paymentIntent = await createPaymentIntent({
        amount,
        currency,
        customer: customerId,
        metadata: {
          userId: user.sub,
          description,
          ...metadata,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }
  });
} 