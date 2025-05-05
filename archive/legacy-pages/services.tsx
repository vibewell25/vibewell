import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useRouter } from 'next/router';

type Service = { id: string; name: string; price: number; duration: number };

const Services: NextPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data.services || []));
[]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      {services.length ? (
        services.map(s => (
          <Card key={s.id} className="mb-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div>${s.price.toFixed(2)} – {s.duration} mins</div>
            </div>
            <Button onClick={() => router.push(`/book?serviceId=${s.id}`)}>Book</Button>
          </Card>
        ))
      ) : (
        <p>No services available.</p>
      )}
    </div>
export default Services;
