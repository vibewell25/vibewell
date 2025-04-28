import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const BusinessDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [providerId, setProviderId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/businesses/${id}`)
      .then(res => res.json())
      .then(data => {
        const b = data.business;
        setProviderId(b.providerId);
        setName(b.name);
        setAddress(b.address);
        setDescription(b.description);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/businesses/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, name, address, description })
    });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Business</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Provider ID" value={providerId} onChange={e => setProviderId(e.target.value)} />
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default BusinessDetail;
