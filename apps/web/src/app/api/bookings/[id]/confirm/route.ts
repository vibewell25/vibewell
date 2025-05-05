import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import { BookingStatus } from '@prisma/client';

import { CalendarService } from '@/services/calendar-service';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Find the booking with all necessary relations
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        practitioner: {
          include: {
            user: true,
user: true,
        beautyService: true,
        business: true,
if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
// Check if user has permission to confirm this booking
    if (booking.userId !== session.user.id && booking.practitioner.userId !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
// Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: BookingStatus.CONFIRMED,
include: {
        service: true,
        practitioner: {
          include: {
            user: true,
user: true,
        beautyService: true,
        business: true,
// Add booking to calendar service
    const calendarService = new CalendarService();
    await calendarService.addBooking({
      id: updatedBooking.id,
      userId: updatedBooking.userId,
      practitionerId: updatedBooking.practitionerId,
      businessId: updatedBooking.businessId,
      serviceId: updatedBooking.serviceId,
      startTime: updatedBooking.startTime,
      endTime: updatedBooking.endTime,
      status: updatedBooking.status,
      notes: updatedBooking.notes || undefined,
      createdAt: updatedBooking.createdAt,
      updatedAt: updatedBooking.updatedAt,
return NextResponse.json(updatedBooking);
catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
