import React from 'react';

interface FormErrorMessageProps {
  id: string;
  children: React.ReactNode;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ id, children }) => {
  if (!children) return null;

  return (
    <div id={id} role="alert" className="text-sm text-error mt-1">
      {children}
    </div>
  );
};

export default FormErrorMessage;
