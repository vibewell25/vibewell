import React, { useEffect, useState } from 'react';
import { typeSafeBookingService } from '../services/booking-service';
import { hasData, hasError } from '../utils/api-response-utils';
import { useErrorHandler } from '../utils/error-handler';
import { ErrorCategory, ErrorSeverity, ErrorSource } from '../utils/error-handler';

interface BookingDetailProps {
  bookingId: string;
  onBack?: () => void;
}

/**
 * Component to display detailed information about a single booking
 * with proper type-safe API handling
 */
export {};
