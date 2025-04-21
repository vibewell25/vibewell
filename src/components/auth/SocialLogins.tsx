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
      <p className="text-center text-sm text-gray-600 mb-4">
        Or continue with
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Google Login */}
        <button
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Sign in with Google"
        >
          <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
          <span>Google</span>
        </button>

        {/* Facebook Login */}
        <button
          onClick={() => handleSocialLogin('facebook')}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Sign in with Facebook"
        >
          <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
          <span>Facebook</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* Apple Login */}
        <button
          onClick={() => handleSocialLogin('apple')}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Sign in with Apple"
        >
          <FaApple className="h-5 w-5 text-black mr-2" />
          <span>Apple</span>
        </button>

        {/* Twitter Login */}
        <button
          onClick={() => handleSocialLogin('twitter')}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Sign in with Twitter"
        >
          <FaTwitter className="h-5 w-5 text-blue-400 mr-2" />
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