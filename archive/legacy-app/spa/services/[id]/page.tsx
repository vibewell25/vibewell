'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../../../src/components/common/LoadingSpinner';
import Notification from '../../../../src/components/common/Notification';

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

export default function ServiceDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const serviceId = parseInt(id as string, 10);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Find the service by ID
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="app-container">
        <div className="app-card flex flex-col items-center justify-center py-10 text-center">
          <p className="mb-4 text-muted-foreground">Service not found</p>
          <Link
            href="/spa/services"
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowNotification(true);
      
      // Navigate after a slight delay to allow user to see the notification
      setTimeout(() => {
        router.push('/spa/bookings');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="app-container">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <span className="mr-1">←</span> Back
        </button>
      </div>

      {/* Service details */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-muted">
        <div className="relative h-56 w-full">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="app-heading">{service.name}</h1>
          <span className="text-lg font-bold text-primary-600">${service.price}</span>
        </div>
        
        <div className="mb-2 flex items-center">
          <div className="app-rating mr-2">
            {'★'.repeat(service.rating)}
            {'☆'.repeat(5 - service.rating)}
          </div>
          <span className="text-sm text-muted-foreground">({service.rating}.0)</span>
        </div>
        
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-muted-foreground">
              <span className="mr-1 text-primary-600">👤</span> {service.provider}
            </span>
            <span className="flex items-center text-muted-foreground">
              <span className="mr-1 text-primary-600">⏱️</span> {service.duration}
            </span>
          </div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
            {service.category}
          </span>
        </div>
        
        <p className="text-foreground">{service.description}</p>
      </div>

      {/* Booking section */}
      <div className="app-card mb-6">
        <h2 className="app-subheading mb-4">Book Appointment</h2>
        
        {/* Date selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Select date</label>
          <div className="grid grid-cols-4 gap-2">
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`rounded-lg p-2 text-center text-sm ${
                  selectedDate === date
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-50 text-foreground'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
        
        {/* Time selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">Select time</label>
          <div className="grid grid-cols-4 gap-2">
            {availableTimes.map((time, index) => (
              <button
                key={index}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg p-2 text-center text-sm ${
                  selectedTime === time
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-50 text-foreground'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        
        {/* Book button */}
        <button
          onClick={handleBooking}
          disabled={isLoading || !selectedDate || !selectedTime}
          className="app-button w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span>Booking...</span>
            </div>
          ) : (
            'Book Now'
          )}
        </button>
      </div>

      {/* Provider info */}
      <div className="app-card">
        <h2 className="app-subheading mb-4">About Provider</h2>
        <div className="flex items-center">
          <div className="relative mr-4 h-16 w-16 overflow-hidden rounded-full bg-muted">
            <Image
              src="/images/avatar-placeholder.jpg"
              alt={service.provider}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{service.provider}</h3>
            <p className="text-sm text-muted-foreground">Wellness Expert</p>
            <div className="app-rating mt-1">
              {'★'.repeat(service.rating)}
              {'☆'.repeat(5 - service.rating)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification */}
      <Notification
        type="success"
        message={`Appointment for ${service.name} booked successfully!`}
        show={showNotification}
        onClose={() => setShowNotification(false)}
        duration={2000}
      />
    </div>
  );
}

// Sample data for services
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
    description: 'A therapeutic massage that focuses on realigning deeper layers of muscles and connective tissue. This technique is useful for chronic aches and pain and contracted areas such as a stiff neck and upper back, low back pain, leg muscle tightness, and sore shoulders.',
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
    description: 'Replenish dry skin with this hydrating facial that restores moisture and radiance. This treatment includes deep cleansing, exfoliation, hydrating mask, and moisturizing to leave your skin feeling refreshed and revitalized.',
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
    description: 'Professional haircut and styling tailored to your preferences and face shape. Includes consultation, shampoo, condition, precision cut, and blow dry styling with professional products.',
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
    description: 'Complete nail care for hands and feet, including cuticle care, nail shaping, and polish. This service includes soaking, exfoliation, massage, and your choice of polish for a refreshed look.',
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
    description: 'A gentle form of massage that uses long strokes, kneading, and circular movements to relax and energize you. This traditional massage helps improve circulation, ease muscle tension, and create a sense of well-being.',
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
    description: 'Combat signs of aging with this specialized facial that targets fine lines and wrinkles. Includes deep cleansing, exfoliation, anti-aging serum application, and specialized massage techniques to boost collagen production.',
  }
];

// Sample available dates
const availableDates = [
  'May 15',
  'May 16',
  'May 17',
  'May 18',
  'May 19',
  'May 20',
  'May 21',
  'May 22',
];

// Sample available times
const availableTimes = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
]; 