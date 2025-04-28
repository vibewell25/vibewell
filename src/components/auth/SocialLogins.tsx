import React from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaFacebook, FaApple, FaTwitter } from 'react-icons/fa';

interface SocialLoginsProps {
  callbackUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Component for rendering social login options
 */
const SocialLogins: React.FC<SocialLoginsProps> = ({
  callbackUrl = '/dashboard',
  onSuccess,
  onError,
}) => {
  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        onError?.(result.error);
      } else if (result?.ok && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="w-full space-y-3">
      <p className="mb-4 text-center text-sm text-gray-600">Or continue with</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Google Login */}
        <button
          onClick={() => handleSocialLogin('google')}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Sign in with Google"
        >
          <FaGoogle className="mr-2 h-5 w-5 text-red-500" />
          <span>Google</span>
        </button>

        {/* Facebook Login */}
        <button
          onClick={() => handleSocialLogin('facebook')}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Sign in with Facebook"
        >
          <FaFacebook className="mr-2 h-5 w-5 text-blue-600" />
          <span>Facebook</span>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Apple Login */}
        <button
          onClick={() => handleSocialLogin('apple')}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Sign in with Apple"
        >
          <FaApple className="mr-2 h-5 w-5 text-black" />
          <span>Apple</span>
        </button>

        {/* Twitter Login */}
        <button
          onClick={() => handleSocialLogin('twitter')}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Sign in with Twitter"
        >
          <FaTwitter className="mr-2 h-5 w-5 text-blue-400" />
          <span>Twitter</span>
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        By signing in, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default SocialLogins;
