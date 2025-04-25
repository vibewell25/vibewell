import React from 'react';
import FeaturedServices from '@/components/home/FeaturedServices';

export default function ServicesPage() {
  return (
    <main className="services-page py-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Our Services</h1>
      <div className="max-w-4xl mx-auto">
        <FeaturedServices />
      </div>
    </main>
  );
}
