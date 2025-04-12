import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys - in production these should be environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const vapidPrivateKey = process.env.FIREBASE_VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@vibewell.com';

webpush.setVapidDetails(
  vapidSubject,
  vapidPublicKey || '',
  vapidPrivateKey || ''
);

// In a real app, you'd store subscriptions in a database
const subscriptions: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { token, topic } = body;

    if (!token || !topic) {
      return NextResponse.json(
        { error: 'Token and topic are required' },
        { status: 400 }
      );
    }

    // Store the subscription by topic
    if (!subscriptions[topic]) {
      subscriptions[topic] = new Set();
    }
    
    subscriptions[topic].add(token);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to topic' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { topics: Object.keys(subscriptions) },
    { status: 200 }
  );
} 