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
export {};

// Helper function to retrieve a customer by email
export {};

// Helper function to create a new customer
export {};

// Export Stripe instance for direct use
export default stripe;
