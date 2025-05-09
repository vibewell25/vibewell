import Stripe from 'stripe';

// Initialize Stripe with API key
const stripeSecretKey = process.env['STRIPE_SECRET_KEY'] || '';

if (!stripeSecretKey && typeof window === 'undefined') {
  console.error('Missing Stripe secret key. Payments will not work.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use the latest stable API version
  appInfo: {
    name: 'Vibewell',
    version: '1.0.0',
  },
});

// Helper function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Create a payment intent for a single charge
export async function createPaymentIntent(
  amount: number, 
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }
  });
}

// Create a Stripe Checkout session for product purchase
export async function createCheckoutSession(
  params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    mode?: 'payment' | 'subscription' | 'setup';
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Checkout.Session> {
  const {
    priceId,
    successUrl,
    cancelUrl,
    customerId,
    mode = 'subscription',
    metadata = {}
  } = params;

  return await stripe.checkout.sessions.create({
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    metadata,
  });
}

// Create or retrieve a Stripe customer for a user
export async function getOrCreateCustomer(
  email: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  return await stripe.customers.create({
    email,
    metadata,
  });
}

// Handle Stripe webhook event
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<{ success: boolean; message: string }> {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment intent
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Process business logic (update database, send emails, etc.)
        return { success: true, message: `PaymentIntent ${paymentIntent.id} was successful` };

      case 'payment_intent.payment_failed':
        // Handle failed payment intent
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        // Process business logic (update database, notify customer, etc.)
        return { success: true, message: `PaymentIntent ${failedPaymentIntent.id} failed` };

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription changes
        const subscription = event.data.object as Stripe.Subscription;
        // Process subscription updates
        return { success: true, message: `Subscription ${subscription.id} was ${event.type.split('.')[2]}` };
      
      default:
        return { success: true, message: `Unhandled event type: ${event.type}` };
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error processing webhook'
    };
  }
}
