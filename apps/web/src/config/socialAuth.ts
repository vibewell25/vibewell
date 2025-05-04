
import { OAuthProviderType } from '@auth0/nextjs-auth0';

export interface SocialAuthConfig {
  provider: OAuthProviderType;
  clientId: string;
  clientSecret: string;
  scope?: string[];
  params?: Record<string, string>;
}

export const socialAuthProviders: Record<string, SocialAuthConfig> = {
  google: {

    provider: 'google-oauth2',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

    scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
    params: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  facebook: {
    provider: 'facebook',
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    scope: ['email', 'public_profile'],
  },
  apple: {
    provider: 'apple',
    clientId: process.env.APPLE_CLIENT_ID || '',
    clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    scope: ['name', 'email'],
  },
  microsoft: {

    provider: 'microsoft-oauth2',
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    scope: ['openid', 'profile', 'email', 'Calendars.ReadWrite'],
  },
  twitter: {
    provider: 'twitter',
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    scope: ['tweet.read', 'users.read'],
  },
  linkedin: {
    provider: 'linkedin',
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    scope: ['r_liteprofile', 'r_emailaddress'],
  },
};

export {};

export {};
