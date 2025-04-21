import { logger } from './logger';

interface ShareOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

interface SocialPlatformConfig {
  facebook?: {
    appId: string;
  };
  twitter?: {
    handle: string;
  };
  instagram?: {
    username: string;
  };
}

export class SocialSharingService {
  private config: SocialPlatformConfig;

  constructor(config: SocialPlatformConfig) {
    this.config = config;
  }

  async shareToFacebook(options: ShareOptions): Promise<string> {
    try {
      const url = new URL('https://www.facebook.com/dialog/share');
      url.searchParams.append('app_id', this.config.facebook?.appId || '');
      url.searchParams.append('href', options.url);
      url.searchParams.append('quote', options.description);
      url.searchParams.append('hashtag', options.hashtags?.[0] ? `#${options.hashtags[0]}` : '');

      const shareUrl = url.toString();
      logger.info(`Generated Facebook share URL: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating Facebook share URL: ${errorMessage}`);
      throw error;
    }
  }

  async shareToTwitter(options: ShareOptions): Promise<string> {
    try {
      const url = new URL('https://twitter.com/intent/tweet');
      const text = `${options.title}\n${options.description}`;
      const hashtags = options.hashtags?.join(',') || '';

      url.searchParams.append('text', text);
      url.searchParams.append('url', options.url);
      url.searchParams.append('hashtags', hashtags);
      if (this.config.twitter?.handle) {
        url.searchParams.append('via', this.config.twitter.handle);
      }

      const shareUrl = url.toString();
      logger.info(`Generated Twitter share URL: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating Twitter share URL: ${errorMessage}`);
      throw error;
    }
  }

  async shareToLinkedIn(options: ShareOptions): Promise<string> {
    try {
      const url = new URL('https://www.linkedin.com/sharing/share-offsite/');
      url.searchParams.append('url', options.url);
      url.searchParams.append('title', options.title);
      url.searchParams.append('summary', options.description);
      if (options.image) {
        url.searchParams.append('source', options.image);
      }

      const shareUrl = url.toString();
      logger.info(`Generated LinkedIn share URL: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating LinkedIn share URL: ${errorMessage}`);
      throw error;
    }
  }

  async shareToWhatsApp(options: ShareOptions): Promise<string> {
    try {
      const url = new URL('https://wa.me/');
      const text = `${options.title}\n\n${options.description}\n\n${options.url}`;
      url.searchParams.append('text', text);

      const shareUrl = url.toString();
      logger.info(`Generated WhatsApp share URL: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating WhatsApp share URL: ${errorMessage}`);
      throw error;
    }
  }

  async generateShareLinks(options: ShareOptions): Promise<Record<string, string>> {
    try {
      const [facebook, twitter, linkedin, whatsapp] = await Promise.all([
        this.shareToFacebook(options),
        this.shareToTwitter(options),
        this.shareToLinkedIn(options),
        this.shareToWhatsApp(options),
      ]);

      return {
        facebook,
        twitter,
        linkedin,
        whatsapp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating share links: ${errorMessage}`);
      throw error;
    }
  }
}

export const socialSharingService = new SocialSharingService({
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
  },
  twitter: {
    handle: process.env.TWITTER_HANDLE || '',
  },
  instagram: {
    username: process.env.INSTAGRAM_USERNAME || '',
  },
});
