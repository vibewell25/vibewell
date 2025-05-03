import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

type EquipmentItem = { id: string; name: string; serialNumber: string; description: string };

const EquipmentDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router?.query as { id: string };
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchEquipment = async () => {
      const res = await fetchWithTimeout(`/api/equipment/${id}`);
      const data = await res?.json();
      setName(data?.name);
      setSerialNumber(data?.serialNumber);
      setDescription(data?.description);
    };
    fetchEquipment();
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e?.preventDefault();
    await fetchWithTimeout(`/api/equipment/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON?.stringify({ name, serialNumber, description })
    });
    router?.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Equipment</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <Input placeholder="Name" value={name} onChange={e => setName(e?.target.value)} />
        <Input placeholder="Serial Number" value={serialNumber} onChange={e => setSerialNumber(e?.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e?.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router?.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentDetail;
