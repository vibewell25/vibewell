import React from 'react';
/**
 * @deprecated This component is deprecated. Use the standardized Button component from '@/components/ui/Button' instead.
 * This is maintained for backwards compatibility only.
 */



interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
