import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating the request body
const eventSchema = z.object({
  event: z.string(),
  properties: z.record(z.any()).optional().default({}),
  session_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate the request body
    const result = eventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { event, properties, session_id } = result.data;
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate unique session ID if not provided
    const sessionId = session_id || 
      Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
    
    // Create the analytics event
    const analyticsEvent = {
      event,
      user_id: user?.id,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      properties,
    };
    
    // Insert the event into the analytics_events table
    const { error } = await supabase
      .from('analytics_events')
      .insert([analyticsEvent]);
    
    if (error) {
      console.error('Error tracking analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics event' },
        { status: 500 }
      );
    }
    
    // Return success response with the session ID for client-side tracking
    return NextResponse.json({
      success: true,
      session_id: sessionId,
      timestamp: analyticsEvent.timestamp,
    });
  } catch (error) {
    console.error('Error in analytics track endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests to this endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 