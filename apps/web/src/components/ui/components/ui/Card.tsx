import React from 'react';
/**
 * @deprecated This component is deprecated. Use the standardized Card component from '@/components/ui/Card' instead.
 * This is maintained for backwards compatibility only.
 */



interface CardProps {
  children: React.ReactNode;
  className?: string;
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
export default Card;
