import { PrismaClient, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { NotificationService } from './notification-service';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface CreatePaymentIntentDTO {
  bookingId: string;
  amount: number;
  currency: string;
}

interface ProcessRefundDTO {
  paymentId: string;
  amount: number;
}

interface ProcessDepositDTO {
  bookingId: string;
  amount: number;
  currency: string;
  isRefundable: boolean;
  validUntil?: Date;
}

interface PaymentIntent {
  bookingId: string;
  amount: number;
  currency: string;
  customerId?: string;
}

interface RefundParams {
  paymentId: string;
  amount: number;
  reason?: string;
}

export class PaymentService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(params: PaymentIntent) {
    try {
      const booking = await prisma.serviceBooking.findUnique({
        where: { id: params.bookingId },
        include: {
          services: true,
          user: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Calculate total amount from all services
      const totalAmount = booking.services.reduce((sum, service) => sum + service.price, 0);

      // Create or retrieve Stripe customer
      let customerId = params.customerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: booking.user.email || undefined,
          metadata: {
            userId: booking.userId,
          },
        });
        customerId = customer.id;

        // Save customer ID for future use
        await prisma.user.update({
          where: { id: booking.userId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        customer: customerId,
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          id: paymentIntent.id,
          amount: totalAmount,
          currency: params.currency,
          status: PaymentStatus.PENDING,
          bookingId: booking.id,
          userId: booking.userId,
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Process payment
   */
  async processPayment(paymentIntentId: string) {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Get payment record
      const payment = await prisma.payment.findFirst({
        where: { stripeId: paymentIntentId },
        include: {
          booking: {
            include: {
              user: true,
              service: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:
            paymentIntent.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          updatedAt: new Date(),
        },
        include: {
          booking: {
            include: {
              user: true,
              service: true,
            },
          },
        },
      });

      // Send notifications
      if (paymentIntent.status === 'succeeded') {
        await this.notificationService.notifyUser(payment.booking.userId, {
          type: 'PAYMENT',
          title: 'Payment Successful',
          message: `Payment for ${payment.booking.service.name} has been processed successfully`,
        });
      } else {
        await this.notificationService.notifyUser(payment.booking.userId, {
          type: 'PAYMENT',
          title: 'Payment Failed',
          message: `Payment for ${payment.booking.service.name} has failed. Please try again.`,
        });
      }

      return updatedPayment;
    } catch (error) {
      logger.error('Error processing payment', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(params: RefundParams) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: params.paymentId },
        include: {
          booking: {
            include: {
              services: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Payment cannot be refunded - invalid status');
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(params.amount * 100), // Convert to cents
        reason: (params.reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
      });

      // Update payment record
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          refundId: refund.id,
          refundAmount: params.amount,
          refundReason: params.reason,
        },
      });

      // Update booking status
      await prisma.serviceBooking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CANCELLED',
        },
      });

      return refund;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string) {
    try {
      return await prisma.payment.findMany({
        where: {
          booking: {
            userId,
          },
        },
        include: {
          booking: {
            include: {
              service: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error getting payment history', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(userId: string, startDate: Date, endDate: Date) {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            userId,
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
      const failedPayments = payments.filter((p) => p.status === PaymentStatus.FAILED).length;

      return {
        totalSpent,
        completedPayments,
        failedPayments,
        totalPayments: payments.length,
        averagePayment: payments.length > 0 ? totalSpent / payments.length : 0,
      };
    } catch (error) {
      logger.error('Error getting payment statistics', error);
      throw error;
    }
  }

  /**
   * Process deposit payment
   */
  async processDeposit(data: ProcessDepositDTO) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          user: true,
          service: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Create Stripe payment intent for deposit
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        customer: booking.user.stripeCustomerId,
        metadata: {
          bookingId: booking.id,
          serviceId: booking.serviceId,
          userId: booking.userId,
          isDeposit: 'true',
          isRefundable: data.isRefundable.toString(),
        },
        capture_method: 'manual', // This allows us to authorize now and capture later
      });

      // Create deposit record
      const deposit = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: data.amount,
          currency: data.currency,
          status: PaymentStatus.PENDING,
          stripeId: paymentIntent.id,
          isDeposit: true,
          isRefundable: data.isRefundable,
          validUntil: data.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
          businessId: booking.businessId,
        },
      });

      // Send notification
      await this.notificationService.notifyUser(booking.userId, {
        type: 'PAYMENT',
        title: 'Deposit Required',
        message: `Please complete the deposit payment of ${data.amount} ${data.currency} to secure your booking for ${booking.service.name}`,
      });

      return {
        depositId: deposit.id,
        clientSecret: paymentIntent.client_secret,
        validUntil: deposit.validUntil,
      };
    } catch (error) {
      logger.error('Error processing deposit', error);
      throw error;
    }
  }

  /**
   * Apply deposit to final payment
   */
  async applyDepositToPayment(depositId: string, finalPaymentId: string) {
    try {
      const deposit = await prisma.payment.findUnique({
        where: { id: depositId },
        include: {
          booking: true,
        },
      });

      if (!deposit || !deposit.isDeposit) {
        throw new Error('Deposit not found');
      }

      const finalPayment = await prisma.payment.findUnique({
        where: { id: finalPaymentId },
      });

      if (!finalPayment) {
        throw new Error('Final payment not found');
      }

      // Update final payment amount
      await prisma.payment.update({
        where: { id: finalPaymentId },
        data: {
          amount: finalPayment.amount - deposit.amount,
          updatedAt: new Date(),
        },
      });

      // Mark deposit as applied
      await prisma.payment.update({
        where: { id: depositId },
        data: {
          status: PaymentStatus.COMPLETED,
          updatedAt: new Date(),
        },
      });

      // Send notification
      await this.notificationService.notifyUser(deposit.booking.userId, {
        type: 'PAYMENT',
        title: 'Deposit Applied',
        message: `Your deposit of ${deposit.amount} ${deposit.currency} has been applied to your final payment`,
      });

      return {
        depositAmount: deposit.amount,
        remainingAmount: finalPayment.amount - deposit.amount,
      };
    } catch (error) {
      logger.error('Error applying deposit to payment', error);
      throw error;
    }
  }

  /**
   * Refund deposit
   */
  async refundDeposit(depositId: string, reason?: string) {
    try {
      const deposit = await prisma.payment.findUnique({
        where: { id: depositId },
        include: {
          booking: {
            include: {
              user: true,
              service: true,
            },
          },
        },
      });

      if (!deposit || !deposit.isDeposit) {
        throw new Error('Deposit not found');
      }

      if (!deposit.isRefundable) {
        throw new Error('Deposit is not refundable');
      }

      if (!deposit.stripeId) {
        throw new Error('No Stripe payment ID found');
      }

      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: deposit.stripeId,
        amount: Math.round(deposit.amount * 100), // Convert to cents
      });

      // Update deposit status
      const updatedDeposit = await prisma.payment.update({
        where: { id: depositId },
        data: {
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date(),
        },
      });

      // Send notification
      await this.notificationService.notifyUser(deposit.booking.userId, {
        type: 'PAYMENT',
        title: 'Deposit Refunded',
        message: `Your deposit of ${deposit.amount} ${deposit.currency} for ${deposit.booking.service.name} has been refunded. ${reason ? `Reason: ${reason}` : ''}`,
      });

      return {
        deposit: updatedDeposit,
        refund,
      };
    } catch (error) {
      logger.error('Error refunding deposit', error);
      throw error;
    }
  }

  async getPaymentAnalytics(startDate: Date, endDate: Date) {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          booking: {
            include: {
              services: true,
            },
          },
        },
      });

      const totalRevenue = payments.reduce((sum, payment) => {
        if (payment.status === PaymentStatus.COMPLETED) {
          return sum + payment.amount;
        }
        return sum;
      }, 0);

      const refundedAmount = payments.reduce((sum, payment) => {
        if (payment.status === PaymentStatus.REFUNDED) {
          return sum + (payment.refundAmount || 0);
        }
        return sum;
      }, 0);

      const successfulPayments = payments.filter(
        (p) => p.status === PaymentStatus.COMPLETED,
      ).length;

      const failedPayments = payments.filter((p) => p.status === PaymentStatus.FAILED).length;

      const refundedPayments = payments.filter((p) => p.status === PaymentStatus.REFUNDED).length;

      const revenueByService = await prisma.bookingService.groupBy({
        by: ['serviceId'],
        where: {
          booking: {
            payment: {
              status: PaymentStatus.COMPLETED,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
        _sum: {
          price: true,
        },
      });

      return {
        totalRevenue,
        refundedAmount,
        netRevenue: totalRevenue - refundedAmount,
        successfulPayments,
        failedPayments,
        refundedPayments,
        successRate: (successfulPayments / payments.length) * 100,
        revenueByService,
        currencyBreakdown: this.groupByCurrency(payments),
      };
    } catch (error) {
      logger.error('Error getting payment analytics:', error);
      throw error;
    }
  }

  private groupByCurrency(payments: any[]) {
    return payments.reduce((acc, payment) => {
      const currency = payment.currency.toUpperCase();
      if (!acc[currency]) {
        acc[currency] = {
          total: 0,
          count: 0,
          refunded: 0,
        };
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        acc[currency].total += payment.amount;
        acc[currency].count += 1;
      } else if (payment.status === PaymentStatus.REFUNDED) {
        acc[currency].refunded += payment.refundAmount || 0;
      }

      return acc;
    }, {});
  }
}

export {};
