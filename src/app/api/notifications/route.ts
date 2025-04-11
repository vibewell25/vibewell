import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Sample notifications data - In a real app, this would come from a database
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New message received',
    message: 'You have a new message from Jane Smith',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    userId: 'user123',
    link: '/messages?id=msg789',
  },
  {
    id: '2',
    title: 'Booking confirmed',
    message: 'Your appointment with Dr. Johnson has been confirmed',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    userId: 'user123',
    link: '/bookings/bk456',
  },
  {
    id: '3',
    title: 'Payment successful',
    message: 'Your payment of $75.00 has been processed successfully',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    userId: 'user123',
    link: '/payments/pm123',
  },
  {
    id: '4',
    title: 'Profile update required',
    message: 'Please complete your profile to access all features',
    type: 'error',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    userId: 'user123',
    link: '/profile',
  },
  {
    id: '5',
    title: 'New feature available',
    message: 'Try our new virtual try-on experience',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    userId: 'user123',
    link: '/try-on',
  },
];

// Schema for creating a notification
const createNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum(['success', 'error', 'info', 'default']).default('info'),
  link: z.string().optional(),
});

/**
 * GET /api/notifications
 * Retrieves a list of notifications for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id
        }
      })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Creates a new notification
 */
export async function POST(request: NextRequest) {
  // Check for authentication and admin privileges
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createNotificationSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    const { title, message, type, link } = validatedData.data;
    
    // In a real app, you would store the notification in a database
    const newNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: body.userId, // Target user ID
      link: link || undefined,
    };
    
    // Here we would save the notification to the database
    
    return NextResponse.json({
      notification: newNotification,
      success: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await request.json();

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: session.user.id
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
} 