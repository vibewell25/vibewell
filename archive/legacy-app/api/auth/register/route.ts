import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // In a real app, we would validate the request body,
    // hash the password, and store the user in a database
    const body = await request.json();
    
    // Mock successful registration 
    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: body.email,
        name: body.name || 'User',
        createdAt: new Date().toISOString()
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Registration failed' 
    }, { status: 400 });
  }
} 