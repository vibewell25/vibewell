# Form Validation Migration Guide

## Overview

This guide explains how to migrate component-specific form validation to use the centralized form validation utility. By standardizing on a single validation approach, we can improve code consistency and reduce duplication.

## Why Standardize Validation?

- **Consistency**: Same validation rules applied across all forms
- **Reusability**: Avoid reimplementing the same validation logic
- **Maintainability**: Easier to update validation rules in one place
- **Type Safety**: Better TypeScript integration

## The Centralized Validation Utility

The standard validation utilities are in `src/utils/form-validation.ts` and provide:

1. **Field-level validation** with `validateField()`
2. **Form-level validation** with `validateForm()`
3. **Predefined validation rules** for common fields (email, password, etc.)
4. **Custom validation** support for special use cases

## Migration Steps

### 1. Replace Custom Validation Logic

#### Before (component-specific validation):

```typescript
// In your component
const validateForm = () => {
  const errors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return errors;
};
```

#### After (using the centralized validation):

```typescript
import { validateForm } from '@/utils/form-validation';

// In your component
const validate = () => {
  const result = validateForm(values);
  setErrors(result.errors);
  return result.isValid;
};
```

### 2. Field-Level Validation

For individual field validation:

#### Before:

```typescript
const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Invalid email format';
  }
  return '';
};

// Usage in onChange or onBlur
const handleEmailChange = (e) => {
  const value = e.target.value;
  setEmail(value);
  const error = validateEmail(value);
  setEmailError(error);
};
```

#### After:

```typescript
import { validateField } from '@/utils/form-validation';

// Usage in onChange or onBlur
const handleEmailChange = (e) => {
  const value = e.target.value;
  setEmail(value);
  
  try {
    validateField('email', value);
    setEmailError('');
  } catch (error) {
    setEmailError(error.message);
  }
};
```

### 3. Supporting Custom Fields

If you have custom fields not covered by the standard validation:

```typescript
// Add custom validation to your form validation call
const validate = () => {
  // Standard validation
  const result = validateForm(values);
  
  // Additional custom validation
  if (values.customField && !someCustomCheckFunction(values.customField)) {
    result.errors.customField = 'Invalid custom field value';
    result.isValid = false;
  }
  
  setErrors(result.errors);
  return result.isValid;
};
```

### 4. Supported Validation Rules

The centralized validation supports these field types out of the box:

| Field Type | Validation Rules |
|------------|------------------|
| `email` | Required, valid email format |
| `password` | Required, min 8 chars, mixed case, number, special char |
| `confirmPassword` | Matches password field |
| `age` | Numeric, min 18, max 150 |
| `phone` | Valid phone format |
| `preferences.notifications` | Boolean value |
| `preferences.theme` | Must be 'light' or 'dark' |

### 5. Automated Migration

You can use the automated script to help identify forms that need migration:

```bash
node scripts/update-imports.js
```

This will update import statements across the codebase and provide a report of files that need review.

## Form Component Integration

For components using form libraries (React Hook Form, Formik, etc.):

### React Hook Form Example:

```typescript
import { useForm } from 'react-hook-form';
import { validateField, validateForm } from '@/utils/form-validation';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    validate: (values) => {
      const result = validateForm(values);
      return result.isValid ? {} : result.errors;
    }
  });
  
  // ...rest of component
}
```

### Formik Example:

```typescript
import { Formik, Form } from 'formik';
import { validateForm } from '@/utils/form-validation';

function MyForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={(values) => {
        const result = validateForm(values);
        return result.errors;
      }}
      onSubmit={handleSubmit}
    >
      {/* form content */}
    </Formik>
  );
}
```

## Testing Validation

When testing components that use the standard validation:

```typescript
import { validateField, validateForm } from '@/utils/form-validation';

// Mock the validation functions
jest.mock('@/utils/form-validation', () => ({
  validateField: jest.fn(),
  validateForm: jest.fn().mockReturnValue({ isValid: true, errors: {} })
}));

describe('MyComponent', () => {
  it('validates the form', () => {
    // Setup the test
    
    // Mock specific validation results if needed
    validateForm.mockReturnValueOnce({ 
      isValid: false, 
      errors: { email: 'Invalid email' } 
    });
    
    // Test your component
  });
});
```

## Need Help?

If you have any questions about migrating to the standard validation utilities, please contact the development team or refer to the full documentation in the codebase. 