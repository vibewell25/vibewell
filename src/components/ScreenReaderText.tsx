import React from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderTextProps {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

export default function ScreenReaderText({ 
  className, 
  children, 
  as: Component = 'span' 
}: ScreenReaderTextProps) {
  return (
    <Component className={cn('sr-only', className)}>
      {children}
    </Component>
  );
}
