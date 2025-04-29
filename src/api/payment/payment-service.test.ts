/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentStatus, PrismaClient } from '@prisma/client';
import type { Payment } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
import Stripe from 'stripe';

// Mock Prisma
const mockPayment = {
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
};

const mockStripePaymentIntent = {
  create: vi.fn(),
  retrieve: vi.fn(),
};

const mockStripeRefund = {
  create: vi.fn(),
};

const prisma = new PrismaClient();
const stripe = new Stripe('test_key', { apiVersion: '2025-03-31.basil' });

class PaymentService {
  constructor(private prisma: PrismaClient, private stripe: Stripe) {}

  async getPaymentDetails(id: string): Promise<Payment | null> {
    if (!id) throw new Error('Payment ID is required');
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async processPayment(data: { 
    amount: number; 
    currency: string; 
    bookingId: string; 
    businessId: string;
    idempotencyKey?: string;
  }): Promise<Payment> {
    // Validate input
    if (data.amount <= 0) throw new Error('Amount must be greater than 0');
    if (!data.currency) throw new Error('Currency is required');
    if (!data.bookingId) throw new Error('Booking ID is required');
    if (!data.businessId) throw new Error('Business ID is required');

    try {
      // Create Stripe payment intent first
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        metadata: {
          bookingId: data.bookingId,
          businessId: data.businessId
        }
      }, data.idempotencyKey ? {
        idempotencyKey: data.idempotencyKey
      } : undefined);

      // Create payment record
      return this.prisma.payment.create({
        data: {
          ...data,
          status: PaymentStatus.PENDING,
          metadata: { stripePaymentIntentId: paymentIntent.id },
          retryCount: 0,
          errorMessage: null,
          refundedAt: null,
          refundAmount: null
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to process payment: ${errorMessage}`);
    }
  }

  async refundPayment(id: string, amount: number): Promise<Payment> {
    if (!id) throw new Error('Payment ID is required');
    if (amount <= 0) throw new Error('Refund amount must be greater than 0');

    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new Error('Payment not found');
    if (payment.status === PaymentStatus.REFUNDED) throw new Error('Payment already refunded');
    if (amount > payment.amount) throw new Error('Refund amount cannot exceed original payment amount');

    try {
      // Process refund in Stripe first
      const stripePaymentIntentId = (payment.metadata as any)?.stripePaymentIntentId;
      if (!stripePaymentIntentId) throw new Error('Invalid payment record: missing Stripe payment intent ID');

      await this.stripe.refunds.create({
        payment_intent: stripePaymentIntentId,
        amount
      });

      // Update payment record
      return this.prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          refundAmount: amount
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to process refund: ${errorMessage}`);
    }
  }
}

const paymentService = new PaymentService(prisma, stripe);

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    payment: mockPayment,
    $transaction: vi.fn((callback) => callback()),
  })),
  PaymentStatus: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
  }
}));

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentIntents: mockStripePaymentIntent,
    refunds: mockStripeRefund,
  })),
}));

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Payment Processing', () => {
    const mockPaymentData: Payment = {
      id: 'payment_123',
      amount: 1000,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      bookingId: 'booking_123',
      businessId: 'business_123',
      metadata: { stripePaymentIntentId: 'pi_123' } as JsonValue,
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      errorMessage: null,
      refundedAt: null,
      refundAmount: null
    };

    const mockStripePaymentIntentData = {
      id: 'pi_123',
      amount: 1000,
      currency: 'usd',
      status: 'requires_payment_method'
    };

    describe('getPaymentDetails', () => {
      it('should throw error for missing payment ID', async () => {
        await expect(paymentService.getPaymentDetails('')).rejects.toThrow('Payment ID is required');
      });

      it('should handle payment not found', async () => {
        mockPayment.findUnique.mockResolvedValue(null);
        const result = await paymentService.getPaymentDetails('nonexistent_payment');
        expect(result).toBeNull();
      });

      it('should return payment details', async () => {
        mockPayment.findUnique.mockResolvedValue(mockPaymentData);
        const result = await paymentService.getPaymentDetails('payment_123');
        expect(result).toEqual(mockPaymentData);
      });
    });

    describe('processPayment', () => {
      const validPaymentData = {
        amount: 1000,
        currency: 'usd',
        bookingId: 'booking_123',
        businessId: 'business_123'
      };

      it('should validate payment amount', async () => {
        await expect(
          paymentService.processPayment({ ...validPaymentData, amount: 0 })
        ).rejects.toThrow('Amount must be greater than 0');
      });

      it('should validate required fields', async () => {
        await expect(
          paymentService.processPayment({ ...validPaymentData, currency: '' })
        ).rejects.toThrow('Currency is required');
      });

      it('should create payment with idempotency key', async () => {
        mockStripePaymentIntent.create.mockResolvedValue(mockStripePaymentIntentData);
        mockPayment.create.mockResolvedValue(mockPaymentData);

        await paymentService.processPayment({
          ...validPaymentData,
          idempotencyKey: 'unique_key_123'
        });

        expect(mockStripePaymentIntent.create).toHaveBeenCalledWith(
          expect.any(Object),
          { idempotencyKey: 'unique_key_123' }
        );
      });

      it('should handle Stripe errors', async () => {
        mockStripePaymentIntent.create.mockRejectedValue(new Error('Stripe API error'));

        await expect(
          paymentService.processPayment(validPaymentData)
        ).rejects.toThrow('Failed to process payment: Stripe API error');
      });

      it('should create payment record with Stripe payment intent ID', async () => {
        mockStripePaymentIntent.create.mockResolvedValue(mockStripePaymentIntentData);
        mockPayment.create.mockResolvedValue(mockPaymentData);

        const result = await paymentService.processPayment(validPaymentData);

        expect(mockPayment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            metadata: { stripePaymentIntentId: 'pi_123' }
          })
        });
        expect(result).toEqual(mockPaymentData);
      });
    });

    describe('refundPayment', () => {
      it('should validate refund amount', async () => {
        await expect(
          paymentService.refundPayment('payment_123', 0)
        ).rejects.toThrow('Refund amount must be greater than 0');
      });

      it('should validate payment exists', async () => {
        mockPayment.findUnique.mockResolvedValue(null);
        await expect(
          paymentService.refundPayment('nonexistent_payment', 1000)
        ).rejects.toThrow('Payment not found');
      });

      it('should prevent refunding already refunded payment', async () => {
        mockPayment.findUnique.mockResolvedValue({
          ...mockPaymentData,
          status: PaymentStatus.REFUNDED
        });

        await expect(
          paymentService.refundPayment('payment_123', 1000)
        ).rejects.toThrow('Payment already refunded');
      });

      it('should prevent refunding more than original amount', async () => {
        mockPayment.findUnique.mockResolvedValue(mockPaymentData);

        await expect(
          paymentService.refundPayment('payment_123', 2000)
        ).rejects.toThrow('Refund amount cannot exceed original payment amount');
      });

      it('should handle missing Stripe payment intent ID', async () => {
        mockPayment.findUnique.mockResolvedValue({
          ...mockPaymentData,
          metadata: {} as JsonValue
        });

        await expect(
          paymentService.refundPayment('payment_123', 1000)
        ).rejects.toThrow('Invalid payment record: missing Stripe payment intent ID');
      });

      it('should handle Stripe refund errors', async () => {
        mockPayment.findUnique.mockResolvedValue(mockPaymentData);
        mockStripeRefund.create.mockRejectedValue(new Error('Stripe refund error'));

        await expect(
          paymentService.refundPayment('payment_123', 1000)
        ).rejects.toThrow('Failed to process refund: Stripe refund error');
      });

      it('should process refund successfully', async () => {
        const refundedPayment = {
          ...mockPaymentData,
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          refundAmount: 1000
        };

        mockPayment.findUnique.mockResolvedValue(mockPaymentData);
        mockStripeRefund.create.mockResolvedValue({ id: 're_123' });
        mockPayment.update.mockResolvedValue(refundedPayment);

        const result = await paymentService.refundPayment('payment_123', 1000);

        expect(mockStripeRefund.create).toHaveBeenCalledWith({
          payment_intent: 'pi_123',
          amount: 1000
        });
        expect(result).toEqual(refundedPayment);
      });
    });
  });
});
