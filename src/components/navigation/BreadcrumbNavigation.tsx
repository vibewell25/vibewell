import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items = [],
  className = '',
}) => {
  const pathname = usePathname() || '/';

  // Generate breadcrumb items from the current path if none provided
  const breadcrumbItems = items.length > 0 ? items : pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + array.slice(0, index + 1).join('/'),
    }));

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={item.href}
            className={`hover:text-foreground ${
              index === breadcrumbItems.length - 1
                ? 'font-medium text-foreground'
                : ''
            }`}
            aria-current={
              index === breadcrumbItems.length - 1 ? 'page' : undefined
            }
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}; 