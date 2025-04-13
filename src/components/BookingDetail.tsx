import React, { useEffect, useState } from 'react';
import { Booking, typeSafeBookingService } from '../services/booking-service';
import { hasData, hasError, getResponseError } from '../utils/api-response-utils';
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
export const BookingDetail: React.FC<BookingDetailProps> = ({ 
  bookingId,
  onBack
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { captureError, showErrorToUser, createError } = useErrorHandler();

  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!bookingId) return;
      
      setIsLoading(true);
      try {
        const response = await typeSafeBookingService.getBooking(bookingId);

        if (hasData(response)) {
          setBooking(response.data);
        } else if (hasError(response)) {
          const error = createError(response.error, {
            severity: ErrorSeverity.ERROR,
            source: ErrorSource.API,
            category: ErrorCategory.API,
            metadata: { bookingId }
          });
          showErrorToUser(error);
        }
      } catch (error) {
        captureError(error instanceof Error ? error : String(error), {
          category: ErrorCategory.API,
          source: ErrorSource.API,
          metadata: { bookingId }
        });
        
        const appError = createError('Unable to load booking details. Please try again later.', {
          severity: ErrorSeverity.ERROR,
          source: ErrorSource.API,
          category: ErrorCategory.API
        });
        showErrorToUser(appError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, captureError, showErrorToUser, createError]);

  if (isLoading) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="booking-not-found">
        <h2>Booking Not Found</h2>
        <p>The booking you're looking for could not be found.</p>
        <button onClick={onBack} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="booking-detail">
      <div className="booking-detail-header">
        <h2>Booking Details</h2>
        <span className={`booking-status booking-status-${booking.status}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="booking-detail-section">
        <h3>Service Information</h3>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Service:</div>
          <div className="booking-detail-value">{booking.serviceName}</div>
        </div>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Provider:</div>
          <div className="booking-detail-value">{booking.providerName}</div>
        </div>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Date:</div>
          <div className="booking-detail-value">{booking.date}</div>
        </div>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Time:</div>
          <div className="booking-detail-value">{booking.time}</div>
        </div>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Duration:</div>
          <div className="booking-detail-value">{booking.duration} minutes</div>
        </div>
      </div>

      <div className="booking-detail-section">
        <h3>Customer Information</h3>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Name:</div>
          <div className="booking-detail-value">{booking.customerName}</div>
        </div>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Email:</div>
          <div className="booking-detail-value">{booking.customerEmail}</div>
        </div>
        {booking.customerPhone && (
          <div className="booking-detail-row">
            <div className="booking-detail-label">Phone:</div>
            <div className="booking-detail-value">{booking.customerPhone}</div>
          </div>
        )}
      </div>

      <div className="booking-detail-section">
        <h3>Payment Information</h3>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Price:</div>
          <div className="booking-detail-value">${booking.price.toFixed(2)}</div>
        </div>
        <div className="booking-detail-row">
          <div className="booking-detail-label">Payment Status:</div>
          <div className="booking-detail-value">{booking.paymentStatus}</div>
        </div>
      </div>

      {booking.notes && (
        <div className="booking-detail-section">
          <h3>Notes</h3>
          <div className="booking-detail-notes">{booking.notes}</div>
        </div>
      )}

      <div className="booking-detail-footer">
        <button onClick={onBack} className="back-button">
          Go Back
        </button>
      </div>
    </div>
  );
}; 