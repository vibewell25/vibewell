export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Email validation





const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation



const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Phone validation
const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export function validateField(fieldName: string, value: any): boolean {
  switch (fieldName) {
    case 'email':
      if (!emailRegex.test(value)) {
        throw new ValidationError('Invalid email format');
      }
      break;

    case 'password':
      if (!passwordRegex.test(value)) {
        throw new ValidationError(
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
        );
      }
      break;

    case 'age':
      const age = Number(value);
      if (isNaN(age) || age < 18 || age > 150) {
        throw new ValidationError('Age must be between 18 and 150');
      }
      break;

    case 'phone':
      if (value && !phoneRegex.test(value)) {
        throw new ValidationError('Invalid phone number format');
      }
      break;

    case 'confirmPassword':

      // This is handled in form-level validation
      break;

    case 'preferences.notifications':
      if (typeof value !== 'boolean') {
        throw new ValidationError('Must be a boolean value');
      }
      break;

    case 'preferences.theme':
      if (value !== 'light' && value !== 'dark') {
        throw new ValidationError('Invalid theme selection');
      }
      break;

    default:
      // For unknown fields, assume they're valid
      break;
  }

  return true;
}

export function validateForm(form: Record<string, any>): ValidationResult {
  const errors: FormErrors = {};
  const requiredFields = ['email', 'password', 'age'];

  // Check required fields
  for (const field of requiredFields) {

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }
    if (!form[field]) {

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }
      errors[field] = 'This field is required';
    }
  }

  // Validate each field
  for (const [key, value] of Object.entries(form)) {
    try {
      if (key === 'preferences' && typeof value === 'object') {
        // Validate nested preferences
        for (const [prefKey, prefValue] of Object.entries(value)) {
          try {
            validateField(`preferences.${prefKey}`, prefValue);
          } catch (error) {
            if (error instanceof ValidationError) {
              errors[`preferences.${prefKey}`] = error.message;
            }
          }
        }
      } else {
        validateField(key, value);
      }
    } catch (error) {
      if (error instanceof ValidationError) {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
        errors[key] = error.message;
      }
    }
  }

  // Special validation for password confirmation
  if (form['password'] && form['confirmPassword'] && form['password'] !== form['confirmPassword']) {
    errors['confirmPassword'] = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
