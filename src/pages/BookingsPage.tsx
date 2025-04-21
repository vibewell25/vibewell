import React from 'react';
import { BookingApp } from '../components/BookingApp';
import '../styles/booking.css';

/**
 * Example page that uses the BookingApp component
 */
export const BookingsPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Booking Management</h1>
        <p>Manage all your bookings with our type-safe, error-resilient booking system</p>
      </div>

      <div className="page-content">
        <BookingApp />
      </div>

      <div className="page-footer">
        <p>
          This example demonstrates the use of type-safe booking service with proper error handling.
          The implementation showcases:
        </p>
        <ul>
          <li>Type-safe API response handling with utility functions</li>
          <li>Consistent error handling with structured error objects</li>
          <li>Clean component separation with reusable patterns</li>
          <li>Responsive design for all device sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingsPage;
