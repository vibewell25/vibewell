'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  BriefcaseIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const businessHubLinks = [
  {
    title: 'Overview',
    href: '/business-hub',
    icon: <BriefcaseIcon className="w-5 h-5" />
  },
  {
    title: 'Marketing',
    href: '/business-hub/marketing',
    icon: <MegaphoneIcon className="w-5 h-5" />
  },
  {
    title: 'Client Acquisition',
    href: '/business-hub/client-acquisition',
    icon: <UsersIcon className="w-5 h-5" />
  },
  {
    title: 'Financial Management',
    href: '/business-hub/financial-management',
    icon: <CurrencyDollarIcon className="w-5 h-5" />
  },
  {
    title: 'Staff Management',
    href: '/business-hub/staff-management',
    icon: <UserGroupIcon className="w-5 h-5" />
  },
  {
    title: 'Scheduling Optimization',
    href: '/business-hub/scheduling-optimization',
    icon: <CalendarIcon className="w-5 h-5" />
  }
];

export function BusinessHubSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-card border-r border-border h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className={`font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>Business Hub</h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-muted"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          {businessHubLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center rounded-md px-3 py-2 hover:bg-muted transition-colors ${
                    isActive ? 'bg-muted text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {!isCollapsed && <span>{link.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`mt-auto p-4 border-t border-border ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="bg-primary/10 p-3 rounded-md">
          <h3 className="font-medium text-sm mb-2">Need help?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Get personalized guidance for your business growth strategy.
          </p>
          <Link
            href="/business-hub/consultation"
            className="text-xs text-primary hover:underline inline-flex items-center"
          >
            Book a consultation
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 