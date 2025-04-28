import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/router';

type InventoryItem = { id: string; name: string; description: string; quantity: number };

const InventoryDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/inventory/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name);
        setDescription(data.description);
        setQuantity(data.quantity);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/inventory/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, quantity })
    });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Inventory Item</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryDetail;
