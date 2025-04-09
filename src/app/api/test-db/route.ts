import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET() {
  try {
    // Test the connection by querying the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: 'Database connection failed', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: data || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
} 