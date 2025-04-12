'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingBag, MessageSquare, CalendarClock, BarChart3, Database, Settings } from 'lucide-react';

// Define sidebar navigation items
const navItems = [
  { title: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { title: 'Products', href: '/admin/products', icon: <ShoppingBag className="w-5 h-5" /> },
  { title: 'Messages', href: '/admin/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { title: 'Bookings', href: '/admin/bookings', icon: <CalendarClock className="w-5 h-5" /> },
  { title: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { title: 'Backups', href: '/admin/backups', icon: <Database className="w-5 h-5" /> },
  { title: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

// AdminSidebar component with navigation
export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Sidebar header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@vibewell.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export as default for flexibility
export default Sidebar; 