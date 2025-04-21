import React from 'react';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { SocialIcon } from './SocialIcons';

interface SocialAuthProps {
  providers: {
    id: string;
    name: string;
  }[];
}

export const SocialAuth: React.FC<SocialAuthProps> = ({ providers }) => {
  const handleSocialSignIn = async (providerId: string) => {
    try {
      await signIn(providerId, { callbackUrl: '/' });
    } catch (error) {
      toast.error('Failed to sign in with social provider');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {providers.map(provider => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleSocialSignIn(provider.id)}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <SocialIcon provider={provider.id} className="h-5 w-5" />
            <span className="ml-2">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
