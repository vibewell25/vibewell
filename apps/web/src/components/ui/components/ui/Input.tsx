import React from 'react';
/**
 * @deprecated This component is deprecated. Use the standardized Input component from '@/components/ui/Input' instead.
 * This is maintained for backwards compatibility only.
 */



interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input
    className={`border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
export default Input;
