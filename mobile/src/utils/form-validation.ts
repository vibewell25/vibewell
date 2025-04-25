export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates that each field in data is non-empty.
 * Returns isValid flag and errors per field.
 */
export function validateForm(data: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      errors[key] = `${key} is required`;
    }
  });
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
