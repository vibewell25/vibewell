import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleIconProps {
  icon: React.ReactNode;
  label: string;
  labelPosition?: 'before' | 'after' | 'hidden';
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon,
  label,
  labelPosition = 'hidden',
  className,
  onClick,
}) => {
  // If it's a clickable icon, render as a button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn("inline-flex items-center", className)}
        aria-label={labelPosition === 'hidden' ? label : undefined}
      >
        {labelPosition === 'before' && <span className="mr-2">{label}</span>}
        <span aria-hidden={labelPosition !== 'hidden'}>{icon}</span>
        {labelPosition === 'after' && <span className="ml-2">{label}</span>}
      </button>
    );
  }

  // If it's just a visual icon with accessible label
  return (
    <span className={cn("inline-flex items-center", className)}>
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
};

export default AccessibleIcon;
