'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowRightIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useWellnessData } from '@/hooks/useWellnessData';
import { parseISO, format } from 'date-fns';
import { Event } from '@/types/events';
import { getUpcomingEvents } from '@/lib/api/events';
import { CommunityEventsSection } from '@/components/community-events-section';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [greeting, setGreeting] = useState('');
  const { summary, isLoading: wellnessLoading } = useWellnessData();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  useEffect(() => {
    // Fetch events
    const fetchEvents = async () => {
      try {
        // Use our events API instead of a fetch call
        const upcomingEvents = await getUpcomingEvents(3);
        setEvents(upcomingEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {greeting}, {user?.user_metadata?.full_name || 'there'}!
          </h1>
          <p className="text-muted-foreground">Welcome to your wellness dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="text-lg font-semibold mb-2">Wellness Score</h3>
            <div className="text-3xl font-bold mb-2">78/100</div>
            <p className="text-sm text-muted-foreground">
              Your score increased by 5 points this week!
            </p>
          </div>

          <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5">
            <h3 className="text-lg font-semibold mb-2">Upcoming Sessions</h3>
            <div className="text-3xl font-bold mb-2">2</div>
            <p className="text-sm text-muted-foreground">
              Next: Yoga with Sarah, tomorrow at 10:00 AM
            </p>
          </div>

          <div className="card bg-gradient-to-br from-accent/10 to-accent/5">
            <h3 className="text-lg font-semibold mb-2">Activity Streak</h3>
            <div className="text-3xl font-bold mb-2">
              {wellnessLoading ? "..." : (summary?.dailyStreak || 0)} days
            </div>
            <p className="text-sm text-muted-foreground">
              Keep it going! You're on a roll.
            </p>
          </div>
        </div>

        {/* Progress Widget */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Progress</h2>
            <Link 
              href="/wellness/progress" 
              className="text-primary flex items-center hover:underline"
            >
              Track All Goals <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="card">
            {wellnessLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading your progress...</div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Meditation Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>🧘‍♂️</span>
                      <span className="text-sm font-medium">Meditation</span>
                    </div>
                    <span className="text-sm">{summary.thisWeekProgress.meditation} mins this week</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.thisWeekProgress.meditation / 120) * 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Workout Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>🏋️‍♂️</span>
                      <span className="text-sm font-medium">Workout</span>
                    </div>
                    <span className="text-sm">{summary.thisWeekProgress.workout} mins this week</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.thisWeekProgress.workout / 180) * 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Water Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>💧</span>
                      <span className="text-sm font-medium">Water</span>
                    </div>
                    <span className="text-sm">{summary.thisWeekProgress.water} glasses this week</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.thisWeekProgress.water / 56) * 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Steps Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>👣</span>
                      <span className="text-sm font-medium">Steps</span>
                    </div>
                    <span className="text-sm">{summary.thisWeekProgress.steps.toLocaleString()} steps this week</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (summary.thisWeekProgress.steps / 70000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No progress data found. Start tracking your wellness journey!</p>
                <Link href="/wellness/progress" className="btn-primary">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Set Up Goals
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Activities */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recommended For You</h2>
            <Link 
              href="/wellness" 
              className="text-primary flex items-center hover:underline"
            >
              View all <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedActivities.map((activity, index) => (
              <div key={index} className="card">
                <div className="h-40 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <p className="text-muted-foreground">Activity Image</p>
                </div>
                <h3 className="text-lg font-semibold mb-1">{activity.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary">{activity.duration}</span>
                  <Link 
                    href={activity.link} 
                    className="btn-primary text-sm py-1"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Events */}
        <CommunityEventsSection
          title="Community Events"
          limit={3}
          showCreateButton={true}
          showViewAllButton={true}
          className="mt-12"
        />
      </div>
    </Layout>
  );
}

const recommendedActivities = [
  {
    title: '5-Minute Mindfulness',
    description: 'A quick mindfulness session to center yourself and reduce stress.',
    duration: '5 mins',
    link: '/wellness/mindfulness/quick-session',
  },
  {
    title: 'Morning Stretches',
    description: 'Simple stretches to wake up your body and prepare for the day.',
    duration: '10 mins',
    link: '/wellness/physical/morning-stretches',
  },
  {
    title: 'Breathing Exercises',
    description: 'Breathing techniques to improve focus and reduce anxiety.',
    duration: '8 mins',
    link: '/wellness/breathing/exercises',
  },
]; 