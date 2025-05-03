'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

export default function ServicesPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="app-container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="app-heading">Services</h1>
        <button className="app-icon-button">
          <span className="text-xl">🔍</span>
        </button>
      </div>

      {/* Category filter */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-3 pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('massage')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              filter === 'massage'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            Massage
          </button>
          <button
            onClick={() => setFilter('facial')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              filter === 'facial'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            Facial
          </button>
          <button
            onClick={() => setFilter('hair')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              filter === 'hair'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            Hair
          </button>
          <button
            onClick={() => setFilter('nails')}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              filter === 'nails'
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            Nails
          </button>
        </div>
      </div>

      {/* Services list */}
      <div className="space-y-4">
        {services
          .filter(service => filter === 'all' || service.category === filter)
          .map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
      </div>
    </div>
  );
}

type Service = {
  id: number;
  name: string;
  provider: string;
  category: string;
  price: number;
  duration: string;
  image: string;
  rating: number;
  description: string;
};

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/spa/services/${service.id}`} className="app-card block">
      <div className="mb-4 overflow-hidden rounded-2xl bg-muted">
        <div className="aspect-w-16 aspect-h-9 relative h-40 w-full">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
        <span className="font-medium text-primary-600">${service.price}</span>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{service.provider}</p>
        <p className="text-sm text-muted-foreground">{service.duration}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="app-rating">
          {'★'.repeat(service.rating)}
          {'☆'.repeat(5 - service.rating)}
        </div>
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
          {service.category}
        </span>
      </div>
    </Link>
  );
}

// Sample data
const services: Service[] = [
  {
    id: 1,
    name: 'Deep Tissue Massage',
    provider: 'Sarah Johnson',
    category: 'massage',
    price: 75,
    duration: '60 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 5,
    description: 'A therapeutic massage that focuses on realigning deeper layers of muscles and connective tissue.',
  },
  {
    id: 2,
    name: 'Hydrating Facial',
    provider: 'Michael Chen',
    category: 'facial',
    price: 65,
    duration: '45 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 4,
    description: 'Replenish dry skin with this hydrating facial that restores moisture and radiance.',
  },
  {
    id: 3,
    name: 'Haircut & Style',
    provider: 'Emma Wilson',
    category: 'hair',
    price: 55,
    duration: '60 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 5,
    description: 'Professional haircut and styling tailored to your preferences and face shape.',
  },
  {
    id: 4,
    name: 'Manicure & Pedicure',
    provider: 'Jennifer Lee',
    category: 'nails',
    price: 50,
    duration: '75 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 4,
    description: 'Complete nail care for hands and feet, including cuticle care, nail shaping, and polish.',
  },
  {
    id: 5,
    name: 'Swedish Massage',
    provider: 'David Brown',
    category: 'massage',
    price: 70,
    duration: '60 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 5,
    description: 'A gentle form of massage that uses long strokes, kneading, and circular movements to relax and energize you.',
  },
  {
    id: 6,
    name: 'Anti-Aging Facial',
    provider: 'Michael Chen',
    category: 'facial',
    price: 85,
    duration: '60 min',
    image: '/images/avatar-placeholder.jpg',
    rating: 5,
    description: 'Combat signs of aging with this specialized facial that targets fine lines and wrinkles.',
  }
]; 