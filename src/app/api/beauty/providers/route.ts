import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Define a proper interface that matches the Prisma schema plus includes
interface ServiceWithReviews extends BeautyService {
  reviews: {
    rating: number;
    user: any;
  }[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Find the provider with all necessary data
    const provider = await prisma.user.findUnique({
      where: {
        id: providerId,
        role: Role.PROVIDER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        specialties: true,
        experience: true,
        providerBookings: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get the services provided by this provider
    const services = await prisma.beautyService.findMany({
      where: {
        bookings: {
          some: {
            providerId: providerId,
          },
        },
      },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Calculate average rating
    const reviews = services.flatMap(service => service.reviews);
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      ...provider,
      services,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bio, specialties, experience, phone } = await request.json();

    // Check if the user is a provider
    const userIsProvider = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        role: Role.PROVIDER,
      },
    });

    if (!userIsProvider) {
      return NextResponse.json(
        { error: 'Only providers can update their profile' },
        { status: 403 }
      );
    }

    // Update the provider profile with our new fields
    const provider = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        bio,
        specialties,
        experience,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        specialties: true,
        experience: true,
        phone: true,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}
