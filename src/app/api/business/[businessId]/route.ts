import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ServiceReview } from '@prisma/client';

type BusinessWithRelations = Awaited<ReturnType<typeof prisma.business.findUnique>> & {
  reviews: ServiceReview[];
  practitioners: Array<{
    reviews: ServiceReview[];
  }>;
};

export async function GET(request: Request, { params }: { params: { businessId: string } }) {
  try {
    const business = (await prisma.business.findUnique({
      where: {
        id: params.businessId,
      },
      include: {
        reviews: true,
        practitioners: {
          include: {
            reviews: true,
          },
        },
      },
    })) as BusinessWithRelations;

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Calculate average rating
    const reviews = business.reviews || [];
    const practitionerReviews = business.practitioners?.flatMap((p) => p.reviews) || [];
    const allReviews = [...reviews, ...practitionerReviews];

    const averageRating =
      allReviews.reduce((acc: number, review: ServiceReview) => {
        return acc + review.rating;
      }, 0) / (allReviews.length || 1);

    return NextResponse.json({
      ...business,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: allReviews.length,
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}
