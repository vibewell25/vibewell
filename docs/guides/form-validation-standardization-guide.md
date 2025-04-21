# Form Validation Standardization Guide

## Overview

This guide outlines the standardization process for form validation in the Vibewell platform. The codebase currently contains multiple form validation implementations, which has led to inconsistencies, code duplication, and maintenance challenges. This guide aims to establish a clear standard and migration path to a unified form validation approach using Zod.

## Table of Contents

1. [Current State](#current-state)
2. [Standardization Goals](#standardization-goals)
3. [Zod-based Validation](#zod-based-validation)
4. [Migration Path](#migration-path)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Testing Validation](#testing-validation)
7. [Common Patterns](#common-patterns)

## Current State

The Vibewell codebase currently contains several form validation implementations:

1. **Legacy custom validation**:
   - In-component validation logic
   - Regular expression-based validation in utility files
   - Custom validation functions

2. **Non-standardized Zod usage**:
   - Some components using Zod directly
   - Various patterns for defining and using schemas

3. **Centralized utility**:
   - `src/utils/form-validation.ts` - Current utility without Zod integration

This fragmentation leads to:
- Inconsistent validation behavior across forms
- Duplicated validation logic
- Higher maintenance burden
- Varied error message formats
- Difficulties with testing validation

## Standardization Goals

1. **Single Validation Library**: Standardize on Zod for all form validation
2. **Centralized Utilities**: Provide helpers to simplify common validation tasks
3. **Type Safety**: Leverage TypeScript for better schema typing
4. **Reusable Schemas**: Create common schemas for frequently validated fields
5. **Consistent Error Format**: Standardize error message structure
6. **Accessibility**: Ensure validation follows accessibility best practices

## Zod-based Validation

### The New Utility

The standardized validation utility is implemented in:

```
src/utils/form-validation-zod.ts
```

This will replace the current `form-validation.ts` after migration is complete.

### Key Features

1. **Schema-based validation**: Define validation rules using Zod schemas
2. **Common schema collection**: Pre-defined schemas for typical fields
3. **Consistent error formats**: Standard error message structure
4. **Field-level validation**: Validate individual fields
5. **Form-level validation**: Validate entire forms
6. **Helper functions**: Utilities for common validation patterns

### Basic Usage

```typescript
import { z } from 'zod';
import { validateForm, CommonSchemas } from '@/utils/form-validation-zod';

// Define a schema for your form
const loginSchema = z.object({
  email: CommonSchemas.email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Type inference for your form data
type LoginFormData = z.infer<typeof loginSchema>;

// Validate the form
function handleSubmit(formData: LoginFormData) {
  const { isValid, errors } = validateForm(formData, loginSchema);
  
  if (isValid) {
    // Process form submission
  } else {
    // Handle validation errors
    setErrors(errors);
  }
}
```

## Migration Path

### For Developers

1. **Identify Forms**: Find all forms in your components
2. **Define Schemas**: Create appropriate Zod schemas
3. **Update Validation**: Replace existing validation with the new approach
4. **Test**: Verify form behavior after migration

### Migration Steps

1. **Install Required Dependencies** (if not already present):

```bash
npm install zod @hookform/resolvers
```

2. **Create a Schema**:

```typescript
// From unstructured validation:
const errors = {};
if (!email) errors.email = 'Email is required';
if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email format';

// To Zod schema:
import { z } from 'zod';
import { CommonSchemas } from '@/utils/form-validation-zod';

const formSchema = z.object({
  email: CommonSchemas.email, // Uses pre-defined email schema
  // Other fields...
});

type FormData = z.infer<typeof formSchema>;
```

3. **Update Form Validation**:

```typescript
// From custom validation:
const validateForm = () => {
  const errors = {};
  // Custom validation logic
  return errors;
};

// To standardized validation:
import { validateForm } from '@/utils/form-validation-zod';

const validate = (data: FormData) => {
  const { isValid, errors } = validateForm(data, formSchema);
  return { isValid, errors };
};
```

4. **For React Hook Form Users**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// In your component:
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: '',
    // Other default values
  },
});
```

## Implementation Guidelines

### Creating Schemas

1. **Use the Common Schemas When Possible**:

```typescript
import { z } from 'zod';
import { CommonSchemas } from '@/utils/form-validation-zod';

const userSchema = z.object({
  name: CommonSchemas.name,
  email: CommonSchemas.email,
  phone: CommonSchemas.phone,
  // Custom fields...
  customField: z.string().min(5, 'Must be at least 5 characters'),
});
```

2. **For Password Confirmation**:

```typescript
import { createPasswordConfirmationSchema } from '@/utils/form-validation-zod';

// Use the helper function
const passwordFields = createPasswordConfirmationSchema();

// Combine with other fields
const signupSchema = z.object({
  email: CommonSchemas.email,
  name: CommonSchemas.name,
  // Add the password fields
  ...passwordFields.shape,
});
```

3. **Conditional Validation**:

```typescript
import { applyIf } from '@/utils/form-validation-zod';

const shippingSchema = z.object({
  useShippingAddress: z.boolean(),
  shippingAddress: z.string()
    .refine(
      applyIf<{ useShippingAddress: boolean }>(
        data => data.useShippingAddress === true,
        z.string().min(5, 'Shipping address is required when enabled')
      ),
      { message: 'Shipping address is required when enabled' }
    ),
});
```

### Form Components

Standardized approach with React Hook Form (recommended):

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CommonSchemas } from '@/utils/form-validation-zod';

// Define schema
const contactSchema = z.object({
  name: CommonSchemas.name,
  email: CommonSchemas.email,
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });
  
  const onSubmit = async (data: ContactFormData) => {
    try {
      // Process form submission
      await submitContactForm(data);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="error-message" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      
      {/* Similar pattern for other fields */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Without React Hook Form

Using controlled components with manual validation:

```tsx
import { useState } from 'react';
import { z } from 'zod';
import { validateForm, CommonSchemas } from '@/utils/form-validation-zod';

// Define schema
const loginSchema = z.object({
  email: CommonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const { isValid, errors: validationErrors } = validateForm(formData, loginSchema);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit form data
      await submitLogin(formData);
    } catch (error) {
      setErrors({ form: 'Login failed. Please check your credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Form fields */}
    </form>
  );
}
```

## Testing Validation

### Testing Schemas

```typescript
// __tests__/schemas/user-schema.test.ts
import { userSchema } from '@/schemas/user-schema';

describe('User schema validation', () => {
  test('validates correct data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
    };
    
    const result = userSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  test('rejects invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
    };
    
    const result = userSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.issues.some(issue => 
        issue.path.includes('email')
      )).toBe(true);
    }
  });
});
```

### Testing Forms with React Testing Library

```typescript
// __tests__/components/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/auth/login-form';

describe('LoginForm', () => {
  test('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    // Submit the form without filling fields
    fireEvent.click(screen.getByRole('button', { name: /submit|login|sign in/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
  
  test('shows specific error for invalid email', async () => {
    render(<LoginForm />);
    
    // Type invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    
    // Fill password (to isolate email validation error)
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit|login|sign in/i }));
    
    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });
  });
});
```

## Common Patterns

### Login Form Schema

```typescript
import { z } from 'zod';
import { CommonSchemas } from '@/utils/form-validation-zod';

const loginSchema = z.object({
  email: CommonSchemas.email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});
```

### Registration Form Schema

```typescript
import { z } from 'zod';
import { CommonSchemas, createPasswordConfirmationSchema } from '@/utils/form-validation-zod';

const passwordFields = createPasswordConfirmationSchema();

const registrationSchema = z.object({
  name: CommonSchemas.name,
  email: CommonSchemas.email,
  ...passwordFields.shape,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});
```

### Profile Form Schema

```typescript
import { z } from 'zod';
import { CommonSchemas } from '@/utils/form-validation-zod';

const profileSchema = z.object({
  name: CommonSchemas.name,
  email: CommonSchemas.email,
  phone: CommonSchemas.phone,
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
  website: CommonSchemas.url,
  preferences: z.object({
    receiveEmails: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['en', 'fr', 'es', 'de']).default('en'),
  }).optional(),
});
```

### Address Form Schema

```typescript
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  country: z.string().min(2, 'Country is required'),
});
```

## Conclusion

Standardizing form validation with Zod provides a more robust, type-safe and consistent approach across the Vibewell platform. By following these guidelines, all forms will have consistent validation behavior, error messages, and accessibility features.

## Related Documents

- [Form Validation Guide](./form-validation-guide.md) - Comprehensive guide on validation patterns
- [Accessibility Guide](../accessibility/accessibility-guide.md) - Accessibility best practices
- [Implementation Guide](./implementation-guide.md) - General implementation standards 

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; 