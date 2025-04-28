import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Bookings: NextPage = () => {
  const [data, setData] = useState<any[]>([]);
  const fetchData = async () => {
    const res = await fetch('/api/bookings');
    const json = await res.json();
    setData(json.bookings || json);
  };
  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      {data.length ? data.map(item => (
        <Card key={item.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{item.service?.name}</div>
            <div>{new Date(item.appointmentDate).toLocaleString()}</div>
          </div>
          <Button onClick={() => handleCancel(item.id)}>Cancel</Button>
        </Card>
      )) : <p>No bookings.</p>}
    </div>
  );
};

export default Bookings;
