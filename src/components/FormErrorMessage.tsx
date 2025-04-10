import React from 'react';
import { cn } from '@/lib/utils';

interface FormErrorMessageProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ 
  id, 
  children,
  className
}) => {
  if (!children) return null;
  
  return (
    <div 
      id={id}
      role="alert"
      className={cn("text-sm text-red-500 mt-1", className)}
    >
      {children}
    </div>
  );
};

export default FormErrorMessage;
