import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET a single booking
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the booking with related data
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        service: {
          select: {
            name: true,
            description: true,
            price: true,
            duration: true,
          },
        },
        business: {
          select: {
            name: true,
            location: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// Update a booking
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
    // First check if booking exists
    const { data: existingBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('provider_id, customer_id, status')
      .eq('id', params.id)
      .single();
    
    if (bookingError || !existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Check ownership or admin status
    const isProvider = existingBooking.provider_id === session.user.id;
    const isCustomer = existingBooking.customer_id === session.user.id;
    const isAdmin = session.user.app_metadata?.role === 'admin';
    
    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to update this booking' },
        { status: 401 }
      );
    }
    
    // Get update data
    const body = await request.json();
    const { status, paymentStatus, specialRequests, notes } = body;
    
    // Create update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Determine what can be updated based on user role
    if (isAdmin) {
      // Admins can update anything
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (specialRequests !== undefined) updateData.special_requests = specialRequests;
      if (notes !== undefined) updateData.notes = notes;
    } else if (isProvider) {
      // Providers can update status and their notes
      if (status && ['confirmed', 'completed', 'cancelled_by_provider', 'no_show'].includes(status)) {
        updateData.status = status;
      }
      
      if (notes !== undefined) {
        // Get existing notes to update just the provider notes
        const { data: currentBooking } = await supabase
          .from('bookings')
          .select('notes')
          .eq('id', params.id)
          .single();
        
        const currentNotes = currentBooking?.notes || {};
        updateData.notes = {
          ...currentNotes,
          providerNotes: notes.providerNotes
        };
      }
    } else if (isCustomer) {
      // Customers can cancel their booking or update special requests
      if (status === 'cancelled_by_customer' && ['pending', 'confirmed'].includes(existingBooking.status)) {
        updateData.status = status;
        updateData.cancellation_date = new Date().toISOString();
        
        if (body.cancellationReason) {
          updateData.cancellation_reason = body.cancellationReason;
        }
      }
      
      if (specialRequests !== undefined && ['pending', 'confirmed'].includes(existingBooking.status)) {
        updateData.special_requests = specialRequests;
      }
    }
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length <= 1) { // Just updated_at
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
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
    
    return NextResponse.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a booking
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Only pending or confirmed bookings can be cancelled' },
        { status: 400 }
      );
    }

    // Update booking status to CANCELLED instead of deleting
    const cancelledBooking = await prisma.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        business: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ booking: cancelledBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    // Validate status
    if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
          },
        },
        business: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 