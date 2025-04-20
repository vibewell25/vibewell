import { NextResponse } from 'next/server';
import { generateRegistration } from '@/lib/auth/webauthn-service';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const options = await generateRegistration(userId);
    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 