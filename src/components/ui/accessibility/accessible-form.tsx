'use client';

import React from 'react';
import { ErrorMessage, LoadingState } from './accessibility-utils';

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
}

export interface AccessibleFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  children: React.ReactNode;
  error?: string;
  success?: string;
}

export function FormField({
  id,
  label,
  error,
  required,
  children,
  description
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500 mb-1" id={`${id}-description`}>
          {description}
        </p>
      )}
      
      <div
        aria-describedby={
          [
            description ? `${id}-description` : undefined,
            error ? `${id}-error` : undefined
          ]
            .filter(Boolean)
            .join(' ')
        }
        aria-invalid={!!error}
        aria-required={required}
      >
        {children}
      </div>
      
      <ErrorMessage id={id} error={error} />
    </div>
  );
}

export function AccessibleForm({
  onSubmit,
  isLoading = false,
  children,
  error,
  success
}: AccessibleFormProps) {
  return (
    <LoadingState isLoading={isLoading}>
      <form
        onSubmit={onSubmit}
        noValidate
        aria-busy={isLoading}
        aria-live="polite"
      >
        {error && (
          <div
            role="alert"
            className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded"
          >
            {error}
          </div>
        )}
        
        {success && (
          <div
            role="status"
            className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded"
          >
            {success}
          </div>
        )}
        
        {children}
      </form>
    </LoadingState>
  );
}

// Example usage:
/*
<AccessibleForm
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
  error={formError}
  success={formSuccess}
>
  <FormField
    id="name"
    label="Full Name"
    required
    error={nameError}
    description="Please enter your full name as it appears on your ID"
  >
    <input
      type="text"
      id="name"
      className="w-full px-3 py-2 border rounded-md"
      aria-describedby="name-description"
    />
  </FormField>
  
  <FormField
    id="email"
    label="Email Address"
    required
    error={emailError}
  >
    <input
      type="email"
      id="email"
      className="w-full px-3 py-2 border rounded-md"
    />
  </FormField>
  
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</AccessibleForm>
*/ 