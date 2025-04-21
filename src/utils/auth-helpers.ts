/**
 * Authentication helper functions
 */

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password strength
 * @param password Password to validate
 * @returns Object containing validation results
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
} => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return {
    isValid,
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
};

/**
 * Generates an authentication token for testing
 * @returns A mock authentication token
 */
export const generateMockToken = (): string => {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Securely stores a token in localStorage with expiration
 * @param token Token to store
 * @param expiresInMinutes Minutes until token expires
 */
export const storeAuthToken = (token: string, expiresInMinutes = 60): void => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  try {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_expires_at', expiresAt);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

/**
 * Retrieves the stored authentication token if valid
 * @returns The stored token or null if expired/not found
 */
export const getStoredAuthToken = (): string | null => {
  try {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_expires_at');

    if (!token || !expiresAt) {
      return null;
    }

    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expires_at');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Clears stored authentication data
 */
export const clearStoredAuth = (): void => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
