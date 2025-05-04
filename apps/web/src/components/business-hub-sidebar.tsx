'use client';

import { Icons } from '@/components/icons';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const businessHubLinks = [
  {
    title: 'Overview',
    href: '/business-hub',
    icon: <Icons.BriefcaseIcon className="h-5 w-5" />,
  },
  {
    title: 'Marketing',
    href: '/business-hub/marketing',
    icon: <Icons.MegaphoneIcon className="h-5 w-5" />,
  },
  {
    title: 'Client Acquisition',
    href: '/business-hub/client-acquisition',
    icon: <Icons.UsersIcon className="h-5 w-5" />,
  },
  {
    title: 'Financial Management',
    href: '/business-hub/financial-management',
    icon: <Icons.CurrencyDollarIcon className="h-5 w-5" />,
  },
  {
    title: 'Staff Management',
    href: '/business-hub/staff-management',
    icon: <Icons.UserGroupIcon className="h-5 w-5" />,
  },
  {
    title: 'Scheduling Optimization',
    href: '/business-hub/scheduling-optimization',
    icon: <Icons.CalendarIcon className="h-5 w-5" />,
  },
];

export function BusinessHubSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div
      className={`h-full border-r border-border bg-card transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className={`font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>Business Hub</h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-1 hover:bg-muted"
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
                  className={`flex items-center rounded-md px-3 py-2 transition-colors hover:bg-muted ${
                    isActive ? 'text-primary bg-muted font-medium' : 'text-muted-foreground'
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
      <div className={`mt-auto border-t border-border p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="bg-primary/10 rounded-md p-3">
          <h3 className="mb-2 text-sm font-medium">Need help?</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Get personalized guidance for your business growth strategy.
          </p>
          <Link
            href="/business-hub/consultation"
            className="text-primary inline-flex items-center text-xs hover:underline"
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
