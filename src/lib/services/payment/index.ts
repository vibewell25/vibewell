/**
 * Payment service implementation
 */
import Stripe from 'stripe';
import prisma from '../../prisma';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Payment method interface
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Payment interface
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethodId: string;
  createdAt: Date;
}

// Payment intent interface
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(
  bookingId: string,
  amount: number,
  currency: string = 'usd'
): Promise<PaymentIntent> {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency,
    metadata: { bookingId },
  });

  return {
    id: intent.id,
    amount: intent.amount / 100,
    currency: intent.currency,
    status: intent.status as any,
    clientSecret: intent.client_secret!,
  };
}

/**
 * Get user payment methods
 */
export async function getUserPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  const customer = await getOrCreateCustomer(userId);
  const methods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card',
  });

  return methods.data.map(method => ({
    id: method.id,
    type: mapPaymentMethodType(method.type),
    last4: method.card?.last4,
    expiryMonth: method.card?.exp_month,
    expiryYear: method.card?.exp_year,
    isDefault: customer.invoice_settings.default_payment_method === method.id,
  }));
}

/**
 * Add a payment method for a user
 */
export async function addPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> {
  const customer = await getOrCreateCustomer(userId);
  
  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  });
  
  // Get payment method details
  const method = await stripe.paymentMethods.retrieve(paymentMethodId);
  
  return {
    id: method.id,
    type: mapPaymentMethodType(method.type),
    last4: method.card?.last4,
    expiryMonth: method.card?.exp_month,
    expiryYear: method.card?.exp_year,
    isDefault: false,
  };
}

/**
 * Process a payment for a booking
 */
export async function processPayment(
  bookingId: string,
  paymentMethodId: string,
  amount: number,
  currency: string = 'usd'
): Promise<Payment> {
  // Create payment intent
  const intent = await createPaymentIntent(bookingId, amount, currency);
  
  // Confirm payment using payment method
  const confirmedIntent = await stripe.paymentIntents.confirm(intent.id, {
    payment_method: paymentMethodId,
  });
  
  // Save payment record in database
  const payment = await prisma.payment.create({
    data: {
      stripePaymentIntentId: confirmedIntent.id,
      bookingId,
      amount,
      currency,
      status: mapPaymentStatus(confirmedIntent.status),
      paymentMethodId,
    },
  });
  
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status as any,
    paymentMethodId: payment.paymentMethodId,
    createdAt: payment.createdAt,
  };
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentId: string): Promise<Payment> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  
  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }
  
  // Process refund via Stripe
  await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
  });
  
  // Update payment status in database
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'refunded' },
  });
  
  return {
    id: updatedPayment.id,
    bookingId: updatedPayment.bookingId,
    amount: updatedPayment.amount,
    currency: updatedPayment.currency,
    status: updatedPayment.status as any,
    paymentMethodId: updatedPayment.paymentMethodId,
    createdAt: updatedPayment.createdAt,
  };
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string): Promise<Payment> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  
  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }
  
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status as any,
    paymentMethodId: payment.paymentMethodId,
    createdAt: payment.createdAt,
  };
}

// Helper functions
async function getOrCreateCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  
  if (!user) throw new Error(`User ${userId} not found`);
  
  if (user.stripeCustomerId) {
    return await stripe.customers.retrieve(user.stripeCustomerId);
  }
  
  // Create new customer
  const customer = await stripe.customers.create({
    email: user.email!,
    name: user.name || undefined,
    metadata: { userId: user.id },
  });
  
  // Save customer ID to user
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  
  return customer;
}

function mapPaymentMethodType(type: string): PaymentMethod['type'] {
  switch (type) {
    case 'card': return 'credit_card';
    case 'paypal': return 'paypal';
    case 'apple_pay': return 'apple_pay';
    case 'google_pay': return 'google_pay';
    default: return 'credit_card';
  }
}

function mapPaymentStatus(status: string): Payment['status'] {
  switch (status) {
    case 'succeeded': return 'completed';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'processing': return 'pending';
    case 'canceled': return 'failed';
    default: return 'pending';
  }
} 