'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { EventsCalendar } from '@/components/events-calendar';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO, isAfter } from 'date-fns';
import { Event, EventCategory } from '@/types/events';
import { getEvents, getUpcomingEvents, registerForEvent } from '@/lib/api/events';
import { useAuth } from '@/hooks/useAuth';
import { 
  CalendarIcon, 
  ListBulletIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventRecommendations } from '@/components/event-recommendations';
import { CommunityEventsSection } from '@/components/community-events-section';

function EventsContent() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('list');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch events on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const allEvents = await getEvents();
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Get unique categories
  const categories = Array.from(new Set(events.map(event => event.category)));

  const handleEventShare = async (event: Event) => {
    if (!user?.id) return;
    
    try {
      const postContent = `I'm excited about this event! 🎉\n\n${event.title}\n${event.shortDescription}\n\nJoin me at ${format(parseISO(event.startDate), 'MMM d, yyyy h:mm a')}`;
      
      // In a real app, this would create a post in the social feed
      console.log('Sharing event:', event.title);
    } catch (err) {
      console.error('Error sharing event:', err);
    }
  };

  const handleEventAttendance = async (event: Event) => {
    if (!user?.id) return;
    
    try {
      await registerForEvent(event.id, user.id, user.user_metadata?.full_name || 'Anonymous', user.user_metadata?.avatar_url);
      
      // Refresh events
      const allEvents = await getEvents();
      setEvents(allEvents);
    } catch (err) {
      console.error('Error registering for event:', err);
    }
  };

  return (
    <Layout>
      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Community Events</h1>
                <p className="text-gray-600 mt-1">Join wellness events and connect with the community</p>
              </div>
              
              {user && (
                <Link href="/events/create">
                  <Button>Create Event</Button>
                </Link>
              )}
            </div>
            
            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="relative min-w-[200px]">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex rounded-md shadow-sm" role="group">
                  <button
                    className={`px-4 py-2 text-sm font-medium border flex items-center rounded-l-lg ${displayMode === 'list' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setDisplayMode('list')}
                  >
                    <ListBulletIcon className="h-5 w-5 mr-1" />
                    List
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium border flex items-center rounded-r-lg ${displayMode === 'calendar' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setDisplayMode('calendar')}
                  >
                    <CalendarIcon className="h-5 w-5 mr-1" />
                    Calendar
                  </button>
                </div>
              </div>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
                <p className="mt-1 text-gray-500">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your filters to find more events' 
                    : 'There are no upcoming events at the moment'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    className="mt-4 text-primary hover:underline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Calendar View */}
                {displayMode === 'calendar' && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <EventsCalendar events={filteredEvents} />
                  </div>
                )}
                
                {/* List View */}
                {displayMode === 'list' && (
                  <CommunityEventsSection
                    title=""
                    limit={filteredEvents.length}
                    showCreateButton={false}
                    showViewAllButton={false}
                    className="mt-0"
                  />
                )}
              </>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <EventRecommendations
              onShare={handleEventShare}
              onAttend={handleEventAttendance}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <EventsContent />
    </Suspense>
  );
} 