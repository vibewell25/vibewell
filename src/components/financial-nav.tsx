'use client';

import { Icons } from '@/components/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}
const navItems: NavItem[] = [
  {
    name: 'Overview',
    href: '/business-hub/financial-management',
    icon: <Icons.ChartBarIcon className="h-5 w-5" />,
  },
  {
    name: 'Budgeting',
    href: '/business-hub/financial-management/budgeting',
    icon: <Icons.ClipboardDocumentCheckIcon className="h-5 w-5" />,
  },
  {
    name: 'Pricing',
    href: '/business-hub/financial-management/pricing',
    icon: <Icons.CalculatorIcon className="h-5 w-5" />,
  },
  {
    name: 'Tax',
    href: '/business-hub/financial-management/tax',
    icon: <Icons.DocumentTextIcon className="h-5 w-5" />,
  },
  {
    name: 'Cash Flow',
    href: '/business-hub/financial-management/cash-flow',
    icon: <Icons.ArrowTrendingUpIcon className="h-5 w-5" />,
  },
  {
    name: 'Resources',
    href: '/business-hub/financial-management/resources',
    icon: <Icons.DocumentTextIcon className="h-5 w-5" />,
  },
];
export function FinancialNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  // Effect to track window size
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);
    // Function to update window width
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Check if path is active
  const isActive = (path: string) => {
    if (
      path === '/business-hub/financial-management' &&
      pathname === '/business-hub/financial-management'
    ) {
      return true;
    }
    if (path !== '/business-hub/financial-management' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  // Find the currently active item
  const activeItem = navItems.find(item => isActive(item.href));
  // Toggle the dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  // Determine if we should show mobile or desktop navigation
  const isMobile = windowWidth < 768; // 768px is typical md breakpoint
  return (
    <div className="bg-white shadow-sm rounded-md mb-6 overflow-hidden">
      {/* Mobile View */}
      {isMobile && (
        <>
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            onClick={toggleDropdown}
            aria-expanded={isOpen}
            aria-controls="financial-nav-dropdown"
          >
            <div className="flex items-center">
              {activeItem ? (
                <>
                  <span className="mr-2">{activeItem.icon}</span>
                  <span className="font-medium">{activeItem.name}</span>
                </>
              ) : (
                <span className="font-medium">Financial Management</span>
              )}
            </div>
            <Icons.ChevronDownIcon
              className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </button>
          {/* Dropdown menu */}
          {isOpen && (
            <div id="financial-nav-dropdown" className="border-t border-gray-200 py-2">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 ${
                    isActive(item.href)
                      ? 'bg-green-100 text-green-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
      {/* Desktop View */}
      {!isMobile && (
        <nav className="flex flex-wrap gap-1 p-1">
          {navItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                isActive(item.href)
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
