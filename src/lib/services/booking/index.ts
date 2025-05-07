/**
 * Booking service implementation
 */
import prisma from '../../prisma';
import type { Booking } from '../../prisma';
import { addMinutes, startOfDay, endOfDay, areIntervalsOverlapping } from 'date-fns';

// Booking interface
export interface BookingData {
  id?: string;
  userId: string;
  businessId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status?: 'pending' | 'confirmed' | 'canceled' | 'completed';
}

// Booking response interface
export interface BookingResponse {
  booking: Booking | null;
  success: boolean;
  message?: string;
}

// Available time slot interface
export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

/**
 * Create a new booking
 */
export async function createBooking(data: BookingData): Promise<BookingResponse> {
  try {
    // Validate if time slot is available
    const isAvailable = await isTimeSlotAvailable(
      data.businessId,
      data.serviceId,
      data.startTime,
      data.endTime
    );
    
    if (!isAvailable) {
      return {
        booking: null,
        success: false,
        message: 'The selected time slot is not available'
      };
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        businessId: data.businessId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status || 'pending'
      }
    });
    
    return {
      booking,
      success: true
    };
  } catch (error) {
    return {
      booking: null,
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create booking'
    };
  }
}

/**
 * Get a booking by ID
 */
export async function getBooking(id: string): Promise<Booking | null> {
  return prisma.booking.findUnique({ where: { id } });
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  return prisma.booking.findMany({ where: { userId } });
}

/**
 * Get all bookings for a business
 */
export async function getBusinessBookings(businessId: string): Promise<Booking[]> {
  return prisma.booking.findMany({ where: { businessId } });
}

/**
 * Update a booking status
 */
export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'canceled' | 'completed'
): Promise<BookingResponse> {
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    
    return {
      booking,
      success: true
    };
  } catch (error) {
    return {
      booking: null,
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update booking status'
    };
  }
}

/**
 * Get available time slots for a service
 */
export async function getAvailableTimeSlots(
  businessId: string,
  serviceId: string,
  date: Date
): Promise<TimeSlot[]> {
  // Get business hours for the day
  const businessHours = await prisma.businessHours.findFirst({
    where: {
      businessId,
      dayOfWeek: date.getDay()
    }
  });
  
  if (!businessHours || !businessHours.isOpen) {
    return [];
  }
  
  // Get service details for duration
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  
  if (!service) {
    throw new Error(`Service ${serviceId} not found`);
  }
  
  const serviceDuration = service.durationMinutes;
  
  // Get existing bookings for that day
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  const existingBookings = await prisma.booking.findMany({
    where: {
      businessId,
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
      status: { in: ['pending', 'confirmed'] }
    }
  });
  
  // Calculate available slots
  const openingTime = new Date(date);
  openingTime.setHours(
    parseInt(businessHours.openingTime.split(':')[0]),
    parseInt(businessHours.openingTime.split(':')[1]),
    0, 0
  );
  
  const closingTime = new Date(date);
  closingTime.setHours(
    parseInt(businessHours.closingTime.split(':')[0]),
    parseInt(businessHours.closingTime.split(':')[1]),
    0, 0
  );
  
  const slots: TimeSlot[] = [];
  let currentTime = openingTime;
  
  while (addMinutes(currentTime, serviceDuration) <= closingTime) {
    const slotEndTime = addMinutes(currentTime, serviceDuration);
    
    const isOverlapping = existingBookings.some(booking => 
      areIntervalsOverlapping(
        { start: currentTime, end: slotEndTime },
        { start: booking.startTime, end: booking.endTime }
      )
    );
    
    slots.push({
      startTime: new Date(currentTime),
      endTime: slotEndTime,
      isAvailable: !isOverlapping
    });
    
    // Move to next slot (e.g., 30-minute intervals)
    currentTime = addMinutes(currentTime, 30);
  }
  
  return slots;
}

/**
 * Check if a time slot is available
 */
export async function isTimeSlotAvailable(
  businessId: string,
  serviceId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  // Check if business is open during the requested time
  const businessHours = await prisma.businessHours.findFirst({
    where: {
      businessId,
      dayOfWeek: startTime.getDay()
    }
  });
  
  if (!businessHours || !businessHours.isOpen) {
    return false;
  }
  
  // Check business hours
  const openingTime = new Date(startTime);
  openingTime.setHours(
    parseInt(businessHours.openingTime.split(':')[0]),
    parseInt(businessHours.openingTime.split(':')[1]),
    0, 0
  );
  
  const closingTime = new Date(startTime);
  closingTime.setHours(
    parseInt(businessHours.closingTime.split(':')[0]),
    parseInt(businessHours.closingTime.split(':')[1]),
    0, 0
  );
  
  if (startTime < openingTime || endTime > closingTime) {
    return false;
  }
  
  // Check for overlapping bookings
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { in: ['pending', 'confirmed'] },
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime }
        }
      ]
    }
  });
  
  return overlappingBookings.length === 0;
} 