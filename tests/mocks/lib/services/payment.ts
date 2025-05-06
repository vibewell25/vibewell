/**
 * Mock Payment Service for testing
 */
export class PaymentService {
  /**
   * Process a payment
   */
  async processPayment({ amount, currency, bookingId, businessId, idempotencyKey }: any) {
    // Check idempotency key to avoid duplicate payments
    if (idempotencyKey === 'test-key') {
      return {
        id: 'test-payment-id',
        amount,
        currency,
        status: 'COMPLETED',
        bookingId,
        businessId
      };
    }

    // Simulate payment creation
    const payment = {
      id: 'new-payment-id',
      amount,
      currency,
      status: 'PENDING',
      bookingId,
      businessId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Simulate payment completion
    return {
      ...payment,
      status: 'COMPLETED',
      updatedAt: new Date()
    };
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string) {
    if (paymentId === 'test-payment-id') {
      return {
        id: 'test-payment-id',
        amount: 100,
        currency: 'USD',
        status: 'REFUNDED',
        bookingId: 'test-booking-id',
        businessId: 'test-business-id',
        refundedAt: new Date()
      };
    }

    throw new Error('Payment not found');
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string) {
    if (paymentId === 'test-payment-id') {
      return {
        id: 'test-payment-id',
        amount: 100,
        currency: 'USD',
        status: 'COMPLETED',
        bookingId: 'test-booking-id',
        businessId: 'test-business-id'
      };
    }

    return null;
  }
} 