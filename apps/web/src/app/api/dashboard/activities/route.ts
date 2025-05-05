import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

interface ContentProgress {
  id: string;
  updatedAt: Date;
  content: {
    title: string;
interface Booking {
  id: string;
  createdAt: Date;
  service: {
    name: string;
interface Review {
  id: string;
  createdAt: Date;
  service: {
    name: string;
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Get recent activities from different sources
    const [contentProgress, bookings, purchases, reviews] = await Promise.all([
      // Content progress
      prisma.contentProgress.findMany({
        where: {
          userId: session.user.id,
          completed: true,
include: {
          content: {
            select: {
              title: true,
orderBy: {
          updatedAt: 'desc',
take: 5,
),
      // Bookings
      prisma.serviceBooking.findMany({
        where: {
          userId: session.user.id,
include: {
          service: {
            select: {
              name: true,
orderBy: {
          createdAt: 'desc',
take: 5,
),
      // Purchases (if implemented)
      Promise.resolve([]),
      // Reviews
      prisma.serviceReview.findMany({
        where: {
          userId: session.user.id,
include: {
          service: {
            select: {
              name: true,
orderBy: {
          createdAt: 'desc',
take: 5,
),
    ]);

    // Format activities
    const activities = [
      ...contentProgress.map((progress: ContentProgress) => ({
        id: progress.id,
        type: 'content' as const,
        title: 'Completed Content',
        description: `Completed "${progress.content.title}"`,
        date: progress.updatedAt.toISOString(),
)),
      ...bookings.map((booking: Booking) => ({
        id: booking.id,
        type: 'booking' as const,
        title: 'Booked Service',
        description: `Booked "${booking.service.name}"`,
        date: booking.createdAt.toISOString(),
)),
      ...reviews.map((review: Review) => ({
        id: review.id,
        type: 'review' as const,
        title: 'Left Review',
        description: `Reviewed "${review.service.name}"`,
        date: review.createdAt.toISOString(),
)),
    ];

    // Sort activities by date and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return NextResponse.json({
      activities: sortedActivities,
catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
