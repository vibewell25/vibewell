import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  tax?: number;
  capacity?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const service: ServiceData = await request.json();

    // Validate the service data
    if (!service.name || !service.duration || !service.price) {
      return new NextResponse('Invalid service data', { status: 400 });
    }

    // Get the user's business through practitioner relationship
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        practitioner: {
          include: {
            business: true
          }
        }
      }
    });

    if (!user?.practitioner?.business) {
      return new NextResponse('Business not found', { status: 404 });
    }

    // Create or update the service
    const updatedService = await prisma.beautyService.upsert({
      where: {
        id: service.id,
      },
      create: {
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        category: service.category || '',
        tax: service.tax || 0,
        capacity: service.capacity || 1,
        businessId: user.practitioner.business.id
      },
      update: {
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        category: service.category || '',
        tax: service.tax || 0,
        capacity: service.capacity || 1,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error syncing service:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}