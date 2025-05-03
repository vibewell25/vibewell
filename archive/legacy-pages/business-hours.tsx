import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type BusinessHour = {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
};

const BusinessHours: NextPage = () => {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const fetchHours = async () => {
    try {
      const res = await fetchWithTimeout('/api/businessHours');
      const data = await res.json();
      setHours(data.hours || []);
    } catch (error) {
      console.error('Error fetching business hours:', error);
    }
  };

  useEffect(() => { 
    fetchHours(); 
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout('/api/businessHours', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek, openTime, closeTime, isOpen })
      });
      setDayOfWeek(''); 
      setOpenTime(''); 
      setCloseTime('');
      setIsOpen(true);
      fetchHours();
    } catch (error) {
      console.error('Error creating business hours:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!confirm('Delete these business hours?')) return;
      
      await fetchWithTimeout(`/api/businessHours/${id}`, { 
        method: 'DELETE' 
      });
      
      fetchHours();
    } catch (error) {
      console.error('Error deleting business hours:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Business Hours</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input 
            placeholder="Day of Week" 
            value={dayOfWeek} 
            onChange={e => setDayOfWeek(e.target.value)} 
          />
          <div className="flex space-x-2 items-center">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={isOpen} 
                onChange={e => setIsOpen(e.target.checked)} 
                className="mr-2"
              />
              <span>Is Open</span>
            </label>
          </div>
          <Input 
            type="time" 
            placeholder="Open Time" 
            value={openTime} 
            onChange={e => setOpenTime(e.target.value)} 
          />
          <Input 
            type="time" 
            placeholder="Close Time" 
            value={closeTime} 
            onChange={e => setCloseTime(e.target.value)} 
          />
        </div>
        <Button type="submit">Add Hours</Button>
      </form>
      
      {hours.map(hour => (
        <Card key={hour.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{hour.dayOfWeek}</div>
            <div>
              {hour.isOpen 
                ? `${hour.openTime} - ${hour.closeTime}` 
                : 'Closed'}
            </div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/business-hours/${hour.id}`)}>
              Edit
            </Button>
            <Button onClick={() => handleDelete(hour.id)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
      
      {hours.length === 0 && <p>No business hours defined.</p>}
    </div>
  );
};

export default BusinessHours;
