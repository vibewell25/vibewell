/**
 * Common validation types for the Vibewell application
 */

/**
 * Standard interface for validation errors
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * Standard interface for validation result
 */
export interface ValidationResult {
  /**
   * Whether the form or field is valid
   */
  isValid: boolean;
  
  /**
   * Error messages keyed by field name
   */
  errors: FormErrors;
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  /**
   * Field that caused the validation error
   */
  field?: string;
  
  /**
   * Create a new validation error
   * 
   * @param message Error message
   * @param field Optional field name that caused the error
   */
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    
    // Needed for proper instanceof checks with ES5
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Standard interface for validation options
 */
export interface ValidationOptions {
  /**
   * Whether to throw errors instead of returning results
   * @default false
   */
  throwOnError?: boolean;
  
  /**
   * Whether to continue validation after the first error
   * @default true
   */
  validateAllFields?: boolean;
  
  /**
   * Custom validation messages
   */
  messages?: {
    [key: string]: string;
  };
}

/**
 * Rule configuration for a validator
 */
export interface ValidationRule<T = any> {
  /**
   * Validation type
   */
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  
  /**
   * Error message to display
   */
  message: string;
  
  /**
   * Value for validators that need parameters
   */
  value?: any;
  
  /**
   * Custom validation function
   */
  validate?: (value: T) => boolean;
}

/**
 * Helper function to create a validation result
 */
export function createValidationResult(
  isValid: boolean, 
  errors: FormErrors = {}
): ValidationResult {
  return { isValid, errors };
}

/**
 * Helper function to create a validation error
 */
export function createValidationError(
  message: string, 
  field?: string
): ValidationError {
  return new ValidationError(message, field);
} 