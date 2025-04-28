import { getSession, updateSession } from '@auth0/nextjs-auth0';

// Interface for Auth0 user profile
export interface Auth0UserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
  [key: string]: any; // For custom properties
}

// Main Auth0 client wrapper
class Auth0ClientWrapper {
  private domain: string;
  private clientId: string;
  private clientSecret: string;
  private audience: string;

  constructor() {
    this.domain = process.env.AUTH0_ISSUER_BASE_URL || '';
    this.clientId = process.env.AUTH0_CLIENT_ID || '';
    this.clientSecret = process.env.AUTH0_CLIENT_SECRET || '';
    this.audience = process.env.AUTH0_AUDIENCE || '';

    // Remove https:// if present
    this.domain = this.domain.replace(/^https?:\/\//, '');
  }

  // Log in with email and password using the Auth0 Management API
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
    realm?: string;
    scope?: string;
  }) {
    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        username,
        password,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: this.audience,
        scope: 'openid profile email',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Authentication failed');
    }

    return await response.json();
  }

  // Get user profile with access token
  async getProfile(accessToken: string): Promise<Auth0UserProfile> {
    const response = await fetch(`https://${this.domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return await response.json();
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  }

  // Get the current session
  async getSession() {
    return getSession();
  }

  // Update the session
  async updateSession(session: any) {
    return updateSession({ session });
  }
}

// Singleton instance
let auth0Instance: Auth0ClientWrapper | null = null;

// Get the Auth0 client
export function getAuth0Client() {
  if (!auth0Instance) {
    auth0Instance = new Auth0ClientWrapper();
  }
  return auth0Instance;
}
