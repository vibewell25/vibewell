import { Icons } from '@/components/icons';
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Same links as in the sidebar
const businessHubLinks = [
  {
    title: 'Overview',
    href: '/business-hub',
    icon: <Icons.BriefcaseIcon className="w-5 h-5" />
  },
  {
    title: 'Marketing',
    href: '/business-hub/marketing',
    icon: <Icons.MegaphoneIcon className="w-5 h-5" />
  },
  {
    title: 'Client Acquisition',
    href: '/business-hub/client-acquisition',
    icon: <Icons.UsersIcon className="w-5 h-5" />
  },
  {
    title: 'Financial Management',
    href: '/business-hub/financial-management',
    icon: <Icons.CurrencyDollarIcon className="w-5 h-5" />
  },
  {
    title: 'Staff Management',
    href: '/business-hub/staff-management',
    icon: <Icons.UserGroupIcon className="w-5 h-5" />
  },
  {
    title: 'Scheduling Optimization',
    href: '/business-hub/scheduling-optimization',
    icon: <Icons.CalendarIcon className="w-5 h-5" />
  }
];
export function BusinessHubMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Business Hub</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-muted"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isOpen ? (
            <Icons.XMarkIcon className="w-6 h-6" />
          ) : (
            <Icons.Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>
      {isOpen && (
        <div className="border-b border-border">
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
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      <span>{link.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
} 