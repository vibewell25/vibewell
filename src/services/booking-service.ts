import { supabase } from '@/lib/supabase/client';

export class BookingService {
  async getBookings(userId: string, role: 'customer' | 'provider') {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        provider:profiles(*),
        customer:profiles(*)
      `)
      .eq(role === 'customer' ? 'customer_id' : 'provider_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getBookingById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        provider:profiles(*),
        customer:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createBooking(booking: {
    service_id: string;
    provider_id: string;
    customer_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBookingStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelBooking(id: string, cancelledBy: 'customer' | 'provider') {
    const status = `cancelled_by_${cancelledBy}`;
    return this.updateBookingStatus(id, status);
  }

  async checkAvailability(providerId: string, startTime: string, endTime: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
      .not('status', 'eq', 'cancelled');

    if (error) throw error;
    return data.length === 0;
  }

  async getProviderSchedule(providerId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString())
      .order('start_time');

    if (error) throw error;
    return data;
  }
} 