import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

const Bookings: NextPage = () => {
  const [data, setData] = useState<any[]>([]);
  
  const fetchData = async () => {
    try {
      const res = await fetchWithTimeout('/api/bookings');
      const json = await res.json();
      setData(json.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link href="/book" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Book New
        </Link>
      </div>
      
      {data.length === 0 ? (
        <p>No bookings found. Book your first appointment now!</p>
      ) : (
        <div className="space-y-4">
          {data.map((booking) => (
            <div 
              key={booking.id} 
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <h3 className="font-medium">{booking.service.name || 'Unnamed Service'}</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(booking.appointmentDate).toLocaleDateString()} 
                  {' '}
                  {new Date(booking.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                {booking.specialRequests && (
                  <p className="text-gray-500 text-sm mt-1">Notes: {booking.specialRequests}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Link 
                  href={`/bookings/${booking.id}`}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                >
                  Details
                </Link>
                {booking.status !== 'cancelled' && (
                  <button 
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded text-sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this booking?')) {
                        // Add cancellation logic here
                      }
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
