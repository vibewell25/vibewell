import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Provider = { id: string; name: string; description: string; businessName: string };

const Providers: NextPage = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessName, setBusinessName] = useState('');
  const router = useRouter();

  const fetchProv = async () => {
    const res = await fetchWithTimeout('/api/providers');
    const data = await res.json();
    setProviders(data?.providers || []);
  };

  useEffect(() => { fetchProv(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout('/api/providers', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, businessName })
    });
    setName(''); 
    setDescription(''); 
    setBusinessName('');
    fetchProv();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this provider?')) {
      await fetchWithTimeout(`/api/providers/${id}`, { method: 'DELETE' });
      fetchProv();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Providers</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
        <Button type="submit">Create Provider</Button>
      </form>
      {providers.map(p => (
        <Card key={p.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{p.name}</div>
            <div>{p.businessName}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/providers/${p.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(p.id)}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Providers;
