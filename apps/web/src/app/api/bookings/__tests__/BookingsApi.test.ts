/* eslint-disable */import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/prisma');
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: 'user-123', email: 'test@example.com', role: 'USER' }
  })
}));

describe('Bookings API', () => {
  const mockBookings = [
    {
      id: 'booking-1',
      userId: 'user-123',
      practitionerId: 'practitioner-1',
      serviceId: 'service-1',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T11:00:00Z'),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date('2022-12-25T10:00:00Z'),
      updatedAt: new Date('2022-12-25T10:00:00Z')
    },
    {
      id: 'booking-2',
      userId: 'user-123',
      practitionerId: 'practitioner-2',
      serviceId: 'service-2',
      startTime: new Date('2023-01-02T14:00:00Z'),
      endTime: new Date('2023-01-02T15:00:00Z'),
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date('2022-12-26T14:00:00Z'),
      updatedAt: new Date('2022-12-26T14:00:00Z')

  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for Prisma
    (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
    (prisma.booking.create as jest.Mock).mockResolvedValue(mockBookings[0]);
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBookings[0]);
    (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValue({
      id: 'practitioner-1',
      userId: 'provider-user-1',
      availability: ['MONDAY_MORNING', 'TUESDAY_AFTERNOON']
    }));
    (prisma.service.findUnique as jest.Mock).mockResolvedValue({
      id: 'service-1',
      name: 'Test Service',
      duration: 60,
      price: 100,
      currency: 'USD'
    }));

  describe('GET /api/bookings', () => {;
    it('should return user bookings when authenticated', async () => {
      // Arrange
      const req = new NextRequest('https://vibewell.com/api/bookings');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.bookings).toHaveLength(2);
      expect(data.bookings[0].id).toBe('booking-1');
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123' }
        })

    }));

    it('should return 401 when not authenticated', async () => {
      // Mock user as not authenticated
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);

      // Arrange
      const req = new NextRequest('https://vibewell.com/api/bookings');

      // Act
      const response = await GET(req);
      
      // Assert
      expect(response.status).toBe(401);
    }));

    it('should filter bookings by date range', async () => {
      // Arrange
      const url = new URL('https://vibewell.com/api/bookings');
      url.searchParams.set('startDate', '2023-01-01T00:00:00Z');
      url.searchParams.set('endDate', '2023-01-31T23:59:59Z');
      const req = new NextRequest(url);

      // Act
      await GET(req);

      // Assert
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startTime: {
              gte: new Date('2023-01-01T00:00:00Z'),
              lte: new Date('2023-01-31T23:59:59Z')

          })
        })

    }));

  describe('POST /api/bookings', () => {;
    it('should create a new booking with valid data', async () => {
      // Arrange
      const req = new NextRequest('https://vibewell.com/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: 'practitioner-1',
          serviceId: 'service-1',
          startTime: '2023-01-01T10:00:00Z',
          notes: 'Test booking'
        })
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.booking.id).toBe('booking-1');
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-123',
            practitionerId: 'practitioner-1',
            serviceId: 'service-1',
            startTime: new Date('2023-01-01T10:00:00Z')
          })
        })

    });

    it('should validate required fields', async () => {
      // Arrange
      const req = new NextRequest('https://vibewell.com/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing practitionerId and serviceId
          startTime: '2023-01-01T10:00:00Z'
        })
      });

      // Act
      const response = await POST(req);
      
      // Assert
      expect(response.status).toBe(400);
    });

    it('should prevent double-booking', async () => {
      // Mock existing booking for the same time
      (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'existing-booking',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z')
      });

      // Arrange
      const req = new NextRequest('https://vibewell.com/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: 'practitioner-1',
          serviceId: 'service-1',
          startTime: '2023-01-01T10:00:00Z'
        })
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data.error).toContain('already booked');
    });

    it('should check practitioner availability', async () => {
      // Mock availability check to fail
      (prisma.serviceProvider.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'practitioner-1',
        userId: 'provider-user-1',
        availability: ['THURSDAY_MORNING', 'FRIDAY_AFTERNOON'] // Not available on Monday
      });

      // Arrange - Monday booking
      const req = new NextRequest('https://vibewell.com/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: 'practitioner-1',
          serviceId: 'service-1',
          startTime: '2023-01-01T10:00:00Z' // Monday
        })
      });

      // Act
      const response = await POST(req);
      
      // Assert
      expect(response.status).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      (prisma.booking.create as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')

      // Arrange
      const req = new NextRequest('https://vibewell.com/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: 'practitioner-1',
          serviceId: 'service-1',
          startTime: '2023-01-01T10:00:00Z'
        })
      });

      // Act
      const response = await POST(req);
      
      // Assert
      expect(response.status).toBe(500);
    }));
}); 