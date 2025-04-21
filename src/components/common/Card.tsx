import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
      {title && (
        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">{footer}</div>
      )}
    </div>
  );
};
