import React from 'react';
import { useKeyboardInteraction } from './accessibility-utils';

export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
const variantStyles = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  secondary:
    'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  description,
  className = '',
  disabled,
  ...props
: AccessibleButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useKeyboardInteraction(
    () => {
      if (buttonRef.current && !disabled && !isLoading) {
        buttonRef.current.click();
undefined,
    () => {
      if (buttonRef.current && !disabled && !isLoading) {
        buttonRef.current.click();
return (
    <button
      ref={buttonRef}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className} `}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-describedby={description ? 'button-description' : undefined}
      {...props}
    >
      {isLoading ? (
        <span className="sr-only">Loading...</span>
      ) : (
        <>
          {leftIcon && (
            <span className="mr-2" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span className="ml-2" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}

      {description && (
        <span id="button-description" className="sr-only">
          {description}
        </span>
      )}
    </button>
// Example usage:
/*
<AccessibleButton
  variant="primary"
  size="md"
  onClick={() => console.log('Clicked!')}
  description="Submit the form"
  leftIcon={<PlusIcon className="h-4 w-4" />}
>
  Add Item
</AccessibleButton>

<AccessibleButton
  variant="danger"
  size="sm"
  isLoading={true}
  disabled={true}
>
  Delete
</AccessibleButton>
*/
