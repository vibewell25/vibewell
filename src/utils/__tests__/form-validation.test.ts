import {
  validateField,
  validateForm,
  ValidationError,
  FormErrors,
} from '../form-validation';

describe('Form Validation Utilities', () => {
  describe('validateField', () => {
    // Email validation tests
    describe('Email validation', () => {
      it('validates a valid email', () => {
        expect(() => validateField('email', 'test@example.com')).not.toThrow();
      });

      it('throws a ValidationError for an invalid email', () => {
        expect(() => validateField('email', 'invalid-email')).toThrow(
          ValidationError
        );
      });
    });

    // Password validation tests
    describe('Password validation', () => {
      it('validates a valid password', () => {
        expect(() =>
          validateField('password', 'ValidP@ss123')
        ).not.toThrow();
      });

      it('throws a ValidationError for too short password', () => {
        expect(() => validateField('password', 'Pass1!')).toThrow(
          ValidationError
        );
      });

      it('throws a ValidationError for password without uppercase', () => {
        expect(() => validateField('password', 'validp@ss123')).toThrow(
          ValidationError
        );
      });

      it('throws a ValidationError for password without lowercase', () => {
        expect(() => validateField('password', 'VALIDP@SS123')).toThrow(
          ValidationError
        );
      });

      it('throws a ValidationError for password without number', () => {
        expect(() => validateField('password', 'ValidP@ssword')).toThrow(
          ValidationError
        );
      });

      it('throws a ValidationError for password without special character', () => {
        expect(() => validateField('password', 'ValidPass123')).toThrow(
          ValidationError
        );
      });
    });

    // Age validation tests
    describe('Age validation', () => {
      it('validates a valid age', () => {
        expect(() => validateField('age', '25')).not.toThrow();
      });

      it('throws a ValidationError for age below minimum', () => {
        expect(() => validateField('age', '17')).toThrow(ValidationError);
      });

      it('throws a ValidationError for age above maximum', () => {
        expect(() => validateField('age', '151')).toThrow(ValidationError);
      });

      it('throws a ValidationError for non-numeric age', () => {
        expect(() => validateField('age', 'twenty')).toThrow(ValidationError);
      });
    });

    // Phone validation tests
    describe('Phone validation', () => {
      it('validates a valid US phone number', () => {
        expect(() => validateField('phone', '(123) 456-7890')).not.toThrow();
      });

      it('validates a valid US phone with country code', () => {
        expect(() => validateField('phone', '+1 (123) 456-7890')).not.toThrow();
      });

      it('throws a ValidationError for invalid phone format', () => {
        expect(() => validateField('phone', '123-abc-7890')).toThrow(
          ValidationError
        );
      });

      it('does not throw for empty phone (optional)', () => {
        expect(() => validateField('phone', '')).not.toThrow();
      });
    });

    // Preferences validation tests
    describe('Preferences validation', () => {
      it('validates a valid notifications preference', () => {
        expect(() =>
          validateField('preferences.notifications', true)
        ).not.toThrow();
      });

      it('throws a ValidationError for non-boolean notifications preference', () => {
        expect(() =>
          validateField('preferences.notifications', 'yes')
        ).toThrow(ValidationError);
      });

      it('validates a valid theme preference', () => {
        expect(() => validateField('preferences.theme', 'dark')).not.toThrow();
      });

      it('throws a ValidationError for invalid theme', () => {
        expect(() => validateField('preferences.theme', 'blue')).toThrow(
          ValidationError
        );
      });
    });

    // Unknown field test
    it('returns true for unknown fields', () => {
      expect(validateField('unknownField', 'value')).toBe(true);
    });
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

    // Form with optional fields test
    it('validates a form with missing optional fields', () => {
      const formWithoutOptional = {
        email: 'test@example.com',
        password: 'ValidP@ss123',
        age: '30',
      };

      const result = validateForm(formWithoutOptional);
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

    // Password confirmation test
    it('validates password confirmation matches', () => {
      const formWithMismatchedPasswords = {
        email: 'test@example.com',
        password: 'ValidP@ss123',
        confirmPassword: 'DifferentP@ss123',
        age: '30',
      };

      const result = validateForm(formWithMismatchedPasswords);
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match');
    });

    // Preferences validation test
    it('validates nested preferences', () => {
      const formWithInvalidPreferences = {
        email: 'test@example.com',
        password: 'ValidP@ss123',
        age: '30',
        preferences: {
          notifications: 'yes', // should be boolean
          theme: 'blue', // invalid theme
        },
      };

      const result = validateForm(formWithInvalidPreferences);
      expect(result.isValid).toBe(false);
      expect(result.errors['preferences.notifications']).toBeDefined();
      expect(result.errors['preferences.theme']).toBeDefined();
    });

    // Required fields test
    it('checks required fields', () => {
      const emptyForm = {};

      const result = validateForm(emptyForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('This field is required');
      expect(result.errors.password).toBe('This field is required');
      expect(result.errors.age).toBe('This field is required');
    });
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

    it('can be caught as an instance of ValidationError', () => {
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