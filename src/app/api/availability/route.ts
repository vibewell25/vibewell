import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { availability, providers, services } from '@/lib/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { addMinutes, format, parse } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');

    if (!providerId || !date) {
      return NextResponse.json({ error: 'Provider ID and date are required' }, { status: 400 });
    }

    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const providerAvailability = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.providerId, parseInt(providerId)),
          gte(availability.date, startOfDay),
          lte(availability.date, endOfDay)
        )
      );

    // Get provider's services
    const providerServices = await db
      .select()
      .from(services)
      .where(eq(services.providerId, parseInt(providerId)));

    // Generate time slots
    const timeSlots = generateTimeSlots(parsedDate, providerAvailability);

    return NextResponse.json({
      date: format(parsedDate, 'yyyy-MM-dd'),
      slots: timeSlots,
      services: providerServices,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, date, time, serviceId } = body;

    if (!providerId || !date || !time || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get service duration
    const service = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);

    if (!service.length) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const serviceDuration = service[0].duration;
    const startTime = parse(time, 'HH:mm', new Date(date));
    const endTime = addMinutes(startTime, serviceDuration);

    // Check if slots are available
    const existingSlots = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.providerId, providerId),
          gte(availability.startTime, startTime),
          lte(availability.endTime, endTime),
          eq(availability.isAvailable, false)
        )
      );

    if (existingSlots.length > 0) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 409 });
    }

    // Create appointment
    const [appointment] = await db
      .insert(appointments)
      .values({
        providerId,
        serviceId,
        userId: 'user123', // This would come from the session
        startTime,
        endTime,
        status: 'scheduled',
      })
      .returning();

    // Update availability
    await db
      .update(availability)
      .set({ isAvailable: false, appointmentId: appointment.id })
      .where(
        and(
          eq(availability.providerId, providerId),
          gte(availability.startTime, startTime),
          lte(availability.endTime, endTime)
        )
      );

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

function generateTimeSlots(date: Date, availability: any[]) {
  const slots = [];
  const startTime = parse('09:00', 'HH:mm', date);
  const endTime = parse('17:00', 'HH:mm', date);

  let currentTime = startTime;
  while (currentTime <= endTime) {
    const slotTime = format(currentTime, 'HH:mm');
    const isAvailable = !availability.some(
      slot => format(slot.startTime, 'HH:mm') === slotTime && !slot.isAvailable
    );

    slots.push({
      id: format(currentTime, 'HHmm'),
      time: slotTime,
      available: isAvailable,
    });

    currentTime = addMinutes(currentTime, 30);
  }

  return slots;
}
