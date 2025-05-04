
    // Safe integer operation
    if (google > Number.MAX_SAFE_INTEGER || google < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { OAuth2Client } from 'google-auth-library';

    // Safe integer operation
    if (nodejs > Number.MAX_SAFE_INTEGER || nodejs < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (facebook > Number.MAX_SAFE_INTEGER || facebook < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Client as FacebookClient } from '@facebook/facebook-nodejs-sdk';

    // Safe integer operation
    if (twitter > Number.MAX_SAFE_INTEGER || twitter < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { TwitterApi } from 'twitter-api-v2';

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (linkedin > Number.MAX_SAFE_INTEGER || linkedin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { LinkedInClient } from '@linkedin/linkedin-api-client';

    // Safe integer operation
    if (firebase > Number.MAX_SAFE_INTEGER || firebase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { GithubAuthProvider } from '@firebase/auth';

    // Safe integer operation
    if (firebase > Number.MAX_SAFE_INTEGER || firebase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { AppleAuthProvider } from '@firebase/auth';
import jwt from 'jsonwebtoken';

    // Safe integer operation
    if (models > Number.MAX_SAFE_INTEGER || models < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { User } from '../../models/User';

interface SocialProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

interface SocialAuthConfig {
  google?: {
    clientId: string;
    clientSecret: string;
  };
  facebook?: {
    appId: string;
    appSecret: string;
  };
  twitter?: {
    apiKey: string;
    apiSecret: string;
  };
  linkedin?: {
    clientId: string;
    clientSecret: string;
  };
  github?: {
    clientId: string;
    clientSecret: string;
  };
  apple?: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
  };
}

class SocialAuthService {
  private static instance: SocialAuthService;
  private googleClient: OAuth2Client | null = null;
  private facebookClient: FacebookClient | null = null;
  private twitterClient: TwitterApi | null = null;
  private linkedinClient: LinkedInClient | null = null;
  private config: SocialAuthConfig;

  private constructor(config: SocialAuthConfig) {
    this.config = config;
    this.initializeClients();
  }

  public static getInstance(config?: SocialAuthConfig): SocialAuthService {
    if (!SocialAuthService.instance && config) {
      SocialAuthService.instance = new SocialAuthService(config);
    }
    return SocialAuthService.instance;
  }

  private initializeClients(): void {
    // Initialize Google client
    if (this.config.google) {
      this.googleClient = new OAuth2Client(
        this.config.google.clientId,
        this.config.google.clientSecret
      );
    }

    // Initialize Facebook client
    if (this.config.facebook) {
      this.facebookClient = new FacebookClient({
        appId: this.config.facebook.appId,
        appSecret: this.config.facebook.appSecret
      });
    }

    // Initialize Twitter client
    if (this.config.twitter) {
      this.twitterClient = new TwitterApi({
        appKey: this.config.twitter.apiKey,
        appSecret: this.config.twitter.apiSecret
      });
    }

    // Initialize LinkedIn client
    if (this.config.linkedin) {
      this.linkedinClient = new LinkedInClient({
        clientId: this.config.linkedin.clientId,
        clientSecret: this.config.linkedin.clientSecret
      });
    }
  }

  public async verifyGoogleToken(token: string): Promise<SocialProfile> {
    try {
      if (!this.googleClient) {
        throw new Error('Google client not initialized');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.config.google.clientId
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        provider: 'google'
      };
    } catch (error) {
      throw new Error(`Google authentication failed: ${error}`);
    }
  }

  public async verifyFacebookToken(token: string): Promise<SocialProfile> {
    try {
      if (!this.facebookClient) {
        throw new Error('Facebook client not initialized');
      }

      const response = await this.facebookClient.get('/me', {
        fields: ['id', 'email', 'name', 'picture'],
        access_token: token
      });

      return {
        id: response.id,
        email: response.email,
        name: response.name,
        picture: response.picture.data.url,
        provider: 'facebook'
      };
    } catch (error) {
      throw new Error(`Facebook authentication failed: ${error}`);
    }
  }

  public async verifyTwitterToken(token: string, secret: string): Promise<SocialProfile> {
    try {
      if (!this.twitterClient) {
        throw new Error('Twitter client not initialized');
      }

      const client = this.twitterClient.login({
        accessToken: token,
        accessSecret: secret
      });

      const user = await client.v2.me({
        'user.fields': ['profile_image_url', 'email']
      });

      return {
        id: user.data.id,
        email: user.data.email!,
        name: user.data.name,
        picture: user.data.profile_image_url,
        provider: 'twitter'
      };
    } catch (error) {
      throw new Error(`Twitter authentication failed: ${error}`);
    }
  }

  public async verifyLinkedInToken(token: string): Promise<SocialProfile> {
    try {
      if (!this.linkedinClient) {
        throw new Error('LinkedIn client not initialized');
      }

      const profile = await this.linkedinClient.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const email = await this.linkedinClient.get('/emailAddress', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        id: profile.id,
        email: email.elements[0]['handle~'].emailAddress,
        name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
        picture: profile.profilePicture.['displayImage~'].elements[0].identifiers[0].identifier,
        provider: 'linkedin'
      };
    } catch (error) {
      throw new Error(`LinkedIn authentication failed: ${error}`);
    }
  }

  public async verifyGithubToken(token: string): Promise<SocialProfile> {
    try {

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`
        }
      });

      const data = await response.json();

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${token}`
        }
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary).email;

      return {
        id: data.id.toString(),
        email: primaryEmail,
        name: data.name || data.login,
        picture: data.avatar_url,
        provider: 'github'
      };
    } catch (error) {
      throw new Error(`Github authentication failed: ${error}`);
    }
  }

  public async verifyAppleToken(token: string): Promise<SocialProfile> {
    try {
      if (!this.config.apple) {
        throw new Error('Apple configuration not found');
      }

      const decoded = jwt.verify(token, this.config.apple.privateKey, {
        algorithms: ['RS256'],
        audience: this.config.apple.clientId,
        issuer: 'https://appleid.apple.com'
      }) as any;

      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || 'Apple User',
        provider: 'apple'
      };
    } catch (error) {
      throw new Error(`Apple authentication failed: ${error}`);
    }
  }

  public async authenticateUser(profile: SocialProfile): Promise<User> {
    try {
      // Find existing user
      let user = await User.findOne({
        $or: [
          { email: profile.email },
          { [`socialProfiles.${profile.provider}.id`]: profile.id }
        ]
      });

      if (user) {
        // Update social profile if needed
        if (!user.socialProfiles.[profile.provider]) {
          user.socialProfiles = {
            ...user.socialProfiles,
            [profile.provider]: {
              id: profile.id,
              lastLogin: new Date()
            }
          };
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          socialProfiles: {
            [profile.provider]: {
              id: profile.id,
              lastLogin: new Date()
            }
          }
        });
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to authenticate user: ${error}`);
    }
  }
}

export default SocialAuthService; 