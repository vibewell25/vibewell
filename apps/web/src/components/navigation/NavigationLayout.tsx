import React, { useState, useEffect } from 'react';
import { MainNavigation } from './MainNavigation';
import { AuthNavigation } from './AuthNavigation';
import { AdminNavigation } from './AdminNavigation';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { Button } from '../ui/Button';
import { ArrowUp } from 'lucide-react';
import Link from 'next/link';

interface NavigationLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    unreadNotifications?: number;
onLogout: () => void;
  breadcrumbItems?: Array<{ label: string; href: string }>;
export {};
