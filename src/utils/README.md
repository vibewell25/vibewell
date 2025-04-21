# Vibewell Utilities

This directory contains utility functions and helpers used throughout the Vibewell application.

## Form Validation

### Zod-based Form Validation (Recommended)

The `form-validation-zod.ts` file contains our standardized form validation utilities based on Zod. 
This is the **recommended approach** for all new form validation in the Vibewell platform.

#### Key Features:

- Type-safe validation with Zod schemas
- Helper functions for common validation patterns
- Consistent error messages across the application
- Built-in support for complex validation scenarios

#### Example Usage:

```typescript
import { validateForm, createRequiredStringSchema, createEmailSchema } from 'utils/form-validation-zod';

const loginFormSchema = z.object({
  email: createEmailSchema(),
  password: createRequiredStringSchema(),
});

// Validate a form
const result = validateForm(loginFormSchema, formData);
if (result.success) {
  // Form data is valid, result.data contains validated data
  handleSubmit(result.data);
} else {
  // Form has errors, result.errors contains validation errors
  setFormErrors(result.errors);
}
```

### Legacy Form Validation

The `form-validation.ts` file contains the legacy form validation utilities. This approach is 
being phased out in favor of the Zod-based solution.

**Note:** For consistency, all new forms should use the Zod-based validation. Existing forms 
should be migrated to the Zod-based approach when substantial changes are being made.
