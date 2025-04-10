'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  className?: string;
  targetId: string;
  children?: React.ReactNode;
}

export default function SkipLink({ 
  className, 
  targetId, 
  children = 'Skip to main content' 
}: SkipLinkProps) {
  return (
    <a 
      href={`#${targetId}`}
      className={cn(
        'absolute left-2 top-2 z-50 -translate-y-full transform rounded bg-primary px-4 py-2 text-white transition focus:translate-y-0',
        className
      )}
    >
      {children}
    </a>
  );
}
