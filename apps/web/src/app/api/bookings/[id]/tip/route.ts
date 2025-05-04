
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, message } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid tip amount' }, { status: 400 });
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'COMPLETED', // Only allow tips for completed bookings
      },
      include: {
        business: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not eligible for tipping' },
        { status: 404 },
      );
    }

    // Create the tip
    const tip = await prisma.tip.create({
      data: {
        amount,
        message,
        bookingId: booking.id,
        businessId: booking.business.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update business's total tips
    await prisma.business.update({
      where: {
        id: booking.business.id,
      },
      data: {
        totalTips: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({ tip });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json({ error: 'Failed to create tip' }, { status: 500 });
  }
}
