import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RecoveryCodeService } from '@/services/recovery-code-service';
import { rateLimiter } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

const recoveryCodeService = new RecoveryCodeService();

// Rate limit configuration for recovery code operations
const RATE_LIMIT = {
  GENERATE: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // 3 generations per day
  },
  VERIFY: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, code } = body;

    switch (action) {
      case 'generate': {
        // Check rate limit for generation
        const limited = await rateLimiter.isRateLimited(
          `recovery:generate:${session.user.id}`,
          RATE_LIMIT.GENERATE
        );
        if (limited) {
          return NextResponse.json(
            { error: 'Too many recovery code generations' },
            { status: 429 }
          );
        }

        const codes = await recoveryCodeService.generateRecoveryCodes(session.user.id);
        return NextResponse.json({ codes });
      }

      case 'verify': {
        if (!code) {
          return NextResponse.json({ error: 'Recovery code is required' }, { status: 400 });
        }

        // Check rate limit for verification
        const limited = await rateLimiter.isRateLimited(
          `recovery:verify:${session.user.id}`,
          RATE_LIMIT.VERIFY
        );
        if (limited) {
          return NextResponse.json({ error: 'Too many verification attempts' }, { status: 429 });
        }

        const isValid = await recoveryCodeService.verifyRecoveryCode(session.user.id, code);

        if (!isValid) {
          return NextResponse.json({ error: 'Invalid recovery code' }, { status: 401 });
        }

        return NextResponse.json({ success: true });
      }

      case 'count': {
        const count = await recoveryCodeService.getRemainingCodeCount(session.user.id);
        return NextResponse.json({ count });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Recovery code operation failed', 'security', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
