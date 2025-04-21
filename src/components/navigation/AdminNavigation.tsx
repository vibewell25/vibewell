'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Users, Settings, Server, Bell, AlertCircle, Shield } from 'lucide-react';

interface AdminNavigationProps {
  className?: string;
}

export function AdminNavigation({ className = '' }: AdminNavigationProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkRole = async () => {
      try {
        const response = await fetch('/api/users/currentRole');
        const data = await response.json();
        setIsAdmin(data.role === 'admin');
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkRole();
  }, []);

  if (!isAdmin) return null;

  const navigationItems = [
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: 'User Management',
      href: '/dashboard/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Performance',
      href: '/dashboard/performance',
      icon: <Server className="h-5 w-5" />,
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: 'System Alerts',
      href: '/dashboard/alerts',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <nav className={`${className} p-4`}>
      <div className="flex items-center mb-6">
        <Shield className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>

      <ul className="space-y-2">
        {navigationItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
