import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processPayment, refundPayment, getPaymentDetails } from './payment-service';

// Mock external dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    payment: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    transaction: vi.fn(),
  },
}));

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
      refunds: {
        create: vi.fn(),
      },
    })),
  };
});

// Import for type checking but use mocked version
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

describe('Payment Service', () => {
  let mockStripeInstance: any;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockStripeInstance = {
      paymentIntents: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
      refunds: {
        create: vi.fn(),
      },
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('processPayment', () => {
    it('should successfully process a payment', async () => {
      // Setup mocks
      const mockPaymentIntent = {
        id: 'pi_123456',
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        client_secret: 'secret_123',
      };

      const mockPaymentRecord = {
        id: 'payment_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: 'pi_123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup the mock returns
      mockStripeInstance.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      (prisma.payment.create as any).mockResolvedValue(mockPaymentRecord);

      // Call the function
      const paymentData = {
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        paymentMethodId: 'pm_123',
        description: 'Test payment',
      };

      const result = await processPayment(paymentData);

      // Verify the result
      expect(result).toEqual(mockPaymentRecord);

      // Verify Stripe was called correctly
      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        payment_method: 'pm_123',
        confirm: true,
        description: 'Test payment',
      });

      // Verify database record was created
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          amount: 1000,
          currency: 'usd',
          status: 'completed',
          description: 'Test payment',
          stripePaymentIntentId: 'pi_123456',
        },
      });
    });

    it('should handle payment processing failures', async () => {
      // Setup Stripe to throw an error
      mockStripeInstance.paymentIntents.create.mockRejectedValue(
        new Error('Insufficient funds')
      );

      // Call the function and expect it to throw
      const paymentData = {
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        paymentMethodId: 'pm_123',
        description: 'Test payment',
      };

      await expect(processPayment(paymentData)).rejects.toThrow(/Failed to process payment/);

      // Verify no database record was created
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });

    it('should handle payment with pending status', async () => {
      // Setup mocks for a pending payment
      const mockPaymentIntent = {
        id: 'pi_123456',
        status: 'requires_action',
        amount: 1000,
        currency: 'usd',
        client_secret: 'secret_123',
        next_action: { type: '3d_secure_redirect' },
      };

      const mockPaymentRecord = {
        id: 'payment_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        status: 'pending',
        stripePaymentIntentId: 'pi_123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup the mock returns
      mockStripeInstance.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      (prisma.payment.create as any).mockResolvedValue(mockPaymentRecord);

      // Call the function
      const paymentData = {
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        paymentMethodId: 'pm_123',
        description: 'Test payment',
      };

      const result = await processPayment(paymentData);

      // Verify the result
      expect(result).toEqual({
        ...mockPaymentRecord,
        requiresAction: true,
        clientSecret: 'secret_123',
      });

      // Verify database record was created with pending status
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          amount: 1000,
          currency: 'usd',
          status: 'pending',
          description: 'Test payment',
          stripePaymentIntentId: 'pi_123456',
        },
      });
    });
  });

  describe('refundPayment', () => {
    it('should successfully refund a payment', async () => {
      // Setup mocks
      const mockPaymentRecord = {
        id: 'payment_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: 'pi_123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRefund = {
        id: 'rf_123',
        payment_intent: 'pi_123456',
        amount: 1000,
        status: 'succeeded',
      };

      const mockUpdatedPayment = {
        ...mockPaymentRecord,
        status: 'refunded',
        refundId: 'rf_123',
      };

      // Setup the mock returns
      (prisma.payment.findUnique as any).mockResolvedValue(mockPaymentRecord);
      mockStripeInstance.refunds.create.mockResolvedValue(mockRefund);
      (prisma.payment.update as any).mockResolvedValue(mockUpdatedPayment);

      // Call the function
      const result = await refundPayment('payment_123', { reason: 'requested_by_customer' });

      // Verify the result
      expect(result).toEqual(mockUpdatedPayment);

      // Verify Stripe was called correctly
      expect(mockStripeInstance.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123456',
        reason: 'requested_by_customer',
      });

      // Verify database record was updated
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment_123' },
        data: {
          status: 'refunded',
          refundId: 'rf_123',
        },
      });
    });

    it('should handle refund failures', async () => {
      // Setup mocks
      const mockPaymentRecord = {
        id: 'payment_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: 'pi_123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup the mock returns
      (prisma.payment.findUnique as any).mockResolvedValue(mockPaymentRecord);
      mockStripeInstance.refunds.create.mockRejectedValue(
        new Error('Too late to refund')
      );

      // Call the function and expect it to throw
      await expect(refundPayment('payment_123')).rejects.toThrow(/Failed to process refund/);

      // Verify database record was not updated
      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('should throw error when payment not found', async () => {
      // Setup mock to return null (payment not found)
      (prisma.payment.findUnique as any).mockResolvedValue(null);

      // Call the function and expect it to throw
      await expect(refundPayment('nonexistent_payment')).rejects.toThrow(/Payment not found/);

      // Verify Stripe was not called
      expect(mockStripeInstance.refunds.create).not.toHaveBeenCalled();
    });

    it('should throw error when payment already refunded', async () => {
      // Setup mock for an already refunded payment
      const mockPaymentRecord = {
        id: 'payment_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        status: 'refunded',
        stripePaymentIntentId: 'pi_123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup the mock returns
      (prisma.payment.findUnique as any).mockResolvedValue(mockPaymentRecord);

      // Call the function and expect it to throw
      await expect(refundPayment('payment_123')).rejects.toThrow(/Payment already refunded/);

      // Verify Stripe was not called
      expect(mockStripeInstance.refunds.create).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentDetails', () => {
    it('should retrieve payment details', async () => {
      // Setup mocks
      const mockPaymentRecord = {
        id: 'payment_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: 'pi_123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPaymentIntent = {
        id: 'pi_123456',
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        payment_method: 'pm_123',
        charges: {
          data: [
            {
              id: 'ch_123',
              payment_method_details: {
                card: {
                  brand: 'visa',
                  last4: '4242',
                },
              },
              receipt_url: 'https://stripe.com/receipt',
            },
          ],
        },
      };

      // Setup the mock returns
      (prisma.payment.findUnique as any).mockResolvedValue(mockPaymentRecord);
      mockStripeInstance.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      // Call the function
      const result = await getPaymentDetails('payment_123');

      // Verify the result
      expect(result).toEqual({
        payment: mockPaymentRecord,
        stripeDetails: {
          paymentIntent: mockPaymentIntent,
          card: {
            brand: 'visa',
            last4: '4242',
          },
          receiptUrl: 'https://stripe.com/receipt',
        },
      });

      // Verify Stripe was called correctly
      expect(mockStripeInstance.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123456', {
        expand: ['charges.data.payment_method_details'],
      });
    });

    it('should throw error when payment not found', async () => {
      // Setup mock to return null (payment not found)
      (prisma.payment.findUnique as any).mockResolvedValue(null);

      // Call the function and expect it to throw
      await expect(getPaymentDetails('nonexistent_payment')).rejects.toThrow(/Payment not found/);

      // Verify Stripe was not called
      expect(mockStripeInstance.paymentIntents.retrieve).not.toHaveBeenCalled();
    });
  });
}); 