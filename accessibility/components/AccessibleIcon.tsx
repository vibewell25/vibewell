import React from 'react';

interface AccessibleIconProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  decorative?: boolean;
export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  label,
  children,
  className = '',
  as: Component = 'span',
  decorative = false
) => {
  return (
    <Component
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative}
      className={className}
    >
      {children}
    </Component>
export default AccessibleIcon;
