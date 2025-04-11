import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: {
        id: params.id,
      },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            user: {
              select: {
                name: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedBusiness = {
      ...business,
      reviews: business.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.user.name,
        date: review.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ business: formattedBusiness });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
} 