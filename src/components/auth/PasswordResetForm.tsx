import React, { useState } from 'react';

interface PasswordResetFormProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
  success?: boolean;
  error?: string;
}

export function PasswordResetForm({ 
  onSubmit, 
  isLoading = false, 
  success = false, 
  error 
}: PasswordResetFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="password-reset-form-container">
      <h2>Reset Password</h2>
      {error && <div className="error-message">{error}</div>}
      {success ? (
        <div className="success-message">
          If an account exists with that email, you will receive instructions to reset your password.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              data-testid="email-input"
            />
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isLoading}
              data-testid="reset-button"
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
          <div className="form-links">
            <a href="/login">Back to login</a>
          </div>
        </form>
      )}
    </div>
  );
} 