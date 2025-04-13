import React, { useState } from 'react';
import { BookingList } from './BookingList';
import { BookingDetail } from './BookingDetail';
import { Booking, BookingStatus } from '../services/booking-service';
import { ErrorHandlerProvider } from '../utils/error-handler';

interface BookingAppProps {
  providerId?: string;
  initialStatus?: BookingStatus;
}

/**
 * Main Booking management application component that integrates
 * the BookingList and BookingDetail components with error handling
 */
export const BookingApp: React.FC<BookingAppProps> = ({
  providerId,
  initialStatus = 'confirmed'
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(initialStatus);

  // Handle booking selection
  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  // Handle going back to the list
  const handleBackToList = () => {
    setSelectedBooking(null);
  };

  // Handle status filter changes
  const handleStatusChange = (status: BookingStatus) => {
    setCurrentStatus(status);
    // Clear selected booking when changing filters
    setSelectedBooking(null);
  };

  return (
    <ErrorHandlerProvider>
      <div className="booking-app">
        <header className="booking-app-header">
          <h1>Booking Management</h1>
          
          {!selectedBooking && (
            <div className="booking-status-filters">
              <button 
                className={`status-filter ${currentStatus === 'pending' ? 'active' : ''}`}
                onClick={() => handleStatusChange('pending')}
              >
                Pending
              </button>
              <button 
                className={`status-filter ${currentStatus === 'confirmed' ? 'active' : ''}`}
                onClick={() => handleStatusChange('confirmed')}
              >
                Confirmed
              </button>
              <button 
                className={`status-filter ${currentStatus === 'completed' ? 'active' : ''}`}
                onClick={() => handleStatusChange('completed')}
              >
                Completed
              </button>
              <button 
                className={`status-filter ${currentStatus === 'cancelled' ? 'active' : ''}`}
                onClick={() => handleStatusChange('cancelled')}
              >
                Cancelled
              </button>
            </div>
          )}
        </header>

        <main className="booking-app-content">
          {selectedBooking ? (
            <BookingDetail 
              bookingId={selectedBooking.id} 
              onBack={handleBackToList} 
            />
          ) : (
            <BookingList 
              status={currentStatus}
              providerId={providerId}
              onBookingSelect={handleBookingSelect}
            />
          )}
        </main>
      </div>
    </ErrorHandlerProvider>
  );
}; 