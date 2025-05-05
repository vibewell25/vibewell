import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Business = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
const Businesses: NextPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const fetchBiz = async () => {
    try {
      const res = await fetchWithTimeout('/api/businesses');
      const data = await res.json();
      setBusinesses(data.businesses || []);
catch (error) {
      console.error('Error fetching businesses:', error);
useEffect(() => {
    fetchBiz();
[]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithTimeout('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, phone, email })
setName('');
      setAddress('');
      setPhone('');
      setEmail('');
      fetchBiz();
catch (error) {
      console.error('Error creating business:', error);
const handleDelete = async (id: string) => {
    try {
      if (!confirm('Delete this business?')) return;
      
      await fetchWithTimeout(`/api/businesses/${id}`, { 
        method: 'DELETE' 
fetchBiz();
catch (error) {
      console.error('Error deleting business:', error);
return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Businesses</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            placeholder="Business Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
        <Button type="submit">Add Business</Button>
      </form>
      
      {businesses.map(biz => (
        <Card key={biz.id} className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{biz.name}</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>{biz.address}</p>
                <p>{biz.phone}</p>
                <p>{biz.email}</p>
              </div>
            </div>
            <div className="space-x-2">
              <Button onClick={() => router.push(`/businesses/${biz.id}`)}>
                Edit
              </Button>
              <Button onClick={() => handleDelete(biz.id)}>
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
      
      {businesses.length === 0 && <p>No businesses added yet.</p>}
    </div>
export default Businesses;
