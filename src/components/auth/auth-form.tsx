'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { ROUTES } from '@/constants/routes';

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
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <Icons.logo className="h-12 w-12 mb-4 text-primary" />
          {successContent}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <Icons.logo className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-center">{subtitle}</p>}
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4">{error}</div>
      )}

      {children}

      {footerText && footerLink && (
        <p className="text-center mt-6 text-sm text-muted-foreground">
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
        className="w-full p-2 border rounded-md"
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
      className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      disabled={isLoading || disabled}
    >
      {isLoading ? loadingText || 'Loading...' : text}
    </button>
  );
}
