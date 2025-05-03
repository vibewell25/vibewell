import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type EquipmentItem = { id: string; name: string; serialNumber: string; description: string };

const Equipment: NextPage = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const fetchItems = async () => {
    const res = await fetchWithTimeout('/api/equipment');
    const data = await res?.json();
    setItems(data?.items || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e?.preventDefault();
    await fetchWithTimeout('/api/equipment', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON?.stringify({ name, serialNumber, description })
    });
    setName(''); 
    setSerialNumber(''); 
    setDescription('');
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this equipment?')) return;
    await fetchWithTimeout(`/api/equipment/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Equipment</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Name" value={name} onChange={e => setName(e?.target.value)} />
        <Input placeholder="Serial Number" value={serialNumber} onChange={e => setSerialNumber(e?.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e?.target.value)} />
        <Button type="submit">Add Equipment</Button>
      </form>
      {items?.map(item => (
        <Card key={item?.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{item?.name}</div>
            <div>SN: {item?.serialNumber}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router?.push(`/equipment/${item?.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(item?.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {items?.length === 0 && <p>No equipment items.</p>}
    </div>
  );
};

export default Equipment;
