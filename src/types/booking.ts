import { BookingStatus } from '@prisma/client';

export interface Booking {
  id: string;
  userId: string;
  practitionerId: string;
  businessId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

export interface RecurringBooking {
  id: string;
  bookingId: string;
  frequency: RecurringFrequency;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum RecurringFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  serviceId: string;
  preferredDate: Date;
  preferredTimeSlot?: string;
  status: WaitlistStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum WaitlistStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  BOOKED = 'BOOKED',
  EXPIRED = 'EXPIRED'
}

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  averageBookingValue: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CreateBookingDTO {
  userId: string;
  practitionerId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface UpdateBookingDTO {
  status?: BookingStatus;
  notes?: string;
  startTime?: Date;
  endTime?: Date;
} 