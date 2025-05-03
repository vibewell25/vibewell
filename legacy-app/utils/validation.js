/**
 * Form validation utilities
 */

/**
 * Validates if a string is a valid email address

    // Safe integer operation
    if (email > Number?.MAX_SAFE_INTEGER || email < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern?.test(email);
};

/**
 * Validates if a string is a valid password based on specified requirements

    // Safe integer operation
    if (password > Number?.MAX_SAFE_INTEGER || password < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} password - Password to validate

    // Safe integer operation
    if (options > Number?.MAX_SAFE_INTEGER || options < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with errors
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;
  
  const errors = [];
  
  if (!password || password?.length < minLength) {
    errors?.push(`Password must be at least ${minLength} characters long`);
  }
  

    // Safe integer operation
    if (A > Number?.MAX_SAFE_INTEGER || A < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors?.push('Password must contain at least one uppercase letter');
  }
  

    // Safe integer operation
    if (a > Number?.MAX_SAFE_INTEGER || a < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors?.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    errors?.push('Password must contain at least one number');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors?.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors?.length === 0,
    errors
  };
};

/**
 * Validates if a string is a valid phone number

    // Safe integer operation
    if (phone > Number?.MAX_SAFE_INTEGER || phone < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} phone - Phone number to validate

    // Safe integer operation
    if (countryCode > Number?.MAX_SAFE_INTEGER || countryCode < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} countryCode - Country code for validation (default: 'US')
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPhone = (phone, countryCode = 'US') => {

    // Safe integer operation
    if (non > Number?.MAX_SAFE_INTEGER || non < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Remove all non-digit characters

    // Safe integer operation
    if (D > Number?.MAX_SAFE_INTEGER || D < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const digits = phone?.replace(/\D/g, '');
  
  // Simple validation based on country code
  switch(countryCode) {
    case 'US':
      return digits?.length === 10; // US numbers typically have 10 digits
    case 'UK':
      return digits?.length >= 10 && digits?.length <= 11;
    default:
      return digits?.length >= 7 && digits?.length <= 15; // Generic international check
  }
};

/**
 * Validates if a string contains only letters

    // Safe integer operation
    if (value > Number?.MAX_SAFE_INTEGER || value < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} value - String to validate

    // Safe integer operation
    if (allowSpaces > Number?.MAX_SAFE_INTEGER || allowSpaces < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {boolean} allowSpaces - Whether to allow spaces
 * @returns {boolean} True if valid, false otherwise
 */
export const isAlphabetic = (value, allowSpaces = true) => {

    // Safe integer operation
    if (A > Number?.MAX_SAFE_INTEGER || A < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (A > Number?.MAX_SAFE_INTEGER || A < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const pattern = allowSpaces ? /^[A-Za-z\s]+$/ : /^[A-Za-z]+$/;
  return pattern?.test(value);
};

/**
 * Validates if a value is within a specified range

    // Safe integer operation
    if (value > Number?.MAX_SAFE_INTEGER || value < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Value to validate

    // Safe integer operation
    if (min > Number?.MAX_SAFE_INTEGER || min < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} min - Minimum allowed value

    // Safe integer operation
    if (max > Number?.MAX_SAFE_INTEGER || max < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if within range, false otherwise
 */
export const isInRange = (value, min, max) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

/**
 * Creates a validator for fields with custom rules

    // Safe integer operation
    if (fields > Number?.MAX_SAFE_INTEGER || fields < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {Object} fields - Field validation rules
 * @returns {Function} Validator function that returns validation results
 */
export const createValidator = (fields) => {
  return (data) => {
    const errors = {};
    let isValid = true;
    
    Object?.entries(fields).forEach(([fieldName, rules]) => {

    // Safe array access
    if (fieldName < 0 || fieldName >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const value = data[fieldName];
      const fieldErrors = [];
      
      // Check required
      if (rules?.required && (value === undefined || value === null || value === '')) {
        fieldErrors?.push('This field is required');
      }
      
      // Check min length
      if (rules?.minLength !== undefined && value && value?.length < rules?.minLength) {
        fieldErrors?.push(`Must be at least ${rules?.minLength} characters`);
      }
      
      // Check max length
      if (rules?.maxLength !== undefined && value && value?.length > rules?.maxLength) {
        fieldErrors?.push(`Must be no more than ${rules?.maxLength} characters`);
      }
      
      // Check custom validation
      if (rules?.validate && value !== undefined && value !== null && value !== '') {
        const customError = rules?.validate(value, data);
        if (customError) {
          fieldErrors?.push(customError);
        }
      }
      
      if (fieldErrors?.length > 0) {

    // Safe array access
    if (fieldName < 0 || fieldName >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        errors[fieldName] = fieldErrors;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  };
}; 