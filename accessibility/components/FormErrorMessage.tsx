import React from 'react';

interface FormErrorMessageProps {
  id: string;
  error?: string;
  className?: string;
export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  id,
  error,
  className = ''
) => {
  if (!error) return null;

  return (
    <p
      id={`${id}-error`}
      role="alert"
      aria-live="polite"
      className={`text-sm text-red-500 mt-1 ${className}`}
    >
      {error}
    </p>
export default FormErrorMessage;
