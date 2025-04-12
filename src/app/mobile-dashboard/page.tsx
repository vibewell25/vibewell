'use client';

import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRightIcon, UserIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ThemeSelector } from '@/components/theme-selector';
import Link from 'next/link';

interface User {
  name: string;
  bookingsThisWeek: number;
  earnings: string;
  role: string;
  businessType: string;
}

export default function MobileDashboardPage() {
  const [user, setUser] = useState<User>({
    name: 'Maria',
    bookingsThisWeek: 4,
    earnings: '€900',
    role: 'Admin',
    businessType: 'Web-Based Panel'
  });

  return (
    <MobileLayout>
      <div className="px-5 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">He Kōrero Yourservii</p>
            <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
          </div>
          <div className="flex space-x-2 items-center">
            {/* Theme selector */}
            <ThemeSelector showColorThemes />
            
            {/* Notifications */}
            <div className="relative">
              <Link href="/notifications">
                <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </Link>
            </div>
            
            {/* Settings */}
            <Link href="/profile/settings">
              <Cog6ToothIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </Link>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Booking Overview</h2>
              <Link href="/bookings" className="flex items-center text-primary text-sm">
                <span>View</span>
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <span className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bookings this week</p>
                <p className="text-xl font-bold">{user.earnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                <p className="text-base font-medium">{user.businessType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Clients</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notification</p>
          </div>

          <div className="space-y-4">
            {/* This would be a list of clients or notifications */}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
} 