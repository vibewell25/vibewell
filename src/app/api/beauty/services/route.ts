import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.beautyService.findMany({
      take: 10,
      include: {
        reviews: true,
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching beauty services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
