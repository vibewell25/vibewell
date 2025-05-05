import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/components/icons';
// Mock data for provider
const provider = {
  id: 'provider1',
  name: 'Hannah Palmer',
  title: 'Hi2Rio Fem',
  image: 'https://placehold.co/100x100?text=H',
  service: 'Hair Styling',
  location: 'Cait Up & Ups · Chicago',
  price: '€00',
// Mock data for available dates
const availableDates = [
  { day: 24, weekday: 'Sa', isSelected: true, isAvailable: true },
  { day: 25, weekday: 'Su', isSelected: false, isAvailable: true },
  { day: 26, weekday: 'Mo', isSelected: false, isAvailable: true },
  { day: 27, weekday: 'Tu', isSelected: false, isAvailable: true },
  { day: 28, weekday: 'We', isSelected: false, isAvailable: true },
];
export default function BookingDetailsPage() {
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [selectedTime, setSelectedTime] = useState('');
  return (
    <MobileLayout>
      <div className="pb-24">
        {/* Header with Back Button */}
        <div className="flex items-center border-b border-gray-200 bg-white px-5 py-4">
          <Link href="/bookings/search" className="mr-4">
            <Icons.ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Booking</h1>
        </div>
        {/* Availability Section */}
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="mb-3 text-lg font-medium">Availability</h2>
          <div className="mb-4 flex justify-between">
            {availableDates.map((date) => (
              <button
                key={date.day}
                onClick={() => setSelectedDate(date)}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-md ${
                  date.isSelected
                    ? 'bg-primary text-white'
                    : date.isAvailable
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-100 text-gray-400'
`}
                disabled={!date.isAvailable}
              >
                <span className="text-xs">{date.weekday}</span>
                <span className="text-sm font-medium">{date.day}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Provider Info */}
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="mb-3 text-lg font-medium">Availability</h2>
          <div className="flex items-center">
            <div className="relative mr-3 h-12 w-12 overflow-hidden rounded-full">
              <Image src={provider.image} alt={provider.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-medium">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.title}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="font-medium">{provider.service}</p>
            <p className="text-sm text-gray-500">{provider.location}</p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-gray-500">Signing price</p>
            <p className="font-medium">{provider.price}</p>
          </div>
        </div>
        {/* Time Slots */}
        <div className="px-5 py-4">
          <h2 className="mb-3 text-lg font-medium">Payment</h2>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className={selectedTime === 'Back' ? 'bg-primary/10' : ''}
                onClick={() => setSelectedTime('Back')}
              >
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={selectedTime === 'Selso Plan' ? 'bg-primary/10' : ''}
                onClick={() => setSelectedTime('Selso Plan')}
              >
                Selso Plan
              </Button>
            </div>
            <Link href="/bookings/subscription" className="text-primary flex items-center text-sm">
              <span>Subscription</span>
              <Icons.ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Fixed Bottom Button */}
        <div className="fixed bottom-16 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <Button className="h-12 w-full rounded-md">Confirm Booking</Button>
        </div>
      </div>
    </MobileLayout>
