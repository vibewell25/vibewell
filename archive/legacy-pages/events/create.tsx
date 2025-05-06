import React, { useState, FormEvent } from 'react';
import type { NextPage } from 'next';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

type Props = {};

const CreateEvent: NextPage<Props> = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const router = useRouter();

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout('/api/events', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, date })
if (router) {
      router.push('/events');
return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
        <Button type="submit">Create</Button>
      </form>
    </div>
export default CreateEvent;
