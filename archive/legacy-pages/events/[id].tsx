import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

const EventDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router?.query;
  const [event, setEvent] = useState<any>(null);
  const [regs, setRegs] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const fetchEventData = async () => {
      const eventRes = await fetchWithTimeout(`/api/events/${id}`);
      const eventData = await eventRes.json();
      setEvent(eventData);
      
      const regsRes = await fetchWithTimeout(`/api/eventRegistrations/event/${id}`);
      const regsData = await regsRes.json();
      setRegs(regsData?.registrations || []);
    };
    
    fetchEventData();
  }, [id]);

  const unregister = async (regId: string) => {
    if (!confirm('Unregister this user?')) return;
    await fetchWithTimeout(`/api/eventRegistrations/${regId}`, { method: 'DELETE' });
    setRegs(prev => prev.filter(r => r.id !== regId));
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      {event && (
        <>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <p className="mb-4">{event.description}</p>
          <p className="mb-4">{new Date(event.date).toLocaleString()}</p>
        </>
      )}
      <h2 className="text-xl font-semibold mb-2">Registrations</h2>
      {regs.length ? (
        regs.map(r => (
          <Card key={r.id} className="mb-2 flex justify-between items-center">
            <div>{r.userId}</div>
            <Button onClick={() => unregister(r.id)}>Unregister</Button>
          </Card>
        ))
      ) : (
        <p>No registrations.</p>
      )}
    </div>
  );
};

export default EventDetail;
