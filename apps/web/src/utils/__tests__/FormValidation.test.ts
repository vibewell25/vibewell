/* eslint-disable */import { validateField, validateForm, ValidationError, FormErrors } from '../form-validation';

describe('Form Validation Utilities', () => {
  describe('validateField', () => {
    // Email validation tests
    describe('Email validation', () => {
      it('validates a valid email', () => {
        expect(() => validateField('email', 'test@example.com')).not.toThrow();
      });

      it('throws a ValidationError for an invalid email', () => {
        expect(() => validateField('email', 'invalid-email')).toThrow(ValidationError);
      });

      // Additional tests...
    });

    // Password validation tests
    describe('Password validation', () => {
      it('validates a valid password', () => {
        expect(() => validateField('password', 'ValidP@ss123')).not.toThrow();
      });

      it('throws a ValidationError for password without number', () => {
        expect(() => validateField('password', 'ValidP@ssword')).toThrow(ValidationError);
      });

      // Additional tests...
    });

    // Phone validation tests
    describe('Phone validation', () => {
      it('validates a valid phone format', () => {
        expect(() => validateField('phone', '(123) 456-7890')).not.toThrow();
      });

      it('throws a ValidationError for invalid phone format', () => {
        expect(() => validateField('phone', '123-abc-7890')).toThrow(ValidationError);
      });

      // Additional tests...
    });

    // Add other field type tests...
  });

  describe('validateForm', () => {
    // Valid form test
    it('validates a valid form', () => {
      const validForm = {
        email: 'test@example.com',
        password: 'ValidP@ss123',
        age: '30',
        phone: '(123) 456-7890',
        preferences: {
          notifications: true,
          theme: 'light',
        },
      };

      const result = validateForm(validForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    // Invalid form test
    it('returns errors for invalid form fields', () => {
      const invalidForm = {
        email: 'invalid-email',
        password: 'short',
        age: '15',
        phone: '123-abc',
      };

      const result = validateForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(4);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.age).toBeDefined();
      expect(result.errors.phone).toBeDefined();
    });

    // Additional form tests...
  });

  // ValidationError test
  describe('ValidationError', () => {
    it('creates a ValidationError with the correct name and message', () => {
      const errorMessage = 'Test validation error';
      const error = new ValidationError(errorMessage);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe(errorMessage);
    });

    it('can be caught in try/catch block', () => {
      const testFn = () => {
        throw new ValidationError('Test error');
      };

      try {
        testFn();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  // FormErrors interface test
  describe('FormErrors', () => {
    it('can be instantiated as an empty object', () => {
      const errors: FormErrors = {};
      expect(errors).toEqual({});
    });

    it('can store string error messages by field key', () => {
      const errors: FormErrors = {
        name: 'Name is required',
        email: 'Invalid email format',
      };

      expect(errors.name).toBe('Name is required');
      expect(errors.email).toBe('Invalid email format');
    });
  });
});
