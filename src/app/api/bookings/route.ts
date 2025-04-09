import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  const customerId = searchParams.get('customerId');
  const status = searchParams.get('status');
  
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {}, // Not needed for GET requests
        remove: () => {}, // Not needed for GET requests
      },
    }
  );
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Not authorized' },
      { status: 401 }
    );
  }
  
  let query = supabase.from('bookings').select('*, provider:providers(*), customer:profiles(*), service:services(*)');
  
  // Filter based on role and parameters
  if (session.user.app_metadata?.role === 'provider') {
    // Providers can only see their own bookings
    query = query.eq('provider_id', session.user.id);
  } else if (session.user.app_metadata?.role === 'customer') {
    // Customers can only see their own bookings
    query = query.eq('customer_id', session.user.id);
  } else if (session.user.app_metadata?.role !== 'admin') {
    // If not provider, customer or admin, deny access
    return NextResponse.json(
      { error: 'Not authorized' },
      { status: 401 }
    );
  }
  
  // Apply additional filters if provided
  if (providerId && session.user.app_metadata?.role === 'admin') {
    query = query.eq('provider_id', providerId);
  }
  
  if (customerId && session.user.app_metadata?.role === 'admin') {
    query = query.eq('customer_id', customerId);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ 
    success: true,
    count: data.length,
    data 
  });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {}, // We'll handle cookie setting in a proper response
        remove: () => {}, // Not needed for this context
      },
    }
  );
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Not authorized' },
      { status: 401 }
    );
  }
  
  // Only customers can create bookings
  if (session.user.app_metadata?.role !== 'customer' && session.user.app_metadata?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only customers can create bookings' },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    const {
      providerId,
      serviceId,
      serviceType,
      serviceName,
      date,
      startTime,
      endTime,
      duration,
      price,
      specialRequests,
      participants
    } = body;
    
    // Validation
    if (!providerId || !serviceId || !serviceType || !serviceName || !date || !startTime || !endTime || !duration || !price) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    // Check if provider exists
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('id', providerId)
      .single();
    
    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Check provider availability
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toISOString().split('T')[0];
    
    const { data: existingBookings, error: availabilityError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('provider_id', providerId)
      .eq('date', formattedDate)
      .not('status', 'in', ['cancelled_by_customer', 'cancelled_by_provider', 'no_show']);
    
    if (availabilityError) {
      return NextResponse.json(
        { error: 'Error checking availability' },
        { status: 500 }
      );
    }
    
    // Check for time conflict
    const hasConflict = existingBookings.some(booking => {
      // Convert times to minutes for easier comparison
      const newStartMinutes = timeToMinutes(startTime);
      const newEndMinutes = timeToMinutes(endTime);
      const bookingStartMinutes = timeToMinutes(booking.start_time);
      const bookingEndMinutes = timeToMinutes(booking.end_time);
      
      // Check if new booking overlaps with existing booking
      return (
        (newStartMinutes >= bookingStartMinutes && newStartMinutes < bookingEndMinutes) ||
        (newEndMinutes > bookingStartMinutes && newEndMinutes <= bookingEndMinutes) ||
        (newStartMinutes <= bookingStartMinutes && newEndMinutes >= bookingEndMinutes)
      );
    });
    
    if (hasConflict) {
      return NextResponse.json(
        { error: 'Provider is not available at the selected time' },
        { status: 400 }
      );
    }
    
    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_id: providerId,
        customer_id: session.user.id,
        service_id: serviceId,
        service_type: serviceType,
        service_name: serviceName,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        duration,
        price,
        status: 'pending',
        payment_status: 'pending',
        special_requests: specialRequests || null,
        participants: participants || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (bookingError) {
      return NextResponse.json(
        { error: bookingError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: booking
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to convert time string (HH:MM) to minutes for comparison
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
} 