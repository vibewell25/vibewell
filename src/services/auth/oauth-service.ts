export type SupportedOAuthProvider = 'google' | 'facebook' | 'apple' | 'twitter';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

interface OAuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    provider: SupportedOAuthProvider;
  };
}

export class OAuthService {
  private static configs: Record<SupportedOAuthProvider, OAuthConfig> = {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
    },
    facebook: {
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`,
    },
    apple: {
      clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/apple`,
    },
    twitter: {
      clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/twitter`,
    },
  };

  static async initiateOAuth(provider: SupportedOAuthProvider): Promise<string> {
    const config = this.configs[provider];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      response_type: 'code',
      scope: this.getScope(provider),
    });

    return this.getAuthorizationUrl(provider, params);
  }

  static async handleCallback(
    provider: SupportedOAuthProvider,
    code: string,
  ): Promise<OAuthResponse> {
    const config = this.configs[provider];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const tokenResponse = await this.exchangeCodeForToken(provider, code, config);
    const userInfo = await this.fetchUserInfo(provider, tokenResponse.access_token);

    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture,
        provider,
      },
    };
  }

  private static getScope(provider: SupportedOAuthProvider): string {
    switch (provider) {
      case 'google':
        return 'openid email profile';
      case 'facebook':
        return 'email,public_profile';
      case 'apple':
        return 'name email';
      case 'twitter':
        return 'users.read tweet.read';
      default:
        return '';
    }
  }

  private static getAuthorizationUrl(
    provider: SupportedOAuthProvider,
    params: URLSearchParams,
  ): string {
    switch (provider) {
      case 'google':
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      case 'facebook':
        return `https://www.facebook.com/v12.0/dialog/oauth?${params}`;
      case 'apple':
        return `https://appleid.apple.com/auth/authorize?${params}`;
      case 'twitter':
        return `https://twitter.com/i/oauth2/authorize?${params}`;
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  private static async exchangeCodeForToken(
    provider: SupportedOAuthProvider,
    code: string,
    config: OAuthConfig,
  ): Promise<any> {
    const tokenEndpoint = this.getTokenEndpoint(provider);
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  private static getTokenEndpoint(provider: SupportedOAuthProvider): string {
    switch (provider) {
      case 'google':
        return 'https://oauth2.googleapis.com/token';
      case 'facebook':
        return 'https://graph.facebook.com/v12.0/oauth/access_token';
      case 'apple':
        return 'https://appleid.apple.com/auth/token';
      case 'twitter':
        return 'https://api.twitter.com/2/oauth2/token';
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  private static async fetchUserInfo(
    provider: SupportedOAuthProvider,
    accessToken: string,
  ): Promise<any> {
    const userInfoEndpoint = this.getUserInfoEndpoint(provider);
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  private static getUserInfoEndpoint(provider: SupportedOAuthProvider): string {
    switch (provider) {
      case 'google':
        return 'https://www.googleapis.com/oauth2/v3/userinfo';
      case 'facebook':
        return 'https://graph.facebook.com/v12.0/me?fields=id,name,email,picture';
      case 'apple':
        return 'https://appleid.apple.com/auth/userinfo';
      case 'twitter':
        return 'https://api.twitter.com/2/users/me';
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }
}
