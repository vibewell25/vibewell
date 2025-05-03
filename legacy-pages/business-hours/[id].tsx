import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

const BusinessHourDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBusinessHour = async () => {
      try {
        const res = await fetchWithTimeout(`/api/businessHours/${id}`);
        const data = await res.json();
        if (data.hour) {
          setDayOfWeek(data.hour.dayOfWeek);
          setOpenTime(data.hour.openTime);
          setCloseTime(data.hour.closeTime);
          setIsOpen(data.hour.isOpen);
        }
      } catch (error) {
        console.error('Error fetching business hour details:', error);
      }
    };
    
    fetchBusinessHour();
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout(`/api/businessHours/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek, openTime, closeTime, isOpen })
      });
      router.push('/business-hours');
    } catch (error) {
      console.error('Error updating business hours:', error);
      alert('Failed to update business hours.');
    }
  };

  const handleDelete = async () => {
    try {
      if (!confirm('Delete these business hours?')) return;
      
      await fetchWithTimeout(`/api/businessHours/${id}`, { 
        method: 'DELETE' 
      });
      
      router.back();
    } catch (error) {
      console.error('Error deleting business hours:', error);
      alert('Failed to delete business hours.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Business Hours</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Day of Week</label>
          <Input 
            value={dayOfWeek} 
            onChange={e => setDayOfWeek(e.target.value)} 
          />
        </div>
        
        <div>
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
        
        <div>
          <label className="block text-sm font-medium mb-1">Open Time</label>
          <Input 
            type="time" 
            value={openTime} 
            onChange={e => setOpenTime(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Close Time</label>
          <Input 
            type="time" 
            value={closeTime} 
            onChange={e => setCloseTime(e.target.value)} 
          />
        </div>
        
        <div className="flex space-x-2 pt-4">
          <Button type="submit">Update</Button>
          <Button type="button" onClick={handleDelete}>Delete</Button>
          <Button type="button" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default BusinessHourDetail;
