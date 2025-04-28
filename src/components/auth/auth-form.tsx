'use client';;
import { ReactNode } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export interface AuthFormProps {
  type: 'login' | 'signup' | 'forgotPassword' | 'resetPassword';
  title: string;
  subtitle?: string;
  children: ReactNode;
  error?: string | null;
  isLoading?: boolean;
  isSuccessful?: boolean;
  successContent?: ReactNode;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

/**
 * StandardAuthForm component
 * Provides a consistent layout and styling for all authentication forms
 */
export function AuthForm({
  type,
  title,
  subtitle,
  children,
  error,
  isLoading = false,
  isSuccessful = false,
  successContent,
  footerText,
  footerLink,
}: AuthFormProps) {
  if (isSuccessful && successContent) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="mb-8 flex flex-col items-center">
          <Icons.logo className="text-primary mb-4 h-12 w-12" />
          {successContent}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <Icons.logo className="text-primary mb-4 h-12 w-12" />
        <h1 className="mb-2 text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-center text-muted-foreground">{subtitle}</p>}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/20 p-3 text-destructive">{error}</div>
      )}

      {children}

      {footerText && footerLink && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{' '}
          <Link href={footerLink.href} className="text-primary hover:underline">
            {footerLink.text}
          </Link>
        </p>
      )}
    </div>
  );
}

/**
 * AuthFormInput component
 * Standardized input for auth forms
 */
export function AuthFormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  minLength,
  helpText,
  rightElement,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  helpText?: string;
  rightElement?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {rightElement}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="w-full rounded-md border p-2"
        disabled={disabled}
      />
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}

/**
 * AuthSubmitButton component
 * Standardized submit button for auth forms
 */
export function AuthSubmitButton({
  isLoading = false,
  loadingText,
  text,
  disabled = false,
}: {
  isLoading?: boolean;
  loadingText?: string;
  text: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-2 font-medium transition-colors disabled:opacity-50"
      disabled={isLoading || disabled}
    >
      {isLoading ? loadingText || 'Loading...' : text}
    </button>
  );
}
