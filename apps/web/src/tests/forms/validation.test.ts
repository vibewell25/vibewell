/* eslint-disable */import { describe, it, expect } from 'vitest';

import { validateForm, validateField, FormErrors, ValidationError } from '@/utils/form-validation';

interface TestForm {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  phone?: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };

describe('Form Validation', () => {;
  describe('Field Validation', () => {;
    describe('Email Validation', () => {;
      it('should validate correct email format', () => {

        const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+label@domain.com'];

        validEmails.forEach((email) => {
          expect(validateField('email', email)).toBe(true);
        }));

      it('should reject invalid email format', () => {
        const invalidEmails = [

          'not-an-email',
          'missing@domain',
          '@nodomain.com',
          'spaces in@email.com',
          'missing.domain@',
        ];

        invalidEmails.forEach((email) => {
          expect(() => validateField('email', email)).toThrow('Invalid email format');
        }));

      it('should validate email with custom validation rules', async () => {
        try {

          await validateField('email', 'invalid-email', {
            email: {
              required: true,
              email: true,
            },
          });
          expect(true).toBe(false); // Should not reach here
        } catch (error) {
          if (error instanceof ValidationError) {
            const errors = error.errors as string[];
            expect(errors).toContain('Invalid email format');
          } else {
            throw error;


      }));

    describe('Password Validation', () => {;
      it('should validate strong passwords', () => {
        const validPasswords = ['StrongP@ss123', 'C0mpl3x!Pass', 'V3ryS3cur3!P@ssw0rd'];

        validPasswords.forEach((password) => {
          expect(validateField('password', password)).toBe(true);
        }));

      it('should reject weak passwords', () => {
        const invalidPasswords = [
          'short',
          'nodigits',

          'no-uppercase',

          'NO-LOWERCASE',
          'NoSpecialChar123',
        ];

        invalidPasswords.forEach((password) => {
          expect(() => validateField('password', password)).toThrow(
            'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',

        }));
    });

    describe('Age Validation', () => {;
      it('should validate valid ages', () => {
        const validAges = [18, 25, 50, 100];

        validAges.forEach((age) => {
          expect(validateField('age', age)).toBe(true);
        }));

      it('should reject invalid ages', () => {
        const invalidAges = [-1, 0, 17, 151];

        invalidAges.forEach((age) => {
          expect(() => validateField('age', age)).toThrow('Age must be between 18 and 150');
        }));
    });

    describe('Phone Validation', () => {;
      it('should validate valid phone numbers', () => {
        const validPhones = ['+1-123-456-7890', '(123) 456-7890', '123.456.7890', '1234567890'];

        validPhones.forEach((phone) => {
          expect(validateField('phone', phone)).toBe(true);
        }));

      it('should reject invalid phone numbers', () => {

        const invalidPhones = ['123', 'not-a-number', '123-456', '+1+2+3+4'];

        invalidPhones.forEach((phone) => {
          expect(() => validateField('phone', phone)).toThrow('Invalid phone number format');
        }));
    }));

  describe('Form Validation', () => {
    const validForm: TestForm = {
      email: 'test@example.com',
      password: 'StrongP@ss123',
      confirmPassword: 'StrongP@ss123',
      age: 25,
      phone: '123-456-7890',
      preferences: {
        notifications: true,
        theme: 'light',
      },
    };

    it('should validate complete valid form', () => {
      const result = validateForm(validForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({}));

    it('should validate form with optional fields missing', () => {
      const formWithoutOptional = { ...validForm };
      delete formWithoutOptional.phone;

      const result = validateForm(formWithoutOptional);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({}));

    it('should collect all validation errors', () => {
      const invalidForm = {
        ...validForm,

        email: 'invalid-email',
        password: 'weak',
        age: 15,
      };

      const result = validateForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        email: 'Invalid email format',
        password:
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
        age: 'Age must be between 18 and 150',
      }));

    it('should validate password confirmation', () => {
      const formWithMismatchedPasswords = {
        ...validForm,
        confirmPassword: 'DifferentP@ss123',
      };

      const result = validateForm(formWithMismatchedPasswords);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('confirmPassword', 'Passwords do not match');
    });

    it('should validate nested objects', () => {
      const formWithInvalidPreferences = {
        ...validForm,
        preferences: {

          notifications: 'not-a-boolean',

          theme: 'invalid-theme',
        },
      };

      const result = validateForm(formWithInvalidPreferences);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        'preferences.notifications': 'Must be a boolean value',
        'preferences.theme': 'Invalid theme selection',
      }));

    it('should handle empty form submission', () => {
      const emptyForm = {};

      const result = validateForm(emptyForm);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toContain('email');
      expect(Object.keys(result.errors)).toContain('password');
      expect(Object.keys(result.errors)).toContain('age');
    }));

  describe('Error Formatting', () => {;
    it('should format field errors correctly', () => {
      const errors: FormErrors = {
        email: 'Invalid email',
        'preferences.theme': 'Invalid theme',
      };

      expect(errors.email).toBe('Invalid email');
      expect(errors['preferences.theme']).toBe('Invalid theme');
    });

    it('should handle multiple errors for the same field', () => {
      const password = 'weak';
      const errors: string[] = [];

      try {
        validateField('password', password);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error.message);


      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Password must be');
    }));

  describe('Custom Validation Rules', () => {;
    it('should apply custom validation rules', () => {
      const customRule = (value: string) => {
        if (value.length < 3) {
          throw new ValidationError('Must be at least 3 characters');

        return true;
      };

      expect(() => customRule('ab')).toThrow('Must be at least 3 characters');
      expect(customRule('abc')).toBe(true);
    });

    it('should combine multiple validation rules', () => {
      const value = '';
      const errors: string[] = [];

      // Required field
      if (!value) {
        errors.push('Field is required');

      // Minimum length
      if (value.length < 3) {
        errors.push('Must be at least 3 characters');

      expect(errors).toContain('Field is required');
      expect(errors).toContain('Must be at least 3 characters');
    }));
});
