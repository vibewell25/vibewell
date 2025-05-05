import { NextRequest, NextResponse } from 'next/server';


import { isAuthenticated, getAuthState } from '@/hooks/useAuth';

import { prisma } from '@/lib/prisma';

import { logger } from '@/utils/logger';

/**

    * PUT /api/notifications/[id]/read
 * Marks a specific notification as read for the authenticated user
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if the user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Get user ID from auth state
    const { user } = await getAuthState();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
// Find the notification
    const notification = await prisma.notification.findUnique({
      where: { id },
// Check if notification exists
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
// Check if the notification belongs to the authenticated user
    if (notification.userId !== user.id) {
      logger.warn(
        `User ${user.id} attempted to mark notification ${id} as read belonging to user ${notification.userId}`,
return NextResponse.json(
        { error: 'Unauthorized to update this notification' },
        { status: 403 },
// If notification is already read, no need to update
    if (notification.read) {
      return NextResponse.json({
        success: true,
        message: 'Notification already marked as read',
        updated: false,
// Update the notification
    await prisma.notification.update({
      where: { id },
      data: { read: true },
logger.info(`Notification ${id} marked as read by user ${user.id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      updated: true,
catch (error) {
    logger.error(
      'Error marking notification as read',
      error instanceof Error ? error.message : String(error),
return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
