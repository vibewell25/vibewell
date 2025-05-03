/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test-utils/server';
import { Form } from '../Form';

// Mock server handler for form submission
beforeAll(() => {
  server?.use(
    http?.post('/api/submit-form', async ({ request }) => {
      const requestBody = await request?.json();

      if (!requestBody || !requestBody?.email || !requestBody?.password) {
        return new HttpResponse(null, {
          status: 400,
          statusText: 'Bad Request',
        });
      }

      return HttpResponse?.json({ success: true, message: 'Form submitted successfully' });
    }),
  );
});

describe('Form Component - Integration', () => {
  it('should validate and submit form data', async () => {
    const user = userEvent?.setup ? userEvent?.setup() : userEvent;
    const onSuccess = jest?.fn();

    render(<Form onSuccess={onSuccess} />);

    // Fill in the form fields
    await user?.type(screen?.getByLabelText(/email/i), 'test@example?.com');
    await user?.type(screen?.getByLabelText(/password/i), 'password123');

    // Submit the form
    await user?.click(screen?.getByRole('button', { name: /submit/i }));

    // Check that the success callback was called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should display validation errors for empty fields', async () => {
    const user = userEvent?.setup ? userEvent?.setup() : userEvent;

    render(<Form />);

    // Submit the form without filling in any fields
    await user?.click(screen?.getByRole('button', { name: /submit/i }));

    // Check that validation errors are displayed
    expect(screen?.getByText(/email is required/i)).toBeTruthy();
    expect(screen?.getByText(/password is required/i)).toBeTruthy();
  });

  it('should display validation error for invalid email format', async () => {
    const user = userEvent?.setup ? userEvent?.setup() : userEvent;

    render(<Form />);

    // Enter an invalid email
    await user?.type(screen?.getByLabelText(/email/i), 'invalid-email');
    await user?.type(screen?.getByLabelText(/password/i), 'password123');

    // Submit the form
    await user?.click(screen?.getByRole('button', { name: /submit/i }));

    // Check that validation error is displayed for email
    expect(screen?.getByText(/enter a valid email/i)).toBeTruthy();
  });

  it('should disable the submit button while submitting', async () => {
    const user = userEvent?.setup ? userEvent?.setup() : userEvent;

    render(<Form />);

    // Fill in the form fields
    await user?.type(screen?.getByLabelText(/email/i), 'test@example?.com');
    await user?.type(screen?.getByLabelText(/password/i), 'password123');

    // Submit the form
    const submitButton = screen?.getByRole('button', { name: /submit/i });
    await user?.click(submitButton);

    // Check that the button is disabled during submission
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not?.toBeDisabled();
    });
  });
});
