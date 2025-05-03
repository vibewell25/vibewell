import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Event = { id: string; title: string; description: string; date: string };

const Events: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  const fetchEvents = async () => {
    const res = await fetchWithTimeout('/api/events');
    const data = await res?.json();
    setEvents(data?.events || []);
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => router?.push('/events/create')}>Create Event</Button>
      </div>
      {events?.map(e => (
        <Card key={e?.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{e?.title}</div>
            <div>{new Date(e?.date).toLocaleString()}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router?.push(`/events/${e?.id}`)}>Details</Button>
            <Button onClick={async () => {
              if (confirm('Delete this event?')) {
                await fetchWithTimeout(`/api/events/${e?.id}`, { method: 'DELETE' });
                fetchEvents();
              }
            }}>Delete</Button>
          </div>
        </Card>
      ))}
      {events?.length === 0 && <p>No events.</p>}
    </div>
  );
};

export default Events;
