import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-unified-auth';

interface BusinessStats {
  totalBookings: number;
  totalRevenue: number;
  activeCustomers: number;
  averageRating: number;
}

interface BusinessDashboardProps {
  className?: string;
}

export function BusinessDashboard({ className = '' }: BusinessDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessStats();
  }, []);

  const fetchBusinessStats = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch('/api/business/stats');
      if (!response?.ok) throw new Error('Failed to fetch business stats');
      const data = await response?.json();
      setStats(data);
    } catch (error) {
      console?.error('Error fetching business stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons?.Spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={className}>
      <h1 className="mb-8 text-3xl font-bold">Business Dashboard</h1>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0?.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCustomers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0?.0'} ⭐</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Business Name</Label>
                  <Input placeholder="Enter business name" />
                </div>
                <div>
                  <Label>Business Description</Label>
                  <Input placeholder="Enter business description" />
                </div>
                <div>
                  <Label>Contact Information</Label>
                  <Input placeholder="Enter contact information" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Add New Service</Button>
                {/* Service list will go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Add Staff Member</Button>
                {/* Staff list will go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Export Customer List</Button>
                {/* Customer list will go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
