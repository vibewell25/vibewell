'use client';

import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Mock data for the profile
const profile = {
  id: 'john-doe',
  name: 'John Doe',
  title: 'Makeup Artist',
  avatar: 'https://placehold.co/200x200?text=JD',
};

// Mock data for menu options
const menuOptions = [
  {
    id: 'profile',
    name: 'Profile Management',
    href: '/profile/edit',
  },
  {
    id: 'theme',
    name: 'Theme & Appearance',
    href: '/profile/settings/theme',
  },
  {
    id: 'service',
    name: 'Service Management',
    href: '/profile/services',
  },
  {
    id: 'training',
    name: 'Training Programs',
    href: '/profile/training',
  },
  {
    id: 'bookings',
    name: 'Bookings & Payments',
    href: '/profile/bookings',
  },
  {
    id: 'products',
    name: 'Product Selling',
    href: '/profile/products',
  },
  {
    id: 'reviews',
    name: 'Review & Ratings',
    href: '/profile/reviews',
  },
];

export default function MobileProfilePage() {
  return (
    <MobileLayout>
      <div className="bg-gray-50 min-h-screen pb-16">
        {/* Header with Back Button */}
        <div className="bg-white px-5 py-4 flex items-center border-b border-gray-200">
          <Link href="/mobile-dashboard" className="mr-4">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center py-8 bg-white mb-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-500">{profile.title}</p>
        </div>

        {/* Menu Options */}
        <div className="bg-white px-5 py-2">
          {menuOptions.map((option, index) => (
            <Link 
              key={option.id} 
              href={option.href}
              className={`flex items-center justify-between py-4 ${
                index !== menuOptions.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <span className="text-base">{option.name}</span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-5 mt-8">
          <Button variant="outline" className="w-full border-red-300 text-red-500 hover:bg-red-50">
            Log out
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
} 