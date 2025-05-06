import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/router';

type BenefitClaim = { id: string; type: string; amount: number; status: string; processedAt?: string };

const BenefitClaims: NextPage = () => {
  const [claims, setClaims] = useState<BenefitClaim[]>([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState(0);
  const router = useRouter();

  const fetchClaims = async () => {
    const start = Date.now();
    try {
      const res = await fetch('/api/benefitClaims/me');
      if (Date.now() - start > 30000) throw new Error('Timeout');
      const data = await res.json();
      return data;
catch (error) {
      console.error('Failed to fetch benefit claims:', error);
      return [];
useEffect(() => { fetchClaims().then(data => setClaims(data.claims || [])); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/benefitClaims', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount })
setType(''); setAmount(0);
    fetchClaims().then(data => setClaims(data.claims || []));
const handleDelete = async (id: string) => {
    if (!confirm('Delete this claim?')) return;
    await fetch(`/api/benefitClaims/${id}`, { method: 'DELETE' });
    fetchClaims().then(data => setClaims(data.claims || []));
return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Benefit Claims</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Type" value={type} onChange={e => setType(e.target.value)} />
        <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        <Button type="submit">Create Claim</Button>
      </form>
      {claims.map(c => (
        <Card key={c.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{c.type}: {c.amount}</div>
            <div>Status: {c.status}</div>
            <div>Processed At: {c.processedAt || '-'}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/benefit-claims/${c.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(c.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {claims.length === 0 && <p>No claims.</p>}
    </div>
export default BenefitClaims;
