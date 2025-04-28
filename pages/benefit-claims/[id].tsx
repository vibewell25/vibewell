import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const BenefitClaimDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [type, setType] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('');
  const [processedAt, setProcessedAt] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/benefitClaims/${id}`)
      .then(res => res.json())
      .then((data: any) => {
        setType(data.type);
        setAmount(data.amount);
        setStatus(data.status);
        setProcessedAt(data.processedAt || '');
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/benefitClaims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, processedAt })
    });
    router.back();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this claim?')) return;
    await fetch(`/api/benefitClaims/${id}`, { method: 'DELETE' });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Benefit Claim Details</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <div>Type: {type}</div>
        <div>Amount: {amount}</div>
        <Input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} />
        <Input type="datetime-local" placeholder="Processed At" value={processedAt} onChange={e => setProcessedAt(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={handleDelete}>Delete</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default BenefitClaimDetail;
