import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface EmailVerificationProps {
  email: string;
  onResendVerification: () => Promise<void>;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onResendVerification,
}) => {
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await onResendVerification();
      toast.success('Verification email sent successfully');
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification email to{' '}
            <span className="font-medium text-indigo-600">{email}</span>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-white shadow-sm p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please check your email and click the verification link to continue.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="btn-secondary"
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
            <button onClick={() => router.push('/auth/signin')} className="btn-primary">
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
