import React from 'react';
import type { SocialProvider } from './SocialLogin';
import SocialLogin from './SocialLogin';

interface SocialProviderConfig {
  id: SocialProvider;
  label: string;
  icon: React.ReactNode;
}

const socialProviders: SocialProviderConfig[] = [
  {
    id: 'google-oauth2',
    label: 'Google',
    icon: <span className="w-5 h-5">G</span>,
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: <span className="w-5 h-5">GH</span>,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: <span className="w-5 h-5">F</span>,
  },
];

export default function SocialLogins() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {socialProviders.map((provider) => (
        <SocialLogin
          key={provider.id}
          provider={provider.id}
          label={provider.label}
          icon={provider.icon}
        />
      ))}
    </div>
  );
}
