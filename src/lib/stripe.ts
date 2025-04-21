import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not defined. Stripe functionality will be limited.');
}

// Initialize Stripe with your secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Use the latest API version or specify one
  appInfo: {
    name: 'VibeWell Platform',
    version: '1.0.0',
  },
});

// Helper function to create a payment intent
export const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  metadata = {},
  customer = undefined,
}: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  customer?: string;
}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      customer,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Helper function to retrieve a customer by email
export const getCustomerByEmail = async (email: string) => {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data.length > 0 ? customers.data[0] : null;
  } catch (error) {
    console.error('Error getting customer by email:', error);
    throw error;
  }
};

// Helper function to create a new customer
export const createCustomer = async ({
  email,
  name,
  metadata = {},
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Export Stripe instance for direct use
export default stripe;
