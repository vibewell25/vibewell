
import { PrismaClient, PaymentStatus } from '@prisma/client';

import type { Payment } from '@prisma/client';


import type { JsonValue, InputJsonValue } from '@prisma/client/runtime/library';
import { Redis } from 'ioredis';
import { Stripe } from 'stripe';

import { logger } from '@/lib/logger';

interface PaymentMetadata {
  stripePaymentIntentId?: string;
  lastRetryAt?: string;
  [key: string]: unknown;
}

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

export class PaymentRetryService {
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 5000; // 5 seconds
  private readonly MAX_RETRY_DELAY = 60000; // 1 minute
  private readonly RATE_LIMIT_WINDOW = 3600; // 1 hour
  private readonly MAX_ATTEMPTS_PER_WINDOW = 5;

  constructor(
    private prisma: PrismaClient,
    private stripe: Stripe,
    private redis: Redis
  ) {}

  private async getRateLimitKey(userId: string): Promise<string> {
    return `payment_attempts:${userId}`;
  }

  private async checkRateLimit(userId: string): Promise<boolean> {
    const key = await this.getRateLimitKey(userId);
    const attempts = await this.redis.incr(key);
    
    if (attempts === 1) {
      // Set expiry for new keys
      await this.redis.expire(key, this.RATE_LIMIT_WINDOW);
    }
    
    return attempts <= this.MAX_ATTEMPTS_PER_WINDOW;
  }

  private async getRemainingAttempts(userId: string): Promise<number> {
    const key = await this.getRateLimitKey(userId);
    const attempts = await this.redis.get(key);
    return this.MAX_ATTEMPTS_PER_WINDOW - (parseInt(attempts || '0', 10));
  }

  private async getRetryDelay(retryCount: number): Promise<number> {
    // Exponential backoff with jitter
    const baseDelay = Math.min(

      this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
      this.MAX_RETRY_DELAY
    );
    const jitter = Math.random() * 1000; // Add up to 1 second of random jitter

    return baseDelay + jitter;
  }

  async retryPayment(paymentId: string, userId: string): Promise<Payment> {
    // Check rate limit
    const canRetry = await this.checkRateLimit(userId);
    if (!canRetry) {
      const remainingTime = await this.redis.ttl(await this.getRateLimitKey(userId));

      throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`);
    }

    // Get payment details
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.FAILED) {
      throw new Error(`Cannot retry payment with status: ${payment.status}`);
    }

    if (payment.retryCount >= this.MAX_RETRIES) {
      throw new Error('Maximum retry attempts exceeded');
    }

    try {
      // Calculate retry delay
      const retryDelay = await this.getRetryDelay(payment.retryCount);
      
      // Wait for the retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // Create new payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: payment.amount,
        currency: payment.currency,
        metadata: {
          bookingId: payment.bookingId,

          retryCount: payment.retryCount + 1
        }
      });

      const metadata: PaymentMetadata = {
        ...(payment.metadata as PaymentMetadata),
        stripePaymentIntentId: paymentIntent.id,
        lastRetryAt: new Date().toISOString()
      };

      // Update payment record
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PENDING,

          retryCount: payment.retryCount + 1,
          errorMessage: null,
          metadata: metadata as unknown as InputJsonValue
        }
      });

      const logContext: LogContext = {
        paymentId,
        retryCount: updatedPayment.retryCount,
        stripePaymentIntentId: paymentIntent.id
      };
      logger.info(`Payment retry initiated for payment ${paymentId}`, JSON.stringify(logContext));

      return updatedPayment;
    } catch (error) {
      const logContext: LogContext = {
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      logger.error(`Payment retry failed for payment ${paymentId}`, JSON.stringify(logContext));

      // Update payment record with failure
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',

          retryCount: payment.retryCount + 1
        }
      });

      throw error;
    }
  }

  async getRetryStatus(paymentId: string, userId: string): Promise<{
    canRetry: boolean;
    remainingAttempts: number;
    nextRetryDelay?: number | undefined;
    rateLimitReset?: number | undefined;
  }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const remainingAttempts = await this.getRemainingAttempts(userId);
    const rateLimitReset = await this.redis.ttl(await this.getRateLimitKey(userId));
    
    const canRetry = payment.status === PaymentStatus.FAILED &&
      payment.retryCount < this.MAX_RETRIES &&
      remainingAttempts > 0;

    const nextRetryDelay = canRetry ? await this.getRetryDelay(payment.retryCount) : undefined;
    const resetTime = rateLimitReset > 0 ? rateLimitReset : undefined;

    return {
      canRetry,
      remainingAttempts,
      nextRetryDelay,
      rateLimitReset: resetTime
    };
  }
} 