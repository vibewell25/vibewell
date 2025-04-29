import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { verifyTOTP, TwoFactorError } from '@/lib/2fa';
import { prisma } from '@/lib/prisma';

// Helper to get user ID from session
async function getUserId(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    throw new TwoFactorError('Not authenticated', 'NOT_AUTHENTICATED');
  }
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { auth0Id: session.user.sub },
        { email: session.user.email }
      ]
    }
  });
  if (!user) {
    throw new TwoFactorError('User not found', 'USER_NOT_FOUND');
  }
  return user.id;
}

// Verify 2FA token
export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', code: 'TOKEN_REQUIRED' },
        { status: 400 }
      );
    }

    const result = await verifyTOTP(userId, token);
    
    if (result.success) {
      // Here you can update the session or set additional cookies
      // to indicate successful 2FA verification
      return NextResponse.json({ 
        verified: true,
        method: result.method
      });
    }
    
    return NextResponse.json({ 
      verified: false,
      message: 'Verification failed'
    }, { status: 401 });

  } catch (error) {
    if (error instanceof TwoFactorError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 