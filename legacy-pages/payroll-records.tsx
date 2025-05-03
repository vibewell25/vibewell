import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

const PayrollRecords: NextPage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [salary, setSalary] = useState(0);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const router = useRouter();

  const fetchRecords = async () => {
    const res = await fetchWithTimeout('/api/payrollRecords/me');
    const data = await res.json();
    setRecords(data?.records || []);
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout('/api/payrollRecords', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, salary, periodStart, periodEnd })
    });
    setUserId(''); 
    setSalary(0); 
    setPeriodStart(''); 
    setPeriodEnd('');
    fetchRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    await fetchWithTimeout(`/api/payrollRecords/${id}`, { method: 'DELETE' });
    fetchRecords();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Records</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
        <Input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(Number(e.target.value))} />
        <Input type="date" placeholder="Period Start" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
        <Input type="date" placeholder="Period End" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
        <Button type="submit">Add Record</Button>
      </form>
      {records.map(r => (
        <Card key={r.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{r.salary}</div>
            <div>{new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/payroll-records/${r.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(r.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {records.length === 0 && <p>No records.</p>}
    </div>
  );
};

export default PayrollRecords;
