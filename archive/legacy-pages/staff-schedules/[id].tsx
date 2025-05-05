import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

type Schedule = { id: string; staffId: string; date: string; startTime: string; endTime: string };

const ScheduleDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchSchedule = async () => {
      try {
        const res = await fetchWithTimeout(`/api/staffSchedules/${id}`);
        const data: Schedule = await res.json();
        setStaffId(data.staffId);
        setDate(data.date);
        setStartTime(data.startTime);
        setEndTime(data.endTime);
catch (error) {
        console.error('Error fetching schedule:', error);
        alert('Failed to load schedule details');
fetchSchedule();
[id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout(`/api/staffSchedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, date, startTime, endTime }),
router.back();
catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Staff ID" value={staffId} onChange={e => setStaffId(e.target.value)} />
        <Input type="date" placeholder="Date" value={date} onChange={e => setDate(e.target.value)} />
        <Input type="time" placeholder="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <Input type="time" placeholder="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
export default ScheduleDetail;
