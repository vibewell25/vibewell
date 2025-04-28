import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';

type Module = { id: string; title: string; description: string; contentUrl: string };

const TrainingModules: NextPage = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const router = useRouter();

  const fetchMods = async () => {
    const res = await fetch('/api/trainingModules');
    const json = await res.json();
    setModules(json.modules || []);
  };

  useEffect(() => { fetchMods(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/trainingModules', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, contentUrl })
    });
    setTitle(''); setDescription(''); setContentUrl('');
    fetchMods();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this module?')) return;
    await fetch(`/api/trainingModules/${id}`, { method: 'DELETE' });
    fetchMods();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Training Modules</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input placeholder="Content URL" value={contentUrl} onChange={e => setContentUrl(e.target.value)} />
        <Button type="submit">Add Module</Button>
      </form>
      {modules.map(m => (
        <Card key={m.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{m.title}</div>
            <div>{m.description}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/training-modules/${m.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(m.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {modules.length === 0 && <p>No modules.</p>}
    </div>
  );
};

export default TrainingModules;
