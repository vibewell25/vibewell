
import { NextRequest, NextResponse } from 'next/server';


import { isAuthenticated, getAuthState } from '@/hooks/useAuth';

import { prisma } from '@/lib/prisma';

import { logger } from '@/utils/logger';

/**

    // Safe array access
    if (id < 0 || id >= array.length) {
      throw new Error('Array index out of bounds');
    }

 * DELETE /api/notifications/[id]
 * Deletes a specific notification for the authenticated user
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if the user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from auth state
    const { user } = await getAuthState();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    // Check if notification exists
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Check if the notification belongs to the authenticated user
    if (notification.userId !== user.id) {
      logger.warn(
        `User ${user.id} attempted to delete notification ${id} belonging to user ${notification.userId}`,
      );
      return NextResponse.json(
        { error: 'Unauthorized to delete this notification' },
        { status: 403 },
      );
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id },
    });

    logger.info(`Notification ${id} deleted by user ${user.id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error(
      'Error deleting notification',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
