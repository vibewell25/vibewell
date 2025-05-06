/* eslint-disable */import { NextRequest } from 'next/server';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Mock Stripe and Prisma
jest.mock('@/lib/prisma');
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test123456',
        client_secret: 'cs_test_secret123456',
        amount: 10000,
        currency: 'usd',
        status: 'requires_payment_method'
      })

  }));
});

// Mock authentication
jest.mock('next-auth/react', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: 'user-123', email: 'test@example.com' }
  })
}));

describe('Payment Intent API', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
  }));

  it('should create a valid payment intent', async () => {
    // Arrange
    const req = new NextRequest('https://vibewell.com/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        currency: 'usd',
        bookingId: 'booking-123',
        paymentMethodType: 'card'
      })
    }));

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.clientSecret).toBe('cs_test_secret123456');
    expect(data.paymentIntentId).toBe('pi_test123456');
  }));

  it('should validate payment amount', async () => {
    // Arrange
    const req = new NextRequest('https://vibewell.com/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: -50, // Invalid negative amount
        currency: 'usd',
        bookingId: 'booking-123',
        paymentMethodType: 'card'
      })
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('should handle Stripe errors gracefully', async () => {
    // Arrange - Mock Stripe to throw an error
    const mockStripe = new Stripe('test_key', { apiVersion: '2022-11-15' });
    mockStripe.paymentIntents.create = jest.fn().mockRejectedValue(
      new Error('Stripe API Error')

    (Stripe as jest.Mock).mockImplementationOnce(() => mockStripe);

    const req = new NextRequest('https://vibewell.com/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        currency: 'usd',
        bookingId: 'booking-123',
        paymentMethodType: 'card'
      })
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });

  it('should require authentication', async () => {
    // Mock user as not authenticated
    const { getServerSession } = require('next-auth/react');
    getServerSession.mockResolvedValueOnce(null);

    const req = new NextRequest('https://vibewell.com/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        currency: 'usd',
        bookingId: 'booking-123',
        paymentMethodType: 'card'
      })
    });

    // Act
    const response = await POST(req);
    
    // Assert
    expect(response.status).toBe(401);
  });

  it('should create metadata for the payment intent', async () => {
    // Arrange
    const mockStripe = new Stripe('test_key', { apiVersion: '2022-11-15' });
    mockStripe.paymentIntents.create = jest.fn().mockResolvedValue({
      id: 'pi_test123456',
      client_secret: 'cs_test_secret123456'
    });
    (Stripe as jest.Mock).mockImplementationOnce(() => mockStripe);

    const req = new NextRequest('https://vibewell.com/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        currency: 'usd',
        bookingId: 'booking-123',
        paymentMethodType: 'card',
        metadata: { serviceType: 'massage' }
      })
    });

    // Act
    await POST(req);

    // Assert
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          bookingId: 'booking-123',
          userId: 'user-123',
          serviceType: 'massage'
        })
      })

  })); 