import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import { useRouter } from 'next/router';

type Hour = { id: string; businessId: string; dayOfWeek: number; openTime: string; closeTime: string };

const BusinessHours: NextPage = () => {
  const [hours, setHours] = useState<Hour[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const router = useRouter();

  const fetchHours = async () => {
    const res = await fetch('/api/businessHours');
    const data = await res.json();
    setHours(data.hours || []);
  };

  useEffect(() => { fetchHours(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/businessHours', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, dayOfWeek, openTime, closeTime })
    });
    setBusinessId(''); setDayOfWeek(0); setOpenTime(''); setCloseTime('');
    fetchHours();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Business Hours</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Business ID" value={businessId} onChange={e => setBusinessId(e.target.value)} />
        <Input placeholder="Day of Week (0=Sun)" type="number" value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))} />
        <Input placeholder="Open Time (HH:MM)" type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
        <Input placeholder="Close Time (HH:MM)" type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
        <Button type="submit">Create Hour</Button>
      </form>
      {hours.map(h => (
        <Card key={h.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">Day {h.dayOfWeek}: {h.openTime} - {h.closeTime}</div>
            <div>Business: {h.businessId}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/business-hours/${h.id}`)}>Edit</Button>
            <Button onClick={async () => {
              if (confirm('Delete hour?')) { await fetch(`/api/businessHours/${h.id}`, { method: 'DELETE' }); fetchHours(); }
            }}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BusinessHours;
