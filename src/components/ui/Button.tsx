import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  /**
   * Accessible label for screen readers when button only contains an icon
   */
  accessibleLabel?: string;
}

/**
 * Button component with accessibility features
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      accessibleLabel,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = clsx(
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'rounded-md',
      // Handle disabled state
      {
        'opacity-50 cursor-not-allowed': disabled || loading,
        'w-full': fullWidth,
      },
      // Size styles
      {
        'text-xs px-2.5 py-1.5': size === 'xs',
        'text-sm px-3 py-2': size === 'sm',
        'text-base px-4 py-2': size === 'md',
        'text-lg px-5 py-2.5': size === 'lg',
        'text-xl px-6 py-3': size === 'xl',
      },
      // Variant styles
      {
        'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500': variant === 'primary',
        'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-500': variant === 'secondary',
        'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-primary-500': variant === 'outline',
        'bg-transparent hover:bg-gray-100 text-gray-700 focus-visible:ring-primary-500': variant === 'ghost',
        'p-0 underline text-primary-600 hover:text-primary-700 focus-visible:ring-primary-500': variant === 'link',
      },
      className
    );

    // Accessible name for icon-only buttons
    const ariaLabel = !children && icon && accessibleLabel ? accessibleLabel : undefined;
    
    // Loading indicator styles
    const LoadingSpinner = () => (
      <svg 
        className={clsx('animate-spin', { 'mr-2': iconPosition === 'left' && children, 'ml-2': iconPosition === 'right' && children })} 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    );

    const renderContent = () => (
      <>
        {loading && <LoadingSpinner />}
        {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        className={baseStyles}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 