import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

type Service = { id: string; name: string; price: number; duration: number };

const Book: NextPage = () => {
  const router = useRouter();
  const { serviceId } = router.query;
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>('');
  const [special, setSpecial] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!serviceId) return;
    fetch(`/api/services/${serviceId}`)
      .then(res => res.json())
      .then(data => setService(data.service))
      .catch(() => setError('Failed to load service'));
  }, [serviceId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const start = Date.now();
    
    if (!service || !date) {
      alert('Please select a service and date');
      return;
    }
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, date, notes: special })
      });
      
      if (Date.now() - start > 30000) throw new Error('Timeout');
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/bookings/${data.id}`);
      } else {
        alert('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Book Service</h1>
      {service ? (
        <Card className="p-4">
          <div className="mb-2"><strong>{service.name}</strong> (${service.price.toFixed(2)})</div>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <label className="block mb-1">Appointment Date</label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1">Special Requests</label>
              <Input type="text" value={special} onChange={e => setSpecial(e.target.value)} placeholder="Any notes..." />
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</Button>
          </form>
        </Card>
      ) : (
        <p>Loading service...</p>
      )}
    </div>
  );
};

export default Book;
