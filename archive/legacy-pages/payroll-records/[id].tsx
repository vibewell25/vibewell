import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

const PayrollRecordDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [salary, setSalary] = useState(0);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchRecord = async () => {
      const res = await fetchWithTimeout(`/api/payrollRecords/${id}`);
      const data = await res.json();
      setSalary(data.salary);
      setPeriodStart(new Date(data.periodStart).toISOString().substr(0,10));
      setPeriodEnd(new Date(data.periodEnd).toISOString().substr(0,10));
fetchRecord();
[id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout(`/api/payrollRecords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salary, periodStart, periodEnd })
if (router) {
      router.back();
const handleDelete = async () => {
    if (!confirm('Delete this record?')) return;
    await fetchWithTimeout(`/api/payrollRecords/${id}`, { method: 'DELETE' });
    if (router) {
      router.back();
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
export default PayrollRecordDetail;
