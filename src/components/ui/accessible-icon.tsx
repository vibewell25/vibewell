import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleIconProps {
  className?: string;
  icon: React.ReactNode;
  label: string;
  labelPosition?: 'before' | 'after' | 'hidden';
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>) => void;
}

/**
 * AccessibleIcon - Makes icons accessible by providing proper
 * aria labels and roles for screen readers.
 */
export function AccessibleIcon({
  className,
  icon,
  label,
  labelPosition = 'hidden',
  onClick,
}: AccessibleIconProps) {
  // If it's a clickable icon, render as a button
  if (onClick) {
    return (
      <button
        className={cn('inline-flex items-center', className)}
        onClick={onClick}
        aria-label={labelPosition === 'hidden' ? label : undefined}
        type="button"
      >
        {labelPosition === 'before' && <span className="mr-2">{label}</span>}
        <span aria-hidden={labelPosition !== 'hidden'}>{icon}</span>
        {labelPosition === 'after' && <span className="ml-2">{label}</span>}
      </button>
    );
  }

  // If it's just a visual icon with an accessible label
  return (
    <span 
      className={cn('inline-flex items-center', className)}
    >
      {labelPosition === 'before' && <span className="mr-2">{label}</span>}
      <span
        aria-hidden={labelPosition !== 'hidden'}
        role={labelPosition === 'hidden' ? 'img' : undefined}
        aria-label={labelPosition === 'hidden' ? label : undefined}
      >
        {icon}
      </span>
      {labelPosition === 'after' && <span className="ml-2">{label}</span>}
    </span>
  );
} 