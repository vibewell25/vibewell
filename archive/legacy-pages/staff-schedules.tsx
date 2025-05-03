import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Schedule = { id: string; staffId: string; date: string; startTime: string; endTime: string };

const StaffSchedules: NextPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const router = useRouter();

  const fetchSchedules = async () => {
    try {
      const res = await fetchWithTimeout('/api/staffSchedules');
      const json = await res.json();
      setSchedules(json.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('Failed to load schedules');
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout('/api/staffSchedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, date, startTime, endTime })
      });
      setStaffId(''); setDate(''); setStartTime(''); setEndTime('');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await fetchWithTimeout(`/api/staffSchedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Staff Schedules</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Staff ID" value={staffId} onChange={e => setStaffId(e.target.value)} />
        <Input type="date" placeholder="Date" value={date} onChange={e => setDate(e.target.value)} />
        <Input type="time" placeholder="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <Input type="time" placeholder="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        <Button type="submit">Create Schedule</Button>
      </form>
      {schedules.map(s => (
        <Card key={s.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{s.staffId} - {new Date(s.date).toLocaleDateString()}</div>
            <div>{new Date(s.startTime).toLocaleTimeString()} to {new Date(s.endTime).toLocaleTimeString()}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/staff-schedules/${s.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(s.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {schedules.length === 0 && <p>No schedules.</p>}
    </div>
  );
};

export default StaffSchedules;
