import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getAuthState } from '@/hooks/use-unified-auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';

/**
 * GET /api/notifications?page=1&limit=10&filter=all|unread|read
 * Fetches paginated notifications for the authenticated user with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from auth state
    const { user } = await getAuthState();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all';

    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Build where clause based on filter
    const where: any = { userId: user.id };
    if (filter === 'read') {
      where.read = true;
    } else if (filter === 'unread') {
      where.read = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.notification.count({ where });

    // Calculate pagination values
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    logger.info(`Fetched ${notifications.length} notifications for user ${user.id}`);

    // Return paginated response
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error(
      'Error fetching notifications',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Creates a new notification for a user (admin/system use)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin/system permission
    // This is a placeholder - implement actual admin/system authorization check
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user has permission to create notifications
    const { user } = await getAuthState();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { userId, title, message, type, linkUrl } = body;

    // Validate required fields
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message, and type are required' },
        { status: 400 },
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl: linkUrl || null,
        read: false,
      },
    });

    logger.info(`Admin ${user.id} created notification for user ${userId}`);

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    logger.error(
      'Error creating notification',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

/**
 * PUT /api/notifications
 * Batch updates notifications (deprecated - use more specific endpoints)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from auth state
    const { user } = await getAuthState();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const { notificationIds } = await request.json();

    // Validate request
    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid request body - notificationIds must be an array' },
        { status: 400 },
      );
    }

    // Update notifications to mark them as read
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: user.id,
      },
      data: {
        read: true,
      },
    });

    logger.info(`Marked ${result.count} notifications as read for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count,
    });
  } catch (error) {
    logger.error(
      'Error marking notifications as read',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
