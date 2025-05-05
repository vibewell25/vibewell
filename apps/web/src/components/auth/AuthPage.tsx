import React from 'react';
import { OAuthButton } from './oauth-button';
import { MagicLinkForm } from './magic-link-form';
import { WebAuthnButton } from '../web-authn-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { SupportedOAuthProvider } from '../../services/auth/oauth-service';

interface AuthPageProps {
  mode: 'login' | 'register';
  onOAuthLogin: (provider: SupportedOAuthProvider) => Promise<void>;
  onMagicLinkSubmit: (email: string) => Promise<void>;
  onWebAuthnSuccess: (response: any) => void;
  onWebAuthnError: (error: Error) => void;
  className?: string;
export {};
