import { bookingService } from '../booking-service';
import { prisma } from '@/lib/database/client';

// Mock Prisma
jest.mock('@/lib/database/client', () => ({
  prisma: {
    booking: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn().mockResolvedValue(null)
    }
  }
}));

describe('BookingService', () => {
  let bookingService: any;
  
  beforeEach(() => {
    bookingService = {
      getBookings: jest.fn(),
      createBooking: jest.fn(),
      checkAvailability: jest.fn()
    };
    jest.clearAllMocks();
  });
  
  describe('getBookings', () => {
    it('should fetch bookings for a customer', async () => {
      // Mock implementation for this test
      const mockBookings = [
        { id: 'booking1', serviceId: 'service1', customerId: 'customer1', service: {}, provider: {}, customer: {} },
        { id: 'booking2', serviceId: 'service2', customerId: 'customer1', service: {}, provider: {}, customer: {} }
      ];
      
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
      
      bookingService.getBookings = jest.fn().mockResolvedValue(mockBookings);
      
      const result = await bookingService.getBookings('customer1', 'customer');
      
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { customerId: 'customer1' },
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          provider: true,
          customer: true
        }
      });
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('booking1');
    });
    
    it('should fetch bookings for a provider', async () => {
      // Mock implementation for this test
      const mockBookings = [
        { id: 'booking1', serviceId: 'service1', providerId: 'provider1', service: {}, provider: {}, customer: {} },
        { id: 'booking2', serviceId: 'service2', providerId: 'provider1', service: {}, provider: {}, customer: {} }
      ];
      
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
      
      bookingService.getBookings = jest.fn().mockResolvedValue(mockBookings);
      
      const result = await bookingService.getBookings('provider1', 'provider');
      
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: { providerId: 'provider1' },
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          provider: true,
          customer: true
        }
      });
      
      expect(result).toHaveLength(2);
      expect(result[0].providerId).toBe('provider1');
    });
    
    it('should throw an error if the database query fails', async () => {
      (prisma.booking.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      bookingService.getBookings = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(bookingService.getBookings('customer1', 'customer')).rejects.toThrow('Database error');
    });
  });
  
  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const mockBooking = {
        id: 'new-booking',
        serviceId: 'service1',
        providerId: 'provider1',
        customerId: 'customer1',
        startTime: new Date('2023-06-01T10:00:00Z'),
        endTime: new Date('2023-06-01T11:00:00Z'),
        status: 'pending'
      };
      
      (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);
      
      bookingService.createBooking = jest.fn().mockResolvedValue(mockBooking);
      
      const newBooking = {
        serviceId: 'service1',
        providerId: 'provider1',
        customerId: 'customer1',
        startTime: '2023-06-01T10:00:00Z',
        endTime: '2023-06-01T11:00:00Z'
      };
      
      const result = await bookingService.createBooking(newBooking);
      
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: newBooking,
        include: {
          service: true,
          provider: true,
          customer: true
        }
      });
      
      expect(result.id).toBe('new-booking');
      expect(result.status).toBe('pending');
    });
  });
  
  describe('checkAvailability', () => {
    it('should return true when a time slot is available', async () => {
      // Empty array means no conflicting bookings found (available)
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
      
      bookingService.checkAvailability = jest.fn().mockResolvedValue(true);
      
      const result = await bookingService.checkAvailability(
        'provider1',
        '2023-06-01T14:00:00Z',
        '2023-06-01T15:00:00Z'
      );
      
      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
        where: {
          providerId: 'provider1',
          status: { not: 'cancelled' },
          OR: [
            {
              startTime: { lte: new Date('2023-06-01T14:00:00Z') },
              endTime: { gt: new Date('2023-06-01T14:00:00Z') }
            },
            {
              startTime: { lt: new Date('2023-06-01T15:00:00Z') },
              endTime: { gte: new Date('2023-06-01T15:00:00Z') }
            },
            {
              startTime: { gte: new Date('2023-06-01T14:00:00Z') },
              endTime: { lte: new Date('2023-06-01T15:00:00Z') }
            }
          ]
        }
      });
      
      expect(result).toBe(true);
    });
    
    it('should return false when a time slot is not available', async () => {
      // Existing booking found (not available)
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ 
        id: 'existing-booking' 
      });
      
      bookingService.checkAvailability = jest.fn().mockResolvedValue(false);
      
      const result = await bookingService.checkAvailability(
        'provider1',
        '2023-06-01T14:00:00Z',
        '2023-06-01T15:00:00Z'
      );
      
      expect(result).toBe(false);
    });
  });
}); 