import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { cn } from '@/lib/utils';

export type SocialProvider = 'google' | 'facebook' | 'twitter' | 'linkedin' | 'github';

interface SocialLoginProviderConfig {
  id: SocialProvider;
  name: string;
  icon: IconType;
  className?: string;
  buttonText?: string;
}

const providers: Record<SocialProvider, SocialLoginProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google',
    icon: FaGoogle,
    className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    className: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    icon: FaTwitter,
    className: 'bg-blue-400 text-white hover:bg-blue-500',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    className: 'bg-blue-700 text-white hover:bg-blue-800',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: FaGithub,
    className: 'bg-gray-900 text-white hover:bg-black',
  },
};

export interface SocialButtonProps {
  providerId: SocialProvider;
  className?: string;
  buttonText?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  callbackUrl?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  providerId,
  className,
  buttonText,
  onSuccess,
  onError,
  callbackUrl = window.location.origin,
}) => {
  const provider = providers[providerId];
  const Icon = provider.icon;
  const displayText = buttonText || `Sign in with ${provider.name}`;

  const handleSignIn = async () => {
    try {
      const result = await signIn(providerId, {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        onError?.(new Error(result.error));
      } else if (result?.url && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('An unknown error occurred'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        provider.className,
        className
      )}
      aria-label={`Sign in with ${provider.name}`}
    >
      <Icon aria-hidden="true" className="w-5 h-5" />
      <span>{displayText}</span>
    </button>
  );
};

export interface SocialLoginProps {
  providers?: SocialProvider[];
  className?: string;
  buttonClassName?: string;
  vertical?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  callbackUrl?: string;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  providers: selectedProviders = ['google', 'facebook', 'github'],
  className,
  buttonClassName,
  vertical = false,
  onSuccess,
  onError,
  callbackUrl,
}) => {
  return (
    <div
      className={cn(
        'flex gap-3', 
        vertical ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {selectedProviders.map((providerId) => (
        <SocialButton
          key={providerId}
          providerId={providerId}
          className={buttonClassName}
          onSuccess={onSuccess}
          onError={onError}
          callbackUrl={callbackUrl}
        />
      ))}
    </div>
  );
};

export default SocialLogin; 