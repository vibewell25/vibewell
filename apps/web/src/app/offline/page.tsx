import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiWifiOff, FiCalendar, FiRefreshCw, FiHome } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface CachedBooking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
export default function OfflinePage() {
  const [cachedBookings, setCachedBookings] = useState<CachedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Load cached data on component mount
  useEffect(() => {
    async function loadCachedData() {
      setIsLoading(true);
      try {
        // Open IndexedDB
        const request = indexedDB.open('vibewell', 1);
        
        request.onerror = () => {
          console.error('Failed to open IndexedDB');
          setIsLoading(false);
request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Try to get cached bookings
          try {
            const transaction = db.transaction(['cachedBookings', 'userSettings'], 'readonly');
            const bookingsStore = transaction.objectStore('cachedBookings');
            const settingsStore = transaction.objectStore('userSettings');
            
            // Get all bookings
            const bookingsRequest = bookingsStore.getAll();
            bookingsRequest.onsuccess = () => {
              setCachedBookings(bookingsRequest.result || []);
// Get last synced timestamp
            const syncRequest = settingsStore.get('lastSync');
            syncRequest.onsuccess = () => {
              if (syncRequest.result) {
                setLastSynced(syncRequest.result.timestamp);
transaction.oncomplete = () => {
              db.close();
              setIsLoading(false);
catch (error) {
            console.error('Error fetching cached data:', error);
            setIsLoading(false);
request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('cachedBookings')) {
            db.createObjectStore('cachedBookings', { keyPath: 'id' });
if (!db.objectStoreNames.contains('userSettings')) {
            db.createObjectStore('userSettings', { keyPath: 'id' });
catch (error) {
        console.error('Error in IndexedDB operation:', error);
        setIsLoading(false);
loadCachedData();
[]);
  
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
catch (e) {
      return dateString;
return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 p-4 pb-safe-bottom pt-safe-top">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <FiWifiOff className="h-16 w-16 text-indigo-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">You're Offline</h1>
            <p className="mb-6 text-gray-600">
              It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              size="mobile"
              variant="primary"
              className="w-full"
            >
              <FiRefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
          </div>
        </div>

        {/* Cached Bookings Section */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Cached Bookings</h2>
          
          {isLoading ? (
            <div className="py-4 text-center text-gray-500">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
              Loading cached data...
            </div>
          ) : cachedBookings.length > 0 ? (
            <div className="space-y-3">
              {cachedBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{booking.serviceName}</h3>
                      <p className="text-sm text-gray-600">
                        <span>{formatDate(booking.date)}</span> • <span>{booking.time}</span>
                      </p>
                    </div>
                    <div className="rounded-full bg-indigo-100 p-2">
                      <FiCalendar className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
              ))}
              
              {lastSynced && (
                <p className="mt-4 text-right text-xs text-gray-500">
                  Last synced: {new Date(lastSynced).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-600">No cached bookings available.</p>
              <p className="mt-2 text-sm text-gray-500">
                Your bookings will appear here when you're online and have made bookings.
              </p>
            </div>
          )}
        </div>
        
        {/* Navigation Options */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-3 text-lg font-medium text-gray-900">While you're offline, you can:</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2 rounded-full bg-green-100 p-1">✓</span>
              View your cached bookings
            </li>
            <li className="flex items-center">
              <span className="mr-2 rounded-full bg-green-100 p-1">✓</span>
              Access saved content
            </li>
            <li className="flex items-center">
              <span className="mr-2 rounded-full bg-green-100 p-1">✓</span>
              Browse your profile information
            </li>
          </ul>
          
          <div className="mt-6">
            <Link href="/">
              <Button 
                variant="outline" 
                size="mobile"
                className="w-full"
              >
                <FiHome className="mr-2 h-5 w-5" />
                Go to Home Screen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
