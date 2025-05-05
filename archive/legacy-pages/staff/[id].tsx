import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { NextPage } from 'next';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

type StaffMember = { id: string; businessId: string; name: string; role: string; email: string; phone: string };

const StaffDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [businessId, setBusinessId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchStaffMember = async () => {
      try {
        const res = await fetchWithTimeout(`/api/staff/${id}`);
        const data = await res.json();
        const s = data.staff;
        setBusinessId(s.businessId);
        setName(s.name);
        setRole(s.role);
        setEmail(s.email);
        setPhone(s.phone);
catch (error) {
        console.error('Error fetching staff member:', error);
        alert('Failed to load staff member details');
fetchStaffMember();
[id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout(`/api/staff/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, name, role, email, phone })
router.back();
catch (error) {
      console.error('Error updating staff member:', error);
      alert('Failed to update staff member');
return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Staff Member</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Business ID" value={businessId} onChange={e => setBusinessId(e.target.value)} />
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
export default StaffDetail;
