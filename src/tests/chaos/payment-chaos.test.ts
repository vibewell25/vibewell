import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PaymentService } from '@/lib/services/payment';
import { BookingService } from '@/lib/services/booking';
import { NetworkChaos } from '@/lib/testing/network-chaos';
import { CircuitBreaker } from '@/lib/utils/circuit-breaker';
import { createMockBooking, createMockPayment } from '@/lib/testing/mock-factory';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { faker } from '@faker-js/faker';

const PERFORMANCE_THRESHOLDS = {
  paymentProcessing: 5000, // 5 seconds
  refundProcessing: 3000,  // 3 seconds
  webhookProcessing: 1000, // 1 second
};

describe('Payment System Chaos Tests', () => {
  let paymentService: PaymentService;
  let bookingService: BookingService;
  let networkChaos: NetworkChaos;
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    paymentService = new PaymentService();
    bookingService = new BookingService();
    networkChaos = new NetworkChaos();
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 10000,
    });

    // Clear Redis cache
    redis.flushall();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('should handle concurrent payment attempts for same booking', async () => {
    const mockBooking = await createMockBooking();
    const CONCURRENT_REQUESTS = 5;

    const paymentPromises = Array(CONCURRENT_REQUESTS).fill(null).map(() => {
      return paymentService.processPayment({
        amount: faker.number.int({ min: 1000, max: 10000 }),
        currency: 'usd',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,
      });
    });

    const results = await Promise.allSettled(paymentPromises);
    const successfulPayments = results.filter((r) => r.status === 'fulfilled');
    
    // Only one payment should succeed
    expect(successfulPayments).toHaveLength(1);
  });

  it('should handle webhook race conditions', async () => {
    const mockPayment = await createMockPayment();
    const CONCURRENT_WEBHOOKS = 3;

    const webhookPromises = Array(CONCURRENT_WEBHOOKS).fill(null).map(() => {
      return paymentService.handleWebhook({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: mockPayment.stripeId,
            status: 'succeeded',
          },
        },
      });
    });

    const results = await Promise.allSettled(webhookPromises);
    const processedWebhooks = results.filter((r) => r.status === 'fulfilled');
    
    // Only one webhook should be processed (idempotency)
    expect(processedWebhooks).toHaveLength(1);
  });

  it('should maintain data consistency during partial system failures', async () => {
    const mockBooking = await createMockBooking();
    
    // Simulate database connection issues
    jest.spyOn(prisma, '$transaction').mockImplementationOnce(() => {
      throw new Error('Connection lost');
    });

    try {
      await paymentService.processPayment({
        amount: faker.number.int({ min: 1000, max: 10000 }),
        currency: 'usd',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,
      });
    } catch (error) {
      // Expected error
    }

    // Verify booking status wasn't changed
    const booking = await prisma.booking.findUnique({
      where: { id: mockBooking.id },
    });
    expect(booking?.status).toBe('PENDING');
  });

  it('should handle payment provider timeouts gracefully', async () => {
    const mockBooking = await createMockBooking();
    
    // Simulate slow Stripe responses
    networkChaos.setLatency(6000); // 6 second delay

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const result = await Promise.race([
      paymentService.processPayment({
        amount: faker.number.int({ min: 1000, max: 10000 }),
        currency: 'usd',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,
      }),
      timeoutPromise,
    ]).catch((error) => error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Timeout');
  });

  it('should handle Redis failures gracefully', async () => {
    const mockPayment = await createMockPayment();
    
    // Simulate Redis connection issues
    jest.spyOn(redis, 'set').mockRejectedValueOnce(new Error('Redis connection lost'));

    const result = await paymentService.handleWebhook({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: mockPayment.stripeId,
          status: 'succeeded',
        },
      },
    });

    // Should still process webhook even if Redis fails
    expect(result).toBeDefined();
  });

  it('should handle payment refunds during network instability', async () => {
    const mockPayment = await createMockPayment({ status: 'COMPLETED' });
    
    // Simulate unstable network
    networkChaos.setPacketLoss(0.3); // 30% packet loss
    networkChaos.setLatency(2000); // 2 second delay

    const result = await paymentService.refundPayment({
      paymentId: mockPayment.id,
      amount: mockPayment.amount,
      reason: 'Test refund',
    });

    expect(result.status).toBe('REFUNDED');
  });

  it('should prevent double refunds', async () => {
    const mockPayment = await createMockPayment({ status: 'REFUNDED' });
    
    await expect(
      paymentService.refundPayment({
        paymentId: mockPayment.id,
        amount: mockPayment.amount,
        reason: 'Test refund',
      })
    ).rejects.toThrow('Payment already refunded');
  });

  it('should handle concurrent refund attempts', async () => {
    const mockPayment = await createMockPayment({ status: 'COMPLETED' });
    const CONCURRENT_REFUNDS = 3;

    const refundPromises = Array(CONCURRENT_REFUNDS).fill(null).map(() => {
      return paymentService.refundPayment({
        paymentId: mockPayment.id,
        amount: mockPayment.amount,
        reason: 'Test refund',
      });
    });

    const results = await Promise.allSettled(refundPromises);
    const successfulRefunds = results.filter((r) => r.status === 'fulfilled');
    
    // Only one refund should succeed
    expect(successfulRefunds).toHaveLength(1);
  });
}); 