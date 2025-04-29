import { faker } from '@faker-js/faker';
import { prisma } from '@/lib/prisma';
import type { Payment, Booking, PaymentStatus } from '@prisma/client';

export async function createMockBooking(overrides: Partial<Booking> = {}): Promise<Booking> {
  const defaultData = {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    businessId: faker.string.uuid(),
    serviceId: faker.string.uuid(),
    status: 'PENDING',
    startTime: faker.date.future(),
    endTime: faker.date.future(),
    notes: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return await prisma.booking.create({
    data: {
      ...defaultData,
      ...overrides,
    },
  });
}

export async function createMockPayment(overrides: Partial<Payment> = {}): Promise<Payment> {
  const defaultData = {
    id: faker.string.uuid(),
    amount: faker.number.int({ min: 1000, max: 10000 }),
    currency: 'usd',
    status: 'PENDING' as PaymentStatus,
    bookingId: faker.string.uuid(),
    businessId: faker.string.uuid(),
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    retryCount: 0,
    errorMessage: null,
    refundedAt: null,
    refundAmount: null,
  };

  return await prisma.payment.create({
    data: {
      ...defaultData,
      ...overrides,
    },
  });
}

export async function createMockRefund(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
      refundAmount: payment.amount,
      metadata: {
        ...payment.metadata,
        refundReason: 'customer_requested',
      },
    },
  });
} 