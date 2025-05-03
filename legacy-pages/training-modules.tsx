import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Module = { id: string; title: string; description: string; contentUrl: string };

const TrainingModules: NextPage = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const router = useRouter();

  const fetchMods = async () => {
    try {
      const res = await fetchWithTimeout('/api/trainingModules');
      const json = await res.json();
      setModules(json.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      alert('Failed to load training modules');
    }
  };

  useEffect(() => { fetchMods(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout('/api/trainingModules', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, contentUrl })
      });
      setTitle(''); setDescription(''); setContentUrl('');
      fetchMods();
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Failed to create training module');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this module?')) return;
    try {
      await fetchWithTimeout(`/api/trainingModules/${id}`, { method: 'DELETE' });
      fetchMods();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete training module');
    }
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
