import React from 'react';
import { Button } from '../ui/button';
import { SupportedOAuthProvider } from '../../services/auth/oauth-service';
import { Apple, Facebook, Twitter, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

interface OAuthButtonProps {
  provider: SupportedOAuthProvider;
  onLogin: (provider: SupportedOAuthProvider) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const providerConfig = {
  google: {
    icon: FcGoogle,
    label: 'Continue with Google',
    className: 'bg-white text-gray-900 hover:bg-gray-50',
  },
  facebook: {
    icon: Facebook,
    label: 'Continue with Facebook',
    className: 'bg-[#1877F2] text-white hover:bg-[#0C63D4]',
  },
  apple: {
    icon: Apple,
    label: 'Continue with Apple',
    className: 'bg-black text-white hover:bg-gray-900',
  },
  twitter: {
    icon: Twitter,
    label: 'Continue with Twitter',
    className: 'bg-[#1DA1F2] text-white hover:bg-[#0C8BD9]',
  },
};

export {};
