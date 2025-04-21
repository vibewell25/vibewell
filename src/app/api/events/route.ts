import { NextResponse } from 'next/server';
import { getEvents, getUpcomingEvents, getEventById } from '@/lib/api/events';

export async function GET(request: Request) {
  try {
    // Check for query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const upcoming = searchParams.get('upcoming');
    const limit = searchParams.get('limit');

    // If ID is provided, return a specific event
    if (id) {
      const event = await getEventById(id);

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(event);
    }

    // If upcoming is specified, return upcoming events
    if (upcoming === 'true') {
      const events = await getUpcomingEvents(limit ? parseInt(limit) : undefined);
      return NextResponse.json(events);
    }

    // Default: return all events
    const allEvents = await getEvents();
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error in events API route:', error);
    return NextResponse.json({ error: 'Failed to retrieve events' }, { status: 500 });
  }
}
