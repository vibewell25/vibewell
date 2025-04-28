import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const PayrollRecordDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [salary, setSalary] = useState(0);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/payrollRecords/${id}`)
      .then(res => res.json())
      .then((data: any) => {
        setSalary(data.salary);
        setPeriodStart(new Date(data.periodStart).toISOString().substr(0,10));
        setPeriodEnd(new Date(data.periodEnd).toISOString().substr(0,10));
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/payrollRecords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salary, periodStart, periodEnd })
    });
    router.back();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this record?')) return;
    await fetch(`/api/payrollRecords/${id}`, { method: 'DELETE' });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Record Details</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(Number(e.target.value))} />
        <Input type="date" placeholder="Period Start" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
        <Input type="date" placeholder="Period End" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={handleDelete}>Delete</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default PayrollRecordDetail;
