import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';

type AttendanceRecord = { id: string; scheduleId: string; status: string };

const Attendance: NextPage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [scheduleId, setScheduleId] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  const fetchRecords = async () => {
    const start = Date.now();
    try {
      const res = await fetch('/api/attendance');
      if (Date.now() - start > 30000) throw new Error('Timeout');
      const json = await res.json();
      return json;
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
      return [];
    }
  };

  useEffect(() => { fetchRecords().then(setRecords); }, []);

  const handleCreate = async (e: FormEvent) => {
    e?.preventDefault();
    await fetch('/api/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId, status })
    });
    setScheduleId(''); setStatus('');
    fetchRecords().then(setRecords);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance record?')) return;
    await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
    fetchRecords().then(setRecords);
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Schedule ID" value={scheduleId} onChange={e => setScheduleId(e?.target.value)} />
        <Input placeholder="Status" value={status} onChange={e => setStatus(e?.target.value)} />
        <Button type="submit">Create Record</Button>
      </form>
      {records?.map(r => (
        <Card key={r?.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">Schedule: {r?.scheduleId}</div>
            <div>Status: {r?.status}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router?.push(`/attendance/${r?.id}`)}>Details</Button>
            <Button onClick={() => handleDelete(r?.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {records?.length === 0 && <p>No attendance records.</p>}
    </div>
  );
};

export default Attendance;
