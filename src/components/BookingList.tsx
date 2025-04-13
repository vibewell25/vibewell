import React, { useEffect, useState } from 'react';
import { Booking, BookingStatus, typeSafeBookingService } from '../services/booking-service';
import { hasData, hasError, isSuccessResponse, getResponseError } from '../utils/api-response-utils';
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
export const BookingList: React.FC<BookingListProps> = ({ 
  status = 'confirmed', 
  providerId,
  onBookingSelect 
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { captureError, showErrorToUser, createError } = useErrorHandler();

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await typeSafeBookingService.getBookings({ 
          status,
          providerId
        });

        // Method 1: Using type guards
        if (hasData(response)) {
          // TypeScript knows response.data is defined
          setBookings(response.data);
        } else if (hasError(response)) {
          // TypeScript knows response.error is defined
          const error = createError(response.error, {
            severity: ErrorSeverity.ERROR,
            source: ErrorSource.API,
            category: ErrorCategory.API
          });
          showErrorToUser(error);
        }

        // Alternative Method 2: Using isSuccessResponse
        // if (isSuccessResponse(response)) {
        //   setBookings(response.data);
        // } else {
        //   const errorMessage = getResponseError(response);
        //   const error = createError(errorMessage, {
        //     severity: ErrorSeverity.ERROR,
        //     source: ErrorSource.API,
        //     category: ErrorCategory.API
        //   });
        //   showErrorToUser(error);
        // }
      } catch (error) {
        captureError(error instanceof Error ? error : String(error), {
          category: ErrorCategory.API,
          source: ErrorSource.API,
          metadata: { status, providerId }
        });
        
        const appError = createError('Unable to load bookings. Please try again later.', {
          severity: ErrorSeverity.ERROR,
          source: ErrorSource.API,
          category: ErrorCategory.API
        });
        showErrorToUser(appError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [status, providerId, captureError, showErrorToUser, createError]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await typeSafeBookingService.cancelBooking(bookingId);
      
      if (isSuccessResponse(response) && hasData(response)) {
        // Update the local state with the updated booking
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId ? response.data : booking
          ) as Booking[]
        );
        
        const successMsg = createError('Booking cancelled successfully', { 
          severity: ErrorSeverity.INFO,
          source: ErrorSource.CLIENT,
          category: ErrorCategory.API
        });
        showErrorToUser(successMsg);
      } else {
        const errorMessage = getResponseError(response, 'Failed to cancel booking');
        const error = createError(errorMessage, {
          severity: ErrorSeverity.ERROR,
          source: ErrorSource.API,
          category: ErrorCategory.API
        });
        showErrorToUser(error);
      }
    } catch (error) {
      captureError(error instanceof Error ? error : String(error), {
        category: ErrorCategory.API,
        source: ErrorSource.API,
        metadata: { bookingId }
      });
    }
  };

  if (isLoading) {
    return <div className="loading">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return <div className="empty-state">No bookings found</div>;
  }

  return (
    <div className="booking-list">
      <h2>Bookings ({bookings.length})</h2>
      <ul>
        {bookings.map(booking => (
          <li key={booking.id} className={`booking-item booking-status-${booking.status}`}>
            <div className="booking-header">
              <h3>{booking.serviceName}</h3>
              <span className="booking-status">{booking.status}</span>
            </div>
            
            <div className="booking-details">
              <p>
                <strong>Date:</strong> {booking.date} at {booking.time}
              </p>
              <p>
                <strong>Provider:</strong> {booking.providerName}
              </p>
              <p>
                <strong>Customer:</strong> {booking.customerName} ({booking.customerEmail})
              </p>
              {booking.notes && (
                <p className="booking-notes">
                  <strong>Notes:</strong> {booking.notes}
                </p>
              )}
            </div>
            
            <div className="booking-actions">
              <button 
                onClick={() => onBookingSelect?.(booking)}
                className="view-button"
              >
                View Details
              </button>
              
              {booking.status === 'confirmed' && (
                <button 
                  onClick={() => handleCancelBooking(booking.id)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 