import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

const BusinessDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchBusinessDetails = async () => {
      try {
        const res = await fetchWithTimeout(`/api/businesses/${id}`);
        const data = await res.json();
        if (data.business) {
          setName(data.business.name);
          setAddress(data.business.address);
          setPhone(data.business.phone || '');
          setEmail(data.business.email || '');
        }
      } catch (error) {
        console.error('Error fetching business details:', error);
      }
    };
    
    fetchBusinessDetails();
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, phone, email })
      });
      router.push('/businesses');
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Failed to update business');
    }
  };

  const handleDelete = async () => {
    try {
      if (!confirm('Delete this business?')) return;
      
      await fetchWithTimeout(`/api/businesses/${id}`, {
        method: 'DELETE'
      });
      
      router.push('/businesses');
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Business</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <Input 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <Input 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="flex space-x-2 pt-4">
          <Button type="submit">Update</Button>
          <Button type="button" onClick={handleDelete}>Delete</Button>
          <Button type="button" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default BusinessDetail;
