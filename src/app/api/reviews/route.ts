import { prisma } from '@/lib/database/client';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  
  try {
    let reviews;
    
    if (providerId) {
      reviews = await prisma.review.findMany({
        where: {
          providerId: providerId
        },
        include: {
          customer: true,
          provider: true
        }
      });
    } else {
      reviews = await prisma.review.findMany({
        include: {
          customer: true,
          provider: true
        }
      });
    }
    
    return NextResponse.json({ 
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Error fetching reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Check if user is authenticated with Auth0
  const session = await getSession();
  if (!session || !session.user) {
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
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    // If booking ID is provided, verify ownership
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      // Check if the booking belongs to the user
      if (booking.customerId !== session.user.sub) {
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
      const existingReview = await prisma.review.findFirst({
        where: {
          bookingId: bookingId,
          customerId: session.user.sub
        }
      });
      
      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already submitted a review for this booking' },
          { status: 400 }
        );
      }
    }
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        title,
        text,
        rating,
        providerId: providerId,
        customerId: session.user.sub,
        bookingId: bookingId || null
      }
    });
    
    // Calculate and update provider average rating
    const reviews = await prisma.review.findMany({
      where: { providerId: providerId }
    });
    
    if (reviews && reviews.length > 0) {
      const avgValue = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
      
      await prisma.provider.update({
        where: { id: providerId },
        data: { 
          avgRating: avgValue, 
          totalReviews: reviews.length 
        }
      });
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