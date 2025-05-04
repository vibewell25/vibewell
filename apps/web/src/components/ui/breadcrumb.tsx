import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLElement> {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
}

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav className={cn('flex', className)} {...props}>
      <ol className="flex flex-wrap items-center">{children}</ol>
    </nav>
  );
}

export function BreadcrumbItem({
  className,
  href,
  current = false,
  children,
  ...props
}: BreadcrumbItemProps) {
  const BreadcrumbItem = React.useMemo(() => {
    if (current) {
      return (
        <span
          className={cn('text-sm font-medium text-muted-foreground', className)}
          aria-current="page"
          {...props}
        >
          {children}
        </span>
      );
    }

    if (href) {
      return (
        <Link
          href={href}
          className={cn(
            'text-sm font-medium text-foreground hover:text-muted-foreground',
            className,
          )}
          {...props}
        >
          {children}
        </Link>
      );
    }

    return (
      <span className={cn('text-sm font-medium', className)} {...props}>
        {children}
      </span>
    );
  }, [current, href, className, props, children]);

  return <li className="inline-flex items-center">{BreadcrumbItem}</li>;
}

export function BreadcrumbSeparator() {
  return (
    <li className="mx-2 text-muted-foreground">
      <ChevronRight className="h-4 w-4" />
    </li>
  );
}
