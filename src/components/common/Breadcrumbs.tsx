import { Icons } from '@/components/icons';
import React from 'react';
import Link from 'next/link';
interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index > 0 && (
              <Icons.ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={`ml-2 text-sm font-medium ${
                  index === items.length - 1
                    ? 'text-gray-500'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`ml-2 text-sm font-medium ${
                  index === items.length - 1
                    ? 'text-gray-500'
                    : 'text-gray-700'
                }`}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}; 