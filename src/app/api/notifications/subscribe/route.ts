import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// In a real app, you'd store subscriptions in a database
const subscriptions: Record<string, any> = {};

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    // Check if VAPID keys are available
    if (!process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || !process.env.WEB_PUSH_PRIVATE_KEY) {
      console.warn('Web Push VAPID keys are missing, returning mock response');
      return NextResponse.json({
        success: true,
        message: 'Subscription saved successfully (mock response - VAPID keys not configured)',
      });
    }

    // Set VAPID details for web push
    webpush.setVapidDetails(
      'mailto:support@vibewell.com',
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY
    );

    // Save subscription to database (simulated)
    console.log('Received subscription:', subscription);

    // Send a test notification
    const payload = JSON.stringify({
      title: 'Welcome to VibeWell',
      body: 'You will now receive notifications for important updates.',
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({
      success: true,
      message: 'Subscription saved and test notification sent',
    });
  } catch (error) {
    console.error('Error in subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process subscription',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ topics: Object.keys(subscriptions) }, { status: 200 });
}
