import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, we would use a WebAuthn library to generate
    // registration options for the user
    const body = await request.json();
    
    // Return mock WebAuthn registration options
    return NextResponse.json({
      success: true,
      challenge: Array.from(crypto.getRandomValues(new Uint8Array(32))),
      rp: {
        name: "VibeWell App",
        id: request.headers.get('host') || "localhost"
      },
      user: {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: body.email || 'user@example.com',
        displayName: body.name || 'User'
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 } // RS256
      ],
      timeout: 60000,
      attestation: "direct"
    });
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to generate WebAuthn registration options' 
    }, { status: 400 });
  }
} 