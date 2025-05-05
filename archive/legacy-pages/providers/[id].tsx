import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

type Provider = { id: string; name: string; description: string; businessName: string };

const ProviderDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchProvider = async () => {
      const res = await fetchWithTimeout(`/api/providers/${id}`);
      const data = await res.json();
      const p = data.provider;
      setName(p.name);
      setDescription(p.description);
      setBusinessName(p.businessName);
fetchProvider();
[id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout(`/api/providers/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, businessName })
if (router) {
      router.back();
return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Provider</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
export default ProviderDetail;
