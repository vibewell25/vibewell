'use client';;
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  CalendarClock,
  BarChart3,
  Database,
  Settings,
} from 'lucide-react';

// Define sidebar navigation items
const navItems = [
  { title: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { title: 'Products', href: '/admin/products', icon: <ShoppingBag className="h-5 w-5" /> },
  { title: 'Messages', href: '/admin/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { title: 'Bookings', href: '/admin/bookings', icon: <CalendarClock className="h-5 w-5" /> },
  { title: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'Backups', href: '/admin/backups', icon: <Database className="h-5 w-5" /> },
  { title: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

// AdminSidebar component with navigation
export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Sidebar header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-4 py-3 text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
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
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
            <Users className="h-5 w-5 text-gray-500" />
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
