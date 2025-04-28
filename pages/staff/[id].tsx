import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/router';

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
    fetch(`/api/staff/${id}`)
      .then(res => res.json())
      .then(data => {
        const s = data.staff;
        setBusinessId(s.businessId);
        setName(s.name);
        setRole(s.role);
        setEmail(s.email);
        setPhone(s.phone);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/staff/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, name, role, email, phone })
    });
    router.back();
  };

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
  );
};

export default StaffDetail;
