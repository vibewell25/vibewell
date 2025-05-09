import React, { useState } from 'react';
import { BookingList } from './BookingList';
import { BookingDetail } from './BookingDetail';
import { Booking, BookingStatus } from '../services/BookingService';
import { ErrorHandlerProvider } from '@/utils/ErrorHandler';

interface BookingAppProps {
  providerId?: string;
  initialStatus?: BookingStatus;
/**
 * Main Booking management application component that integrates
 * the BookingList and BookingDetail components with error handling
 */
export {};
