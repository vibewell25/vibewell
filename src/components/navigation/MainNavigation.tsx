import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, Home, Activity, Calendar, Users, FileText, User } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
  { label: 'Wellness', href: '/wellness', icon: <Activity className="h-4 w-4" /> },
  { label: 'Bookings', href: '/bookings', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Community', href: '/community', icon: <Users className="h-4 w-4" /> },
  { label: 'Events', href: '/events', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Resources', href: '/resources', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', href: '/profile', icon: <User className="h-4 w-4" />, requiresAuth: true },
];

export {};
