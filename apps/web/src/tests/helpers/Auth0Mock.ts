

import type { UserProfile as User } from '@auth0/nextjs-auth0/client';

const mockUser: User = {
  email: 'test@example.com',
  email_verified: true,
  name: 'Test User',
  nickname: 'testuser',

  picture: 'https://example.com/avatar.jpg',
  sub: 'auth0|123456789',
  updated_at: '2024-03-21T00:00:00.000Z'
};

export const mockAuth0 = {
  getSession: () => ({
    user: mockUser,

    accessToken: 'mock-access-token',

    idToken: 'mock-id-token',

    refreshToken: 'mock-refresh-token',
    accessTokenExpiresAt: new Date(Date.now() + 3600000),
  }),
  withApiAuthRequired: (handler: any) => handler,
  withPageAuthRequired: (handler: any) => handler,
};

export const mockUseUser = () => ({
  user: mockUser,
  error: null,
  isLoading: false,
}); 