import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 px-2',
        lg: 'h-12 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
  success?: string;
}

/**
 * Input component for form controls
 * @param {InputProps} props - The input props
 * @returns {React.ReactElement} The Input component
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, error, success, ...props }, ref) => {
    // Determine variant based on error/success state
    const inputVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={inputVariants({ variant: inputVariant, size, className })}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {!error && success && <p className="text-success mt-1 text-sm">{success}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input, inputVariants };
