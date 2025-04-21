import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = '',
}) => {
  const gridClasses = `
    grid
    ${columns.sm ? `grid-cols-${columns.sm}` : ''}
    ${columns.md ? `md:grid-cols-${columns.md}` : ''}
    ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''}
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}
    gap-${gap}
    ${className}
  `;

  return <div className={gridClasses}>{children}</div>;
};
