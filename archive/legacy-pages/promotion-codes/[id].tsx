import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

const PromotionCodeDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchPromotionCode = async () => {
      const res = await fetchWithTimeout(`/api/promotionCodes/${id}`);
      const data = await res.json();
      setCode(data.code);
      setDescription(data.description);
      setDiscount(data.discount);
      setValidFrom(new Date(data.validFrom).toISOString().substr(0,10));
      setValidTo(new Date(data.validTo).toISOString().substr(0,10));
    };
    
    fetchPromotionCode();
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout(`/api/promotionCodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, description, discount, validFrom, validTo })
    });
    if (router) {
      router.back();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this code?')) return;
    await fetchWithTimeout(`/api/promotionCodes/${id}`, { method: 'DELETE' });
    if (router) {
      router.back();
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Promotion Code Detail</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Discount" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
        <Input type="date" placeholder="Valid From" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
        <Input type="date" placeholder="Valid To" value={validTo} onChange={e => setValidTo(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={handleDelete}>Delete</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default PromotionCodeDetail;
