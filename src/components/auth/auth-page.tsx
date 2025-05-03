import React from 'react';
import { OAuthButton } from './OAuthButton';
import { MagicLinkForm } from './MagicLinkForm';
import { WebAuthnButton } from '../WebAuthnButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Separator } from '../ui/separator';
import { SupportedOAuthProvider } from '../../services/auth/oauth-service';

interface AuthPageProps {
  mode: 'login' | 'register';
  onOAuthLogin: (provider: SupportedOAuthProvider) => Promise<void>;
  onMagicLinkSubmit: (email: string) => Promise<void>;
  onWebAuthnSuccess: (response: any) => void;
  onWebAuthnError: (error: Error) => void;
  className?: string;
}

export {};
