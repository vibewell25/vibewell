import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, typeSafeBookingService } from '../services/booking-service';
import {
  hasData,
  hasError,
  isSuccessResponse,
  getResponseError,
} from '../utils/api-response-utils';
import { useErrorHandler } from '../utils/error-handler';
import { ErrorSource, ErrorCategory, ErrorSeverity } from '../utils/error-handler';

interface BookingListProps {
  status?: BookingStatus;
  providerId?: string;
  onBookingSelect?: (booking: Booking) => void;
}

/**
 * Component to display a list of bookings with proper type-safe API handling
 */
export {};
