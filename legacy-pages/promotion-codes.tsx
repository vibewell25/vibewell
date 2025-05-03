import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type PromotionCode = { id: string; code: string; description: string; discount: number; validFrom: string; validTo: string };

const PromotionCodes: NextPage = () => {
  const [codes, setCodes] = useState<PromotionCode[]>([]);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const router = useRouter();

  const fetchCodes = async () => {
    const res = await fetchWithTimeout('/api/promotionCodes');
    const json = await res.json();
    setCodes(json?.codes || []);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout('/api/promotionCodes', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, description, discount, validFrom, validTo })
    });
    setCode(''); 
    setDescription(''); 
    setDiscount(0); 
    setValidFrom(''); 
    setValidTo('');
    fetchCodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this code?')) return;
    await fetchWithTimeout(`/api/promotionCodes/${id}`, { method: 'DELETE' });
    fetchCodes();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Promotion Codes</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Discount" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
        <Input type="date" placeholder="Valid From" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
        <Input type="date" placeholder="Valid To" value={validTo} onChange={e => setValidTo(e.target.value)} />
        <Button type="submit">Create Code</Button>
      </form>
      {codes.map(c => (
        <Card key={c.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{c.code} ({c.discount}%)</div>
            <div>{c.description}</div>
            <div>{new Date(c.validFrom).toLocaleDateString()} - {new Date(c.validTo).toLocaleDateString()}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/promotion-codes/${c.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(c.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {codes.length === 0 && <p>No codes.</p>}
    </div>
  );
};

export default PromotionCodes;
