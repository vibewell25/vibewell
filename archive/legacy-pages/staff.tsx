import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type StaffMember = { id: string; businessId: string; name: string; role: string; email: string; phone: string };

const Staff: NextPage = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const fetchStaff = async () => {
    try {
      const res = await fetchWithTimeout('/api/staff');
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Failed to load staff');
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout('/api/staff', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, name, role, email, phone })
      });
      setBusinessId(''); setName(''); setRole(''); setEmail(''); setPhone('');
      fetchStaff();
    } catch (error) {
      console.error('Error creating staff member:', error);
      alert('Failed to add staff member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    try {
      await fetchWithTimeout(`/api/staff/${id}`, { method: 'DELETE' });
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      alert('Failed to delete staff member');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Staff Members</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Business ID" value={businessId} onChange={e => setBusinessId(e.target.value)} />
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <Button type="submit">Add Staff</Button>
      </form>
      {staff.map(s => (
        <Card key={s.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{s.name} ({s.role})</div>
            <div>Biz: {s.businessId}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/staff/${s.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(s.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {staff.length === 0 && <p>No staff members.</p>}
    </div>
  );
};

export default Staff;
