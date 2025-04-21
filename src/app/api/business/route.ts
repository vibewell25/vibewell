import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businesses = await prisma.business.findMany({
      where: {
        isActive: true,
      },
      include: {
        services: {
          select: {
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    const formattedBusinesses = businesses.map(business => {
      const totalReviews = business.reviews.length;
      const averageRating =
        totalReviews > 0
          ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      return {
        id: business.id,
        name: business.name,
        description: business.description,
        category: business.category,
        rating: averageRating,
        reviewCount: totalReviews,
        imageUrl: business.imageUrl,
        location: business.location,
        services: business.services.map(service => service.name),
      };
    });

    return NextResponse.json(formattedBusinesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}
