import { Icons } from '@/components/icons';
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const clientAcquisitionCategories = [
  { name: 'Overview', href: '/business-hub/client-acquisition', icon: <Icons.UserPlusIcon className="h-5 w-5" /> },
  { name: 'Resources', href: '/business-hub/client-acquisition/resources', icon: <Icons.DocumentTextIcon className="h-5 w-5" /> },
  { name: 'Tools', href: '/business-hub/client-acquisition/tools', icon: <Icons.BeakerIcon className="h-5 w-5" /> },
  { name: 'Strategies', href: '/business-hub/client-acquisition/strategies', icon: <Icons.ArrowTrendingUpIcon className="h-5 w-5" /> },
  { name: 'Webinars', href: '/business-hub/client-acquisition/webinars', icon: <Icons.PresentationChartBarIcon className="h-5 w-5" /> },
  { name: 'Success Stories', href: '/business-hub/client-acquisition/success-stories', icon: <Icons.UsersIcon className="h-5 w-5" /> },
];
export function ClientAcquisitionNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div 
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-lg flex items-center">
          <Icons.UserPlusIcon className="h-5 w-5 mr-2 text-green-600" />
          Client Acquisition
        </h3>
        <button className="text-gray-500 hover:text-gray-700">
          {expanded ? '−' : '+'}
        </button>
      </div>
      {expanded && (
        <nav className="mt-2 space-y-1">
          {clientAcquisitionCategories.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                isActive(item.href)
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3 text-gray-500">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
} 