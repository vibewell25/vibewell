import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

// Define type for component props
interface AuthButtonProps {
  className?: string;
  loginButtonText?: string;
  logoutButtonText?: string;
  loginRedirectUrl?: string;
  logoutRedirectUrl?: string;
}

export default function AuthButton({
  className = '',
  loginButtonText = 'Log In',
  logoutButtonText = 'Log Out',
  loginRedirectUrl = '/dashboard',
  logoutRedirectUrl = '/',
}: AuthButtonProps) {
  const { user, isLoading, error } = useUser();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Handle login/logout click with debounce
  const handleAuthClick = () => {
    setIsButtonDisabled(true);
    // Re-enable the button after a short delay
    setTimeout(() => setIsButtonDisabled(false), 2000);
  };

  if (error) {
    return (
      <button
        className={`inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white ${className}`}
        disabled
      >
        Error
      </button>
    );
  }

  if (isLoading) {
    return (
      <button
        className={`inline-flex items-center rounded-md bg-gray-400 px-4 py-2 text-sm font-medium text-white ${className}`}
        disabled
      >
        <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <Link
        href="/api/auth/logout"
        onClick={handleAuthClick}
        className={`inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${className}`}
        aria-disabled={isButtonDisabled}
      >
        {logoutButtonText}
      </Link>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      onClick={handleAuthClick}
      className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 ${className}`}
      aria-disabled={isButtonDisabled}
    >
      {loginButtonText}
    </Link>
  );
}
