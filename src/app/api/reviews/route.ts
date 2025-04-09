import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies().get(name)?.value,
        set: () => {}, // Not needed for GET requests
        remove: () => {}, // Not needed for GET requests
      },
    }
  );
  
  let query = supabase.from('reviews').select('*, customer:profiles(*), provider:providers(*)');
  
  if (providerId) {
    query = query.eq('provider_id', providerId);
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
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies().get(name)?.value,
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
  
  try {
    const body = await request.json();
    const { providerId, bookingId, title, text, rating } = body;
    
    // Validation
    if (!providerId || !title || !text || !rating) {
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
    
    // If booking ID is provided, verify ownership
    if (bookingId) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('customer_id, status')
        .eq('id', bookingId)
        .single();
      
      if (bookingError || !booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      // Check if the booking belongs to the user
      if (booking.customer_id !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to review this booking' },
          { status: 401 }
        );
      }
      
      // Check if the booking is completed
      if (booking.status !== 'completed') {
        return NextResponse.json(
          { error: 'You can only review completed bookings' },
          { status: 400 }
        );
      }
      
      // Check for existing review for this booking
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('customer_id', session.user.id);
      
      if (existingReview && existingReview.length > 0) {
        return NextResponse.json(
          { error: 'You have already submitted a review for this booking' },
          { status: 400 }
        );
      }
    }
    
    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        title,
        text,
        rating,
        provider_id: providerId,
        customer_id: session.user.id,
        booking_id: bookingId || null
      })
      .select()
      .single();
    
    if (reviewError) {
      return NextResponse.json(
        { error: reviewError.message },
        { status: 500 }
      );
    }
    
    // Calculate and update provider average rating
    const { data: avgRating } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId);
    
    if (avgRating && avgRating.length > 0) {
      const avgValue = avgRating.reduce((sum: number, item: { rating: number }) => sum + item.rating, 0) / avgRating.length;
      
      await supabase
        .from('providers')
        .update({ avg_rating: avgValue, total_reviews: avgRating.length })
        .eq('id', providerId);
    }
    
    return NextResponse.json({
      success: true,
      data: review
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 