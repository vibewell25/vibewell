import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';

type Business = { id: string; providerId: string; name: string; address: string; description: string };

const Businesses: NextPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [providerId, setProviderId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const fetchBiz = async () => {
    const res = await fetch('/api/businesses');
    const data = await res.json();
    setBusinesses(data.businesses || []);
  };

  useEffect(() => { fetchBiz(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/businesses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, name, address, description })
    });
    setProviderId(''); setName(''); setAddress(''); setDescription('');
    fetchBiz();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Businesses</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Provider ID" value={providerId} onChange={e => setProviderId(e.target.value)} />
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Button type="submit">Create Business</Button>
      </form>
      {businesses.map(b => (
        <Card key={b.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{b.name}</div>
            <div>{b.address}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/businesses/${b.id}`)}>Edit</Button>
            <Button onClick={async () => {
              if (confirm('Delete this business?')) {
                await fetch(`/api/businesses/${b.id}`, { method: 'DELETE' });
                fetchBiz();
              }
            }}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Businesses;
