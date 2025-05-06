import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';
import { apiRateLimiter, applyRateLimit } from '@/app/api/auth/rate-limit-middleware';
import { getSession } from '@auth0/nextjs-auth0';

// Schema for validating share requests
const shareRequestSchema = z.object({
  url: z.string().url(),
  platform: z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'email', 'sms', 'whatsapp', 'copy', 'qrcode']),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  productId: z.string().optional(),
});

// Define social platform URLs and configurations
const PLATFORM_CONFIGS = {
  facebook: {
    shareUrl: 'https://www.facebook.com/sharer/sharer.php?u=',
    appIdParam: env.NEXT_PUBLIC_FACEBOOK_APP_ID ? `&app_id=${env.NEXT_PUBLIC_FACEBOOK_APP_ID}` : '',
  },
  twitter: {
    shareUrl: 'https://twitter.com/intent/tweet?url=',
    handleParam: env.NEXT_PUBLIC_TWITTER_HANDLE ? `&via=${env.NEXT_PUBLIC_TWITTER_HANDLE}` : '',
  },
  linkedin: {
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  },
  whatsapp: {
    shareUrl: 'https://api.whatsapp.com/send?text=',
  },
  email: {
    shareUrl: 'mailto:?body=',
  },
};

// Generate QR code URL
function generateQRCodeUrl(url: string): string {
  if (env.QR_CODE_SERVICE_URL && env.QR_CODE_SERVICE_API_KEY) {
    return `${env.QR_CODE_SERVICE_URL}?api_key=${env.QR_CODE_SERVICE_API_KEY}&data=${encodeURIComponent(url)}`;
  }
  
  // Fallback to a free public QR code service
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
}

/**
 * POST handles social sharing requests
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = shareRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { url, platform, title, description, image, productId } = result.data;
    
    // Get user session if available
    const session = await getSession();
    const userId = session?.user?.sub;
    
    // Track share event in analytics
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'share',
        page: new URL(url).pathname,
        timestamp: new Date(),
        userId: userId || 'anonymous',
        sessionId: req.cookies.get('sid')?.value || 'anonymous',
        metadata: {
          platform,
          url,
          title,
          productId,
        },
      },
    });

    // Generate sharing data based on platform
    let shareData: any = {
      success: true,
      platform,
    };

    switch (platform) {
      case 'facebook':
        shareData.shareUrl = `${PLATFORM_CONFIGS.facebook.shareUrl}${encodeURIComponent(url)}${PLATFORM_CONFIGS.facebook.appIdParam}`;
        break;
        
      case 'twitter':
        const tweetText = title ? `${title}: ` : '';
        shareData.shareUrl = `${PLATFORM_CONFIGS.twitter.shareUrl}${encodeURIComponent(url)}&text=${encodeURIComponent(tweetText)}${PLATFORM_CONFIGS.twitter.handleParam}`;
        break;
        
      case 'linkedin':
        shareData.shareUrl = `${PLATFORM_CONFIGS.linkedin.shareUrl}${encodeURIComponent(url)}`;
        break;
        
      case 'whatsapp':
        const whatsappText = title ? `${title}: ${url}` : url;
        shareData.shareUrl = `${PLATFORM_CONFIGS.whatsapp.shareUrl}${encodeURIComponent(whatsappText)}`;
        break;
        
      case 'email':
        const emailSubject = title || 'Check this out';
        const emailBody = `${title ? title + '\n\n' : ''}${description ? description + '\n\n' : ''}${url}`;
        shareData.shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
        
      case 'qrcode':
        shareData.qrCodeUrl = generateQRCodeUrl(url);
        break;
        
      case 'copy':
      case 'sms':
      case 'instagram':
        // These platforms just need the original URL
        shareData.url = url;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    return NextResponse.json(shareData);
  } catch (error) {
    console.error('Error processing share request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
