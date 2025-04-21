import React from 'react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <p className={`mt-2 text-sm text-red-600 ${className}`} role="alert">
      {message}
    </p>
  );
};
