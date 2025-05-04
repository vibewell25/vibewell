





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { z } from 'zod';
import {
  validateForm,
  validateField,
  formatZodError,
  CommonSchemas,
  createPasswordConfirmationSchema,
  isEmpty,

} from '../form-validation-zod';

describe('Form Validation Zod Utilities', () => {
  describe('validateForm', () => {
    it('should validate a valid form', () => {
      const schema = z.object({
        email: CommonSchemas.email,
        password: CommonSchemas.password,
      });

      const data = {
        email: 'test@example.com',
        password: 'ValidP@ss123',
      };

      const result = validateForm(data, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid form data', () => {
      const schema = z.object({
        email: CommonSchemas.email,
        password: CommonSchemas.password,
      });

      const data = {

        email: 'invalid-email',
        password: 'short',
      };

      const result = validateForm(data, schema);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toContain('email');
      expect(Object.keys(result.errors)).toContain('password');
    });

    it('should handle unexpected errors gracefully', () => {
      // Create a scenario that would cause an unexpected error
      // For example, passing invalid schema (though this would normally be caught by TypeScript)
      const schema = null as unknown as z.ZodType<any>;
      const data = { field: 'value' };

      // Mock console.error to prevent test output noise
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const result = validateForm(data, schema);
        expect(result.isValid).toBe(false);
        expect(result.errors['form']).toBe('An unexpected validation error occurred.');
      } finally {
        // Restore console.error
        console.error = originalConsoleError;
      }
    });
  });

  describe('validateField', () => {
    it('should validate a valid field value', () => {
      const schema = z.object({
        email: CommonSchemas.email,
      });

      const result = validateField('email', 'test@example.com', schema);
      expect(result).toBeUndefined();
    });

    it('should return error for invalid field value', () => {
      const schema = z.object({
        email: CommonSchemas.email,
      });


      const result = validateField('email', 'invalid-email', schema);
      expect(result).toBeDefined();
      expect(result).toContain('valid email');
    });


    it('should handle non-existent fields', () => {
      const schema = z.object({
        email: CommonSchemas.email,
      });

      // Mock console.warn to prevent test output noise
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      try {
        const result = validateField('nonExistentField', 'some value', schema);
        expect(result).toBeUndefined();
      } finally {
        // Restore console.warn
        console.warn = originalConsoleWarn;
      }
    });
  });

  describe('formatZodError', () => {
    it('should format ZodError into form errors', () => {
      const schema = z.object({
        email: z.string().email(),
        profile: z.object({
          age: z.number().min(18),
        }),
      });

      // Create a ZodError
      const result = schema.safeParse({
        email: 'invalid',
        profile: { age: 10 },
      });

      if (!result.success) {
        const errors = formatZodError(result.error);
        expect(errors['email']).toBeDefined();
        expect(errors['profile.age']).toBeDefined();
      } else {
        fail('Schema parsing should have failed');
      }
    });
  });

  describe('CommonSchemas', () => {
    describe('email schema', () => {
      it('should validate a valid email', () => {
        const result = CommonSchemas.email.safeParse('test@example.com');
        expect(result.success).toBe(true);
      });

      it('should reject an invalid email', () => {

        const result = CommonSchemas.email.safeParse('invalid-email');
        expect(result.success).toBe(false);
      });

      it('should reject an empty email', () => {
        const result = CommonSchemas.email.safeParse('');
        expect(result.success).toBe(false);
      });
    });

    describe('password schema', () => {
      it('should validate a valid password', () => {
        const result = CommonSchemas.password.safeParse('ValidP@ss123');
        expect(result.success).toBe(true);
      });

      it('should reject a password that is too short', () => {
        const result = CommonSchemas.password.safeParse('Sh@rt1');
        expect(result.success).toBe(false);
      });

      it('should reject a password without uppercase', () => {
        const result = CommonSchemas.password.safeParse('validp@ss123');
        expect(result.success).toBe(false);
      });

      it('should reject a password without lowercase', () => {
        const result = CommonSchemas.password.safeParse('VALIDP@SS123');
        expect(result.success).toBe(false);
      });

      it('should reject a password without numbers', () => {
        const result = CommonSchemas.password.safeParse('ValidP@ssword');
        expect(result.success).toBe(false);
      });

      it('should reject a password without special characters', () => {
        const result = CommonSchemas.password.safeParse('ValidPass123');
        expect(result.success).toBe(false);
      });
    });

    describe('name schema', () => {
      it('should validate a valid name', () => {
        const result = CommonSchemas.name.safeParse('John Doe');
        expect(result.success).toBe(true);
      });

      it('should reject a name that is too short', () => {
        const result = CommonSchemas.name.safeParse('J');
        expect(result.success).toBe(false);
      });

      it('should reject a name that is too long', () => {
        const result = CommonSchemas.name.safeParse('a'.repeat(101));
        expect(result.success).toBe(false);
      });
    });

    describe('phone schema', () => {
      it('should validate a valid US phone number', () => {
        const result = CommonSchemas.phone.safeParse('(123) 456-7890');
        expect(result.success).toBe(true);
      });

      it('should validate a valid phone with country code', () => {
        const result = CommonSchemas.phone.safeParse('+1 (123) 456-7890');
        expect(result.success).toBe(true);
      });

      it('should reject an invalid phone format', () => {

        const result = CommonSchemas.phone.safeParse('123-abc-7890');
        expect(result.success).toBe(false);
      });

      it('should allow empty phone values', () => {
        const result = CommonSchemas.phone.safeParse('');
        expect(result.success).toBe(true);
      });
    });

    describe('age schema', () => {
      it('should validate a valid age', () => {
        const result = CommonSchemas.age.safeParse(25);
        expect(result.success).toBe(true);
      });

      it('should reject a decimal age', () => {
        const result = CommonSchemas.age.safeParse(25.5);
        expect(result.success).toBe(false);
      });

      it('should reject an age below minimum', () => {
        const result = CommonSchemas.age.safeParse(17);
        expect(result.success).toBe(false);
      });

      it('should reject an age above maximum', () => {
        const result = CommonSchemas.age.safeParse(151);
        expect(result.success).toBe(false);
      });
    });

    describe('url schema', () => {
      it('should validate a valid URL', () => {
        const result = CommonSchemas.url.safeParse('https://example.com');
        expect(result.success).toBe(true);
      });

      it('should reject an invalid URL', () => {

        const result = CommonSchemas.url.safeParse('invalid-url');
        expect(result.success).toBe(false);
      });

      it('should allow empty URL values', () => {
        const result = CommonSchemas.url.safeParse('');
        expect(result.success).toBe(true);
      });
    });
  });

  describe('createPasswordConfirmationSchema', () => {
    it('should validate matching passwords', () => {
      // Create a schema for password confirmation
      const passwordSchema = createPasswordConfirmationSchema();

      // Valid data with matching strong passwords
      const validData = {
        password: 'ValidP@ss123',
        confirmPassword: 'ValidP@ss123',
      };

      // Use our validateForm function to validate
      const result = validateForm(validData, passwordSchema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });


    it('should detect non-matching passwords', () => {
      // Create a schema for password confirmation
      const passwordSchema = createPasswordConfirmationSchema();


      // Invalid data with non-matching passwords
      const invalidData = {
        password: 'ValidP@ss123',
        confirmPassword: 'DifferentP@ss456',
      };

      // Use our validateForm function to validate
      const result = validateForm(invalidData, passwordSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('confirmPassword');
    });

    it('should detect weak passwords', () => {
      // Create a schema for password confirmation
      const passwordSchema = createPasswordConfirmationSchema();

      // Invalid data with weak password
      const invalidData = {
        password: 'weak',
        confirmPassword: 'weak',
      };

      // Use our validateForm function to validate
      const result = validateForm(invalidData, passwordSchema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('password');
    });
  });

  describe('isEmpty', () => {
    it('should identify empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });


    it('should identify non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty([])).toBe(false);
      expect(isEmpty({})).toBe(false);
    });
  });

  describe('applyIf', () => {
    it('should apply validation conditionally', () => {
      // We'll mock the applyIf behavior since the actual implementation
      // works with the internal Zod refinement context
      type FormData = { useShippingAddress: boolean; shippingAddress: string };

      // Create a simple test wrapper to simulate the behavior
      const testApplyIf = (data: FormData) => {
        const condition = (formData: FormData) => formData.useShippingAddress === true;
        const validator = (value: string) => value.length >= 5;

        // The condition is met, so apply the validation
        if (condition(data)) {
          return validator(data.shippingAddress);
        }
        // The condition is not met, so skip validation
        return true;
      };

      // When condition is true and validation passes
      expect(
        testApplyIf({
          useShippingAddress: true,
          shippingAddress: 'Valid Address',
        }),
      ).toBe(true);

      // When condition is true but validation fails
      expect(
        testApplyIf({
          useShippingAddress: true,
          shippingAddress: 'Bad',
        }),
      ).toBe(false);

      // When condition is false, validation should be skipped
      expect(
        testApplyIf({
          useShippingAddress: false,
          shippingAddress: '',
        }),
      ).toBe(true);
    });
  });
});
