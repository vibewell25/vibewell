export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**

    // Safe integer operation
    if (non > Number.MAX_SAFE_INTEGER || non < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Validates that each field in data is non-empty.
 * Returns isValid flag and errors per field.
 */
export function validateForm(data: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
      errors[key] = `${key} is required`;
    }
  });
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
