import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TrustedDeviceService } from '@/services/trusted-device-service';
import { rateLimiter } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

const trustedDeviceService = new TrustedDeviceService();

// Rate limit configuration
const RATE_LIMIT = {
  REGISTER: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5 // 5 device registrations per day
  },
  VERIFY: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // 10 verifications per 15 minutes
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // Get IP address from request
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Get user agent from request
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const deviceInfo = {
      userAgent,
      ip,
      additionalData: body.additionalData
    };

    switch (action) {
      case 'register': {
        // Check rate limit for registration
        const limited = await rateLimiter.isRateLimited(
          `device:register:${session.user.id}`,
          RATE_LIMIT.REGISTER
        );
        if (limited) {
          return NextResponse.json(
            { error: 'Too many device registrations' },
            { status: 429 }
          );
        }

        const deviceId = await trustedDeviceService.registerDevice(
          session.user.id,
          deviceInfo
        );

        return NextResponse.json({ deviceId });
      }

      case 'verify': {
        // Check rate limit for verification
        const limited = await rateLimiter.isRateLimited(
          `device:verify:${session.user.id}`,
          RATE_LIMIT.VERIFY
        );
        if (limited) {
          return NextResponse.json(
            { error: 'Too many verification attempts' },
            { status: 429 }
          );
        }

        const isValid = await trustedDeviceService.verifyDevice(
          session.user.id,
          deviceInfo
        );

        if (!isValid) {
          return NextResponse.json(
            { error: 'Device not trusted' },
            { status: 401 }
          );
        }

        return NextResponse.json({ success: true });
      }

      case 'list': {
        const devices = await trustedDeviceService.getUserDevices(session.user.id);
        return NextResponse.json({ devices });
      }

      case 'revoke': {
        const { deviceId } = body;
        if (!deviceId) {
          return NextResponse.json(
            { error: 'Device ID is required' },
            { status: 400 }
          );
        }

        await trustedDeviceService.revokeDevice(deviceId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Trusted device operation failed', 'security', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 