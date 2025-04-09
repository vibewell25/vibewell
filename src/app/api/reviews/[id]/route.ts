import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET a single review
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*, customer:profiles(*), provider:providers(*)')
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json(
      { error: 'Review not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data
  });
}

// Update a review
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  
  try {
    // First check if review exists and belongs to this user
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('customer_id, provider_id')
      .eq('id', params.id)
      .single();
    
    if (reviewError || !existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check ownership or admin status
    if (existingReview.customer_id !== session.user.id && session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this review' },
        { status: 401 }
      );
    }
    
    // Get update data
    const body = await request.json();
    const { title, text, rating } = body;
    
    // Validation
    if (!title && !text && !rating) {
      return NextResponse.json(
        { error: 'Please provide at least one field to update' },
        { status: 400 }
      );
    }
    
    // Create update object
    const updateData: { title?: string; text?: string; rating?: number } = {};
    if (title) updateData.title = title;
    if (text) updateData.text = text;
    if (rating) updateData.rating = rating;
    
    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }
    
    // Recalculate provider average rating
    const providerId = existingReview.provider_id;
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
      data: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a review
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  
  try {
    // First check if review exists and belongs to this user
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('customer_id, provider_id')
      .eq('id', params.id)
      .single();
    
    if (reviewError || !existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check ownership or admin status
    if (existingReview.customer_id !== session.user.id && session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this review' },
        { status: 401 }
      );
    }
    
    // Store provider ID for later rating calculation
    const providerId = existingReview.provider_id;
    
    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id);
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }
    
    // Recalculate provider average rating
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
    } else {
      // No reviews left, reset rating
      await supabase
        .from('providers')
        .update({ avg_rating: 0, total_reviews: 0 })
        .eq('id', providerId);
    }
    
    return NextResponse.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 