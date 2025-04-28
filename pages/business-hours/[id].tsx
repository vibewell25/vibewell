import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type Hour = { id: string; businessId: string; dayOfWeek: number; openTime: string; closeTime: string };

const HourDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [businessId, setBusinessId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/businessHours/${id}`)
      .then(res => res.json())
      .then(data => {
        const h = data.hour;
        setBusinessId(h.businessId);
        setDayOfWeek(h.dayOfWeek);
        setOpenTime(h.openTime);
        setCloseTime(h.closeTime);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/businessHours/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, dayOfWeek, openTime, closeTime })
    });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Business Hour</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Business ID" value={businessId} onChange={e => setBusinessId(e.target.value)} />
        <Input placeholder="Day of Week (0=Sun)" type="number" value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))} />
        <Input placeholder="Open Time" type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
        <Input placeholder="Close Time" type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default HourDetail;
