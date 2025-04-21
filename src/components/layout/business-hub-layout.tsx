'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  TrendingUp,
  FileText,
  PieChart,
} from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    href: '/business-hub',
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    title: 'Calendar',
    href: '/business-hub/calendar',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: 'Clients',
    href: '/business-hub/clients',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Messages',
    href: '/business-hub/messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/business-hub/analytics',
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    title: 'Client Acquisition',
    href: '/business-hub/client-acquisition',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: 'Reports',
    href: '/business-hub/reports',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/business-hub/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface BusinessHubLayoutProps {
  children: React.ReactNode;
}

export function BusinessHubLayout({ children }: BusinessHubLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight">Business Hub</h2>
          </div>
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
              <div>
                <p className="text-sm font-medium">Business Profile</p>
                <p className="text-xs text-muted-foreground">business@vibewell.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center border-b py-3 px-4">
        <button type="button" className="mr-3 text-gray-500">
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className="text-lg font-medium">Business Hub</h2>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BusinessHubLayout;
