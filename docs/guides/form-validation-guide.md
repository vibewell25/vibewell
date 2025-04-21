# Form Validation Guide

## Overview

This guide provides comprehensive standards and implementations for form validation across the Vibewell platform. Consistent validation improves user experience, enhances accessibility, and maintains data integrity.

## Core Principles

1. **Immediate Feedback**: Validate inputs as users type where appropriate
2. **Clear Error Messages**: Provide specific, actionable error messages
3. **Accessible Validation**: Ensure error states are perceivable to all users
4. **Consistent Implementation**: Use a unified approach across all forms

## Validation Library

Vibewell uses [Zod](https://github.com/colinhacks/zod) for schema validation, combined with custom utilities for form handling.

### Basic Schema Example

```typescript
import { z } from 'zod';

// Define validation schema
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

// Type inference
export type UserFormData = z.infer<typeof userSchema>;
```

## Standard Form Implementation

### Using the Validation Utility

```tsx
import React, { useState } from 'react';
import { userSchema, type UserFormData } from '@/schemas/user-schema';
import { validateForm } from '@/utils/form-validation';
import { FormInput } from '@/components/ui/form-input';
import { FormError } from '@/components/ui/form-error';
import { Button } from '@/components/ui/button';

export default function SignUpForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field
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
    
    // Validate the form data against the schema
    const validationResult = validateForm(formData, userSchema);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Form submission logic here
      await submitUserData(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ form: 'An error occurred during submission. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.form && <FormError message={errors.form} />}
      
      <FormInput
        label="Name"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      
      <FormInput
        label="Email"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />
      
      <FormInput
        label="Password"
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
      </Button>
    </form>
  );
}

// Submit function
async function submitUserData(data: UserFormData) {
  // API call implementation
}
```

## Form Validation Utility

The core validation utility is implemented in `src/utils/form-validation.ts`:

```typescript
import { z } from 'zod';

/**
 * Validates form data against a Zod schema and returns validation results
 * 
 * @param data Form data to validate
 * @param schema Zod schema to validate against
 * @returns Validation result object with isValid flag and errors if any
 */
export function validateForm<T>(
  data: T,
  schema: z.ZodType<T>
): { isValid: boolean; errors: Record<string, string> } {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const field = err.path.join('.');
          formattedErrors[field] = err.message;
        }
      });
      
      return { isValid: false, errors: formattedErrors };
    }
    
    // Unexpected error
    return { 
      isValid: false, 
      errors: { form: 'An unexpected validation error occurred.' } 
    };
  }
}

/**
 * Validates a single field against a Zod schema
 * 
 * @param fieldName The name of the field to validate
 * @param value The value to validate
 * @param schema The Zod schema to validate against
 * @returns The error message or undefined if valid
 */
export function validateField<T>(
  fieldName: keyof T,
  value: any,
  schema: z.ZodType<T>
): string | undefined {
  try {
    // Create a partial schema for just this field
    const partialSchema = z.object({ [fieldName as string]: schema.shape[fieldName] });
    
    // Validate just this field
    partialSchema.parse({ [fieldName]: value });
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid value';
  }
}
```

## Common Validation Patterns

### Required Fields

```typescript
const schema = z.object({
  requiredField: z.string().min(1, 'This field is required')
});
```

### Email Validation

```typescript
const schema = z.object({
  email: z.string().email('Please enter a valid email address')
});
```

### Password Validation

```typescript
const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});
```

### Date Validation

```typescript
const schema = z.object({
  birthdate: z.date()
    .min(new Date('1900-01-01'), 'Date must be after 1900')
    .max(new Date(), 'Date cannot be in the future')
});
```

### Number Validation

```typescript
const schema = z.object({
  age: z.number()
    .int('Age must be a whole number')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Age cannot exceed 120')
});
```

### File Validation

```typescript
const schema = z.object({
  profileImage: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'File must be under 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    )
});
```

### Conditional Validation

```typescript
const schema = z.object({
  hasDiscount: z.boolean(),
  discountCode: z.string()
    .optional()
    .refine(
      (code, ctx) => !ctx.data.hasDiscount || (code && code.length > 0),
      'Discount code is required when discount is selected'
    )
});
```

## Accessibility Considerations

When implementing form validation, follow these accessibility guidelines:

1. **Programmatically Associate Errors**: 
   Use `aria-invalid="true"` and `aria-describedby` to connect error messages with form fields.

2. **Focus Management**:
   Move focus to the first field with an error when validation fails.

3. **Semantic HTML**:
   Use appropriate form elements and maintain a logical tab order.

4. **Screen Reader Announcements**:
   Consider using `aria-live` regions for dynamic validation feedback.

5. **Color Contrast**:
   Ensure error states have sufficient color contrast (4.5:1 minimum).

6. **Non-Visual Indicators**:
   Don't rely solely on color to indicate errors; use icons and text.

## Server-Side Validation

Always implement validation on both client and server sides:

1. **API Endpoint Validation**:
   ```typescript
   // src/pages/api/users/index.ts
   import { NextApiRequest, NextApiResponse } from 'next';
   import { userSchema } from '@/schemas/user-schema';
   
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     try {
       // Validate the request body
       const validData = userSchema.parse(req.body);
       
       // Proceed with database operations
       // ...
       
       return res.status(201).json({ success: true });
     } catch (error) {
       if (error instanceof z.ZodError) {
         return res.status(400).json({ errors: error.errors });
       }
       
       console.error('Server error:', error);
       return res.status(500).json({ error: 'Internal server error' });
     }
   }
   ```

2. **Shared Validation Logic**:
   Use the same schemas for both client and server validation.

## Testing Form Validation

### Unit Tests for Schema Validation

```typescript
// __tests__/schemas/user-schema.test.ts
import { userSchema } from '@/schemas/user-schema';

describe('User schema validation', () => {
  test('validates correct data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123'
    };
    
    const result = userSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  test('rejects invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'not-an-email',
      password: 'Password123'
    };
    
    const result = userSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.email?._errors).toBeDefined();
    }
  });
  
  // Additional test cases...
});
```

### Component Tests

```typescript
// __tests__/components/sign-up-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from '@/components/sign-up-form';

describe('SignUpForm', () => {
  test('displays validation errors for empty fields', async () => {
    render(<SignUpForm />);
    
    // Submit form without entering data
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
  
  test('clears errors when user types in fields', async () => {
    render(<SignUpForm />);
    
    // Submit form to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
    
    // Type in the field
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    
    // Expect error to be removed
    await waitFor(() => {
      expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument();
    });
  });
  
  // Additional test cases...
});
```

## Related Documents

- [Accessibility Guide](../accessibility/accessibility-guide.md)
- [Implementation Guide](./implementation-guide.md)
- [Component Library](./ui-component-library.md) 