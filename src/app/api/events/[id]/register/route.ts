import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if event exists and has space
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.currentAttendees >= event.maxAttendees) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Create registration and update attendee count
    const registration = await prisma.$transaction([
      prisma.eventRegistration.create({
        data: {
          eventId: id,
          userId: session.user.id,
        },
      }),
      prisma.event.update({
        where: { id },
        data: {
          currentAttendees: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}
