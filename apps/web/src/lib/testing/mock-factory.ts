
import { faker } from '@faker-js/faker';

import { prisma } from '@/lib/prisma';

import { PaymentStatus, BookingStatus } from '@prisma/client';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createMockBooking(overrides: Partial<any> = {}) {
  const defaultData = {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    businessId: faker.string.uuid(),
    status: BookingStatus.PENDING,
    startTime: faker.date.future(),
    endTime: faker.date.future(),
    notes: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return prisma.booking.create({
    data: defaultData,
  });
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createMockPayment(overrides: Partial<any> = {}) {
  const defaultData = {
    id: faker.string.uuid(),
    amount: faker.number.int({ min: 1000, max: 10000 }),
    currency: 'USD',
    status: PaymentStatus.COMPLETED,
    stripeId: `pi_${faker.string.alphanumeric(24)}`,
    businessId: faker.string.uuid(),
    userId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    idempotencyKey: faker.string.uuid(),
    ...overrides,
  };

  return prisma.payment.create({
    data: defaultData,
  });
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createMockBusiness(overrides: Partial<any> = {}) {
  const defaultData = {
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    zipCode: faker.location.zipCode(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return prisma.business.create({
    data: defaultData,
  });
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createMockUser(overrides: Partial<any> = {}) {
  const defaultData = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return prisma.user.create({
    data: defaultData,
  });
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createMockService(overrides: Partial<any> = {}) {
  const defaultData = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 1000, max: 10000 }),
    duration: faker.number.int({ min: 30, max: 120 }),
    businessId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return prisma.service.create({
    data: defaultData,
  });
} 