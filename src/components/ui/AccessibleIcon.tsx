import React from 'react';

/**
 * Props for the AccessibleIcon component
 */
interface AccessibleIconProps {
  /**
   * The icon element to be wrapped
   */
  children: React.ReactNode;
  
  /**
   * Accessible label that describes the icon's purpose
   */
  label: string;
}

/**
 * AccessibleIcon component
 * 
 * Wraps icon elements to provide proper accessibility by:
 * 1. Adding aria-hidden to the icon itself (preventing screen readers from trying to read it)
 * 2. Adding a visually hidden label for screen readers
 * 
 * @example
 * ```tsx
 * <AccessibleIcon label="Close dialog">
 *   <XIcon />
 * </AccessibleIcon>
 * ```
 */
export function AccessibleIcon({ children, label }: AccessibleIconProps) {
  return (
    <span className="inline-flex items-center justify-center">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          'aria-hidden': 'true',
          focusable: 'false', // For SVG icons in some screen readers
        });
      })}
      <span 
        className="sr-only"
        aria-live="polite"
      >
        {label}
      </span>
    </span>
  );
}

export default AccessibleIcon; 