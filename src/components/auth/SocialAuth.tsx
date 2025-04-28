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

export {};
