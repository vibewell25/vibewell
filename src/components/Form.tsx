import React, { useState } from 'react';
import { Button } from './ui/button';
import { useCsrfToken } from '../utils/csrf';

interface FormProps {
  onSuccess?: (data: any) => void;
}

/**
 * A form component with built-in validation and CSRF protection
 * 
 * @component
 * @example
 * ```tsx
 * <Form onSuccess={(data) => console.log(data)} />
 * ```
 */
export function Form({ onSuccess }: FormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, addTokenToHeaders } = useCsrfToken();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: addTokenToHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (onSuccess) {
          onSuccess(data);
        }
        setEmail('');
        setPassword('');
      } else {
        setErrors({ form: data.message || 'Form submission failed' });
      }
    } catch (error) {
      setErrors({ form: 'An error occurred during submission' });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hidden CSRF token input */}
      <input type="hidden" name="csrf_token" value={token || ''} />
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" className="text-red-500 text-sm" role="alert">
            {errors.email}
          </span>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <span id="password-error" className="text-red-500 text-sm" role="alert">
            {errors.password}
          </span>
        )}
      </div>
      
      {errors.form && (
        <div className="text-red-500 text-sm" role="alert">{errors.form}</div>
      )}
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
} 