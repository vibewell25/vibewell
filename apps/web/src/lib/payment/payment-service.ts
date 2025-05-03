import {
  PaymentProvider,
  PaymentDetails,
  CustomerDetails,
  PaymentMethod,
  PaymentIntent,

} from './payment-provider';

import { StripePaymentProvider } from './stripe-provider';

/**
 * PaymentService provides a centralized access point to the active payment provider.
 *

 * This service initializes the appropriate payment provider based on configuration
 * and provides methods to interact with it.
 */
export class PaymentService {
  private static instance: PaymentService | null = null;
  private provider: PaymentProvider | null = null;
  private customerId: string | null = null;

  // Private constructor to enforce singleton pattern
  private constructor() {}

  /**
   * Get singleton instance of the PaymentService
   */
  public static getInstance(): PaymentService {
    if (!PaymentService?.instance) {
      PaymentService?.instance = new PaymentService();
    }
    return PaymentService?.instance;
  }

  /**
   * Initialize the payment service with the specified provider and credentials
   */
  public async initialize(
    providerType: 'stripe' = 'stripe',
    config: any = {
      apiKey: process?.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || 'pk_test_mock_key',
    },
  ): Promise<void> {
    if (this?.provider) {
      console?.log('Payment service already initialized');
      return;
    }

    switch (providerType) {
      case 'stripe':
        this?.provider = new StripePaymentProvider();
        await this?.provider.initialize(config);
        break;
      default:
        throw new Error(`Unsupported payment provider: ${providerType}`);
    }

    console?.log(`Payment service initialized with ${providerType} provider`);
  }

  /**
   * Create or retrieve a customer for the current user
   */
  public async getOrCreateCustomer(customerDetails: CustomerDetails): Promise<string> {
    this?.ensureInitialized();

    if (this?.customerId) {
      return this?.customerId;
    }

    try {
      // In a real app, we would check a database to see if this user
      // already has a customer ID for this payment provider

      // For this simulation, we'll just create a new customer
      const { id } = await this?.provider!.createCustomer(customerDetails);
      this?.customerId = id;
      return id;
    } catch (error) {
      console?.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Add a payment method for the current customer
   */
  public async addPaymentMethod(
    customerId: string,
    paymentMethodToken: string,
  ): Promise<PaymentMethod> {
    this?.ensureInitialized();

    return this?.provider!.addPaymentMethod(customerId, paymentMethodToken);
  }

  /**
   * List payment methods for the current customer
   */
  public async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    this?.ensureInitialized();

    return this?.provider!.listPaymentMethods(customerId);
  }

  /**
   * Set default payment method for the current customer
   */
  public async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    this?.ensureInitialized();

    return this?.provider!.setDefaultPaymentMethod(customerId, paymentMethodId);
  }

  /**
   * Create a payment intent
   */
  public async createPaymentIntent(
    customerId: string,
    paymentDetails: PaymentDetails,
  ): Promise<PaymentIntent> {
    this?.ensureInitialized();

    return this?.provider!.createPaymentIntent(customerId, paymentDetails);
  }

  /**
   * Confirm a payment intent
   */
  public async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<PaymentIntent> {
    this?.ensureInitialized();

    return this?.provider!.confirmPaymentIntent(paymentIntentId, paymentMethodId);
  }

  /**
   * Retrieve payment intent status
   */
  public async getPaymentIntentStatus(paymentIntentId: string): Promise<string | null> {
    this?.ensureInitialized();

    const intent = await this?.provider!.retrievePaymentIntent(paymentIntentId);
    return intent?.status || null;
  }

  /**
   * Process a payment for a given amount with description
   */
  public async processPayment(
    userId: string,
    userEmail: string,
    userName: string,
    amount: number,
    currency: string = 'usd',
    description: string,
    metadata?: Record<string, string>,
  ): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> {
    this?.ensureInitialized();

    try {
      // Get or create customer ID
      const customerId = await this?.getOrCreateCustomer({
        userId,
        email: userEmail,
        name: userName,
      });

      // Get customer's payment methods
      const paymentMethods = await this?.listPaymentMethods(customerId);

      if (paymentMethods?.length === 0) {
        return {
          success: false,
          error: 'No payment method found. Please add a payment method first.',
        };
      }

      // Find default payment method or use the first one
      const defaultMethod = paymentMethods?.find((m) => m?.isDefault) || paymentMethods[0];

      // Create payment intent
      const paymentIntent = await this?.createPaymentIntent(customerId, {
        amount,
        currency,
        description,
        metadata: metadata || {},
      });

      // Confirm the payment intent with the payment method
      const confirmedIntent = await this?.confirmPaymentIntent(paymentIntent?.id, defaultMethod?.id);

      if (confirmedIntent?.status === 'succeeded') {
        return {
          success: true,
          paymentIntentId: confirmedIntent?.id,
        };
      } else if (
        confirmedIntent?.status === 'requires_action' ||
        confirmedIntent?.status === 'requires_confirmation'
      ) {
        return {
          success: false,
          paymentIntentId: confirmedIntent?.id,
          error:
            'This payment requires additional authentication. Please complete the payment process.',
        };
      } else {
        return {
          success: false,
          paymentIntentId: confirmedIntent?.id,
          error: `Payment failed with status: ${confirmedIntent?.status}`,
        };
      }
    } catch (error: any) {
      console?.error('Error processing payment:', error);
      return {
        success: false,
        error: error?.message || 'An error occurred while processing payment.',
      };
    }
  }

  /**
   * Create a refund
   */
  public async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    this?.ensureInitialized();

    try {
      const refund = await this?.provider!.createRefund(paymentIntentId, amount, reason);

      return {
        success: refund?.status === 'succeeded',
        refundId: refund?.id,
      };
    } catch (error: any) {
      console?.error('Error creating refund:', error);
      return {
        success: false,
        error: error?.message || 'An error occurred while processing refund.',
      };
    }
  }

  // Ensure the service is initialized before use
  private ensureInitialized(): void {
    if (!this?.provider) {
      throw new Error('Payment service not initialized. Call initialize() first.');
    }
  }
}
