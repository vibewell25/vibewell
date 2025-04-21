'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  children,
  ...props
}: PaginationProps) {
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PaginationContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

export function PaginationItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props} />
  );
}

export function PaginationLink({
  className,
  isActive,
  ...props
}: React.ComponentProps<'button'> & {
  isActive?: boolean;
}) {
  return (
    <button
      className={cn(
        'h-8 w-8 rounded-md border border-input flex items-center justify-center text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-background hover:bg-muted hover:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('h-8 px-2 rounded-md border border-input flex items-center justify-center text-sm transition-colors bg-background hover:bg-muted hover:text-accent-foreground', className)}
      {...props}
    >
      <span className="sr-only">Previous page</span>
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
        className="h-4 w-4"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}

export function PaginationNext({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('h-8 px-2 rounded-md border border-input flex items-center justify-center text-sm transition-colors bg-background hover:bg-muted hover:text-accent-foreground', className)}
      {...props}
    >
      <span className="sr-only">Next page</span>
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
        className="h-4 w-4"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('flex h-8 w-8 items-center justify-center', className)}
      {...props}
    >
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
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
      <span className="sr-only">More pages</span>
    </span>
  );
}
