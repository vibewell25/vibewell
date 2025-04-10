import { BookingService } from '../booking-service';
import { supabase } from '@/lib/supabase/client';

// Mock supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            or: jest.fn(() => ({
              not: jest.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            })),
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
            or: jest.fn(() => ({
              not: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        })),
        single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        }))
      }))
    })
  }
}));

describe('BookingService', () => {
  let bookingService: BookingService;
  
  beforeEach(() => {
    bookingService = new BookingService();
    jest.clearAllMocks();
  });
  
  describe('getBookings', () => {
    it('should fetch bookings for a customer', async () => {
      // Mock implementation for this test
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              { id: 'booking1', service_id: 'service1', customer_id: 'customer1' },
              { id: 'booking2', service_id: 'service2', customer_id: 'customer1' }
            ],
            error: null
          }))
        }))
      }));
      
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      
      const result = await bookingService.getBookings('customer1', 'customer');
      
      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        service:services(*),
        provider:profiles(*),
        customer:profiles(*)
      `);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('booking1');
    });
    
    it('should fetch bookings for a provider', async () => {
      // Mock implementation for this test
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              { id: 'booking1', service_id: 'service1', provider_id: 'provider1' },
              { id: 'booking2', service_id: 'service2', provider_id: 'provider1' }
            ],
            error: null
          }))
        }))
      }));
      
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      
      const result = await bookingService.getBookings('provider1', 'provider');
      
      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(result).toHaveLength(2);
      expect(result[0].provider_id).toBe('provider1');
    });
    
    it('should throw an error if the database query fails', async () => {
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          }))
        }))
      }));
      
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      
      await expect(bookingService.getBookings('customer1', 'customer'))
        .rejects.toThrow('Database error');
    });
  });
  
  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'new-booking',
              service_id: 'service1',
              provider_id: 'provider1',
              customer_id: 'customer1',
              start_time: '2023-06-01T10:00:00Z',
              end_time: '2023-06-01T11:00:00Z',
              status: 'pending'
            },
            error: null
          }))
        }))
      }));
      
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
      
      const newBooking = {
        service_id: 'service1',
        provider_id: 'provider1',
        customer_id: 'customer1',
        start_time: '2023-06-01T10:00:00Z',
        end_time: '2023-06-01T11:00:00Z'
      };
      
      const result = await bookingService.createBooking(newBooking);
      
      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(mockInsert).toHaveBeenCalledWith([newBooking]);
      expect(result.id).toBe('new-booking');
      expect(result.status).toBe('pending');
    });
  });
  
  describe('checkAvailability', () => {
    it('should return true when a time slot is available', async () => {
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          or: jest.fn(() => ({
            not: jest.fn(() => Promise.resolve({
              data: [], // Empty array means no bookings found (available)
              error: null
            }))
          }))
        }))
      }));
      
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      
      const result = await bookingService.checkAvailability(
        'provider1',
        '2023-06-01T14:00:00Z',
        '2023-06-01T15:00:00Z'
      );
      
      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(result).toBe(true);
    });
    
    it('should return false when a time slot is not available', async () => {
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          or: jest.fn(() => ({
            not: jest.fn(() => Promise.resolve({
              data: [{ id: 'existing-booking' }], // Non-empty array means bookings found (not available)
              error: null
            }))
          }))
        }))
      }));
      
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      
      const result = await bookingService.checkAvailability(
        'provider1',
        '2023-06-01T14:00:00Z',
        '2023-06-01T15:00:00Z'
      );
      
      expect(result).toBe(false);
    });
  });
}); 