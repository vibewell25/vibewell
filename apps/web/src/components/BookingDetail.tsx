import React, { useEffect, useState } from 'react';
import { typeSafeBookingService } from '../services/BookingService';
import { hasData, hasError } from '@/utils/ApiResponseUtils';
import { useErrorHandler } from '@/utils/ErrorHandler';
import { ErrorCategory, ErrorSeverity, ErrorSource } from '@/utils/ErrorHandler';

interface BookingDetailProps {
  bookingId: string;
  onBack?: () => void;
/**
 * Component to display detailed information about a single booking
 * with proper type-safe API handling
 */
export {};
