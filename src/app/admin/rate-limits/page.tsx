/**
 * Admin Rate Limiting Dashboard
 * Displays rate limiting events and provides tools for monitoring and analysis
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { prisma } from '@/lib/database/client';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, Clock, RefreshCw, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Grid, GridItem } from '@/components/ui/grid';
import { HStack, VStack } from '@/components/ui/stack';

// Interface for rate limit events
interface RateLimitEvent {
  id: string;
  ip: string;
  path: string;
  method: string;
  limiterType: string;
  timestamp: number;
  exceeded: boolean;
  remaining?: number;
  count?: number;
  limit?: number;
  retryAfter?: number;
  resetTime: number;
  suspicious: boolean;
  approaching?: boolean;
  overLimitFactor?: number;
}

interface SuspiciousIP {
  ip: string;
  count: number;
  recentEvents: RateLimitEvent[];
}

// Main Admin Rate Limiting Dashboard Component
export default function RateLimitDashboard() {
  const router = useRouter();
  const { user, isLoading: userLoading, error: userError } = useUser();
  const [events, setEvents] = useState<RateLimitEvent[]>([]);
  const [suspiciousIPs, setSuspiciousIPs] = useState<SuspiciousIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [statsData, setStatsData] = useState<any[]>([]);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading'
  );
  const [redisClient, setRedisClient] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Load Redis client dynamically
  useEffect(() => {
    const loadRedisClient = async () => {
      try {
        const module = await import('@/lib/redis-client');
        setRedisClient(module.default);
      } catch (error) {
        console.error('Error loading Redis client:', error);
        toast({
          title: 'Error loading Redis client',
          description: 'Rate limit data may not be available',
          variant: 'destructive',
        });
      }
    };

    loadRedisClient();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (userLoading) return;

        if (userError) {
          throw userError;
        }

        if (user) {
          setAuthStatus('authenticated');

          // Fetch user role from database
          const response = await fetch('/api/user/role');
          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          setUserRole(data.role);

          // Check if user is admin
          if (data.role !== 'admin') {
            router.push('/forbidden');
          } else if (redisClient) {
            fetchRateLimitEvents();
          }
        } else {
          setAuthStatus('unauthenticated');
          router.push('/api/auth/login?returnTo=/admin/rate-limits');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuthStatus('unauthenticated');
        router.push('/api/auth/login?returnTo=/admin/rate-limits');
      }
    };

    checkAuth();
  }, [user, userLoading, userError, router, redisClient]);

  // Fetch data when filters change
  useEffect(() => {
    if (authStatus === 'authenticated' && userRole === 'admin' && redisClient) {
      fetchRateLimitEvents();
    }
  }, [timeRange, filter, authStatus, userRole, redisClient]);

  // Fetch rate limit events from Redis
  const fetchRateLimitEvents = async () => {
    if (!redisClient) return;

    try {
      setLoading(true);

      // Fetch rate limit events from Redis
      const events = await redisClient.getRateLimitEvents(500);
      const suspiciousIPs = await redisClient.getSuspiciousIPs(20);

      // Filter events based on selected criteria
      let filteredEvents = [...events];

      // Filter by time range
      const now = Date.now();
      const timeRangeMs =
        timeRange === '24h'
          ? 24 * 60 * 60 * 1000
          : timeRange === '1h'
            ? 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;

      filteredEvents = filteredEvents.filter(e => now - e.timestamp <= timeRangeMs);

      // Filter by limiter type
      if (filter !== 'all') {
        if (filter === 'suspicious') {
          filteredEvents = filteredEvents.filter(e => e.suspicious === true);
        } else {
          filteredEvents = filteredEvents.filter(e =>
            e.limiterType.toLowerCase().includes(filter.toLowerCase())
          );
        }
      }

      // Sort by timestamp, most recent first
      filteredEvents.sort((a, b) => b.timestamp - a.timestamp);

      setEvents(filteredEvents);
      setSuspiciousIPs(suspiciousIPs);

      // Generate statistics for charts
      generateStatsData(filteredEvents);
    } catch (error) {
      console.error('Error fetching rate limit events:', error);
      toast({
        title: 'Error fetching rate limit data',
        description: 'There was a problem retrieving rate limit events from Redis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate statistics for visualization
  const generateStatsData = (events: RateLimitEvent[]) => {
    // Count events by limiter type
    const limiterCounts: Record<string, { exceeded: number; allowed: number }> = {};

    events.forEach(event => {
      const limiterType = event.limiterType || 'unknown';

      if (!limiterCounts[limiterType]) {
        limiterCounts[limiterType] = { exceeded: 0, allowed: 0 };
      }

      if (event.exceeded) {
        limiterCounts[limiterType].exceeded++;
      } else {
        limiterCounts[limiterType].allowed++;
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(limiterCounts).map(([name, counts]) => ({
      name,
      exceeded: counts.exceeded,
      allowed: counts.allowed,
    }));

    setStatsData(chartData);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRateLimitEvents();
  };

  // Handle suspicious events filtering
  const showSuspiciousOnly = () => {
    setFilter('suspicious');
  };

  // Calculate how long ago an event occurred
  const timeAgo = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Clear old events
  const clearOldEvents = async () => {
    if (!redisClient) return;

    try {
      setLoading(true);
      // Clear events older than the selected time range
      const timeRangeMs =
        timeRange === '24h'
          ? 24 * 60 * 60 * 1000
          : timeRange === '1h'
            ? 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;

      const cleared = await redisClient.clearOldRateLimitEvents(timeRangeMs);

      toast({
        title: 'Events cleared',
        description: `${cleared} old events were removed from storage`,
      });

      // Refresh the data
      fetchRateLimitEvents();
    } catch (error) {
      console.error('Error clearing old events:', error);
      toast({
        title: 'Error clearing events',
        description: 'There was a problem clearing old rate limit events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rate Limiting Dashboard</h1>
        <HStack spacing="sm">
          <select
            className="border rounded px-2 py-1"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <select
            className="border rounded px-2 py-1"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="auth">Authentication</option>
            <option value="password">Password Reset</option>
            <option value="signup">User Signup</option>
            <option value="financial">Financial Operations</option>
            <option value="admin">Admin Operations</option>
            <option value="suspicious">Suspicious Events</option>
          </select>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center">
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={clearOldEvents}>
            Clear Old Events
          </Button>
        </HStack>
      </div>

      {/* Statistics Cards */}
      <Grid className="mb-6" columns={4} gap="md">
        <GridItem>
          <Card className="p-4">
            <h3 className="font-semibold">Total Events</h3>
            <p className="text-2xl">{events.length}</p>
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-4">
            <h3 className="font-semibold">Rate Limited</h3>
            <p className="text-2xl text-amber-500">{events.filter(e => e.exceeded).length}</p>
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-4">
            <h3 className="font-semibold">Suspicious Activity</h3>
            <p className="text-2xl text-red-500">{events.filter(e => e.suspicious).length}</p>
          </Card>
        </GridItem>
        <GridItem>
          <Card className="p-4">
            <h3 className="font-semibold">Unique IPs</h3>
            <p className="text-2xl">{new Set(events.map(e => e.ip)).size}</p>
          </Card>
        </GridItem>
      </Grid>

      {/* Visualization */}
      {statsData.length > 0 && (
        <Card className="p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Rate Limiting by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="allowed" stackId="a" fill="#82ca9d" name="Allowed Requests" />
              <Bar dataKey="exceeded" stackId="a" fill="#f87171" name="Rate Limited" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Grid layout for tables */}
      <Grid className="mb-6" columns={12} gap="md">
        {/* Rate Limit Events Table */}
        <GridItem span={8}>
          <Card>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Rate Limit Events</h2>
              <p className="text-sm text-gray-600 mb-4">
                Showing {events.length} events from {filter === 'all' ? 'all categories' : filter}
              </p>
            </div>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Limiter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length > 0 ? (
                    events.map(event => (
                      <TableRow key={event.id} className={event.suspicious ? 'bg-red-50' : ''}>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {timeAgo(event.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>{event.ip}</TableCell>
                        <TableCell className="font-mono text-xs truncate max-w-[150px]">
                          {event.path}
                        </TableCell>
                        <TableCell>{event.limiterType}</TableCell>
                        <TableCell>
                          {event.exceeded ? (
                            <span className="flex items-center text-red-500">
                              <X className="h-4 w-4 mr-1" />
                              Blocked
                            </span>
                          ) : (
                            <span className="flex items-center text-green-500">
                              <Check className="h-4 w-4 mr-1" />
                              Allowed
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.remaining !== undefined && event.limit !== undefined && (
                            <span>
                              {event.remaining}/{event.limit}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <VStack>
                          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-muted-foreground">No rate limit events found</p>
                        </VStack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </GridItem>

        {/* Suspicious IPs Table */}
        <GridItem span={4}>
          <Card>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Suspicious IPs</h2>
              <p className="text-sm text-gray-600 mb-4">IPs with multiple rate limit violations</p>
            </div>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Violations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousIPs.length > 0 ? (
                    suspiciousIPs.map(ip => (
                      <TableRow key={ip.ip}>
                        <TableCell>{ip.ip}</TableCell>
                        <TableCell>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            {ip.count}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-10">
                        <VStack>
                          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-muted-foreground">No suspicious IPs detected</p>
                        </VStack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
}
